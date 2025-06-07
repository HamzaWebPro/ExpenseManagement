'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardHeader,
  CardContent,
  Grid,
  CardActions
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { IconPlus, IconTrash, IconEye, IconPencil, IconChevronRight } from '@tabler/icons-react'
import Cookies from 'js-cookie'
import decryptDataObject from '@/@menu/utils/decrypt'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useForm, Controller } from 'react-hook-form'
import formatDate from '@/@menu/utils/formatDate'
import TablePagination from '@mui/material/TablePagination'
import { CSVLink } from 'react-csv'

const DailyFinancialEntry = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const sessionToken = Cookies.get('sessionToken')
  const backendPostToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_POST_TOKEN
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  // Get current user role
  const currentUser = sessionToken ? JSON.parse(decryptDataObject(sessionToken)) : null
  const role = currentUser?.role || ''

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    paymentMethod: 'cash',
    description: '',
    products: [{ productId: '', quantity: 1 }]
  })
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [entries, setEntries] = useState([])
  const [filteredEntries, setFilteredEntries] = useState([])
  const [loading, setLoading] = useState({
    users: true,
    products: true,
    entries: true,
    submitting: false
  })
  const [error, setError] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Filter states for super admin
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  })
  const [stores, setStores] = useState([])
  const [selectedStore, setSelectedStore] = useState('')
  const [managers, setManagers] = useState([])
  const [selectedManager, setSelectedManager] = useState('')

  const fetchUser = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }))
      let token = decryptDataObject(sessionToken)
      token = JSON.parse(token)
      token = token?.tokens

      const setTokenInJson = JSON.stringify({
        getToken: backendGetToken,
        loginToken: token
      })

      const endpoint = role === 'superAdmin' ? 'all-user' : 'all-added-user'
      const response = await axios.get(`${baseUrl}/backend/authentication/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      const usersArr = response?.data?.success?.data || []
      setUsers(usersArr)

      // For super admin, also categorize users
      if (role === 'superAdmin') {
        const storesArr = usersArr.filter(user => user.role === 'admin')
        const managersArr = usersArr.filter(user => user.role === 'manager')
        setStores(storesArr)
        setManagers(managersArr)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(prev => ({ ...prev, products: true }))
      let token = decryptDataObject(sessionToken)
      token = JSON.parse(token)
      token = token?.tokens

      const setTokenInJson = JSON.stringify({
        getToken: backendGetToken,
        loginToken: token
      })

      const response = await axios.get(`${baseUrl}/backend/product/all`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      const productsArr = response?.data?.data || []
      setProducts(productsArr)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, products: false }))
    }
  }

  const fetchFinancialEntries = async () => {
    try {
      setLoading(prev => ({ ...prev, entries: true }))
      let token = decryptDataObject(sessionToken)
      token = JSON.parse(token)
      token = token?.tokens

      const setTokenInJson = JSON.stringify({
        getToken: backendGetToken,
        loginToken: token
      })

      const response = await axios.get(`${baseUrl}/backend/financial/all-store-entry`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      console.log('entry', response)

      const entriesArr = response?.data?.data || []
      setEntries(entriesArr)
      setFilteredEntries(entriesArr)
    } catch (error) {
      console.error('Error fetching financial entries:', error)
      setError('Failed to load financial entries. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, entries: false }))
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchUser()
    fetchFinancialEntries()
  }, [role])

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...entries]

    // Check if any filters are active
    const hasStartDate = dateRange.startDate
    const hasEndDate = dateRange.endDate
    const hasStoreFilter = selectedStore
    const hasManagerFilter = selectedManager

    // Only apply filters if at least one is active
    if (hasStartDate || hasEndDate || hasStoreFilter || hasManagerFilter) {
      // Apply date filter if dates are selected
      if (hasStartDate || hasEndDate) {
        const start = hasStartDate ? new Date(dateRange.startDate) : null
        const end = hasEndDate ? new Date(dateRange.endDate) : hasStartDate ? new Date() : null

        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.createdAt)

          // Case 1: Only start date selected - show from start date to today
          if (start && !end) {
            return entryDate >= start && entryDate <= new Date()
          }
          // Case 2: Only end date selected - show everything up to end date
          else if (!start && end) {
            return entryDate <= end
          }
          // Case 3: Both dates selected - show between dates
          else if (start && end) {
            return entryDate >= start && entryDate <= end
          }

          return true
        })
      }

      // Apply store filter if store is selected
      if (hasStoreFilter) {
        filtered = filtered.filter(entry => {
          return entry.store?._id === selectedStore || entry.addedBy?.store?._id === selectedStore
        })
      }

      // Apply manager filter if manager is selected
      if (hasManagerFilter) {
        filtered = filtered.filter(entry => {
          return entry.addedBy?._id === selectedManager
        })
      }
    }

    setFilteredEntries(filtered)
    setPage(0) // Reset to first page when filters change
  }

  // Handle date range change
  const handleDateRangeChange = (type, date) => {
    setDateRange(prev => ({
      ...prev,
      [type]: date
    }))
  }

  // Handle store change
  const handleStoreChange = e => {
    setSelectedStore(e.target.value)
    setSelectedManager('') // Reset manager when store changes
  }

  // Handle manager change
  const handleManagerChange = e => {
    setSelectedManager(e.target.value)
  }

  // Reset all filters
  const resetFilters = () => {
    setDateRange({
      startDate: null,
      endDate: null
    })
    setSelectedStore('')
    setSelectedManager('')
    setFilteredEntries(entries)
    setPage(0)
  }

  // Handle input changes
  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle product changes
  const handleProductChange = (index, e) => {
    const { name, value } = e.target
    const updatedProducts = [...formData.products]

    if (name === 'quantity') {
      // Ensure quantity is a positive integer
      const intValue = Math.max(1, parseInt(value) || 1)
      updatedProducts[index] = {
        ...updatedProducts[index],
        [name]: intValue
      }
    } else {
      updatedProducts[index] = {
        ...updatedProducts[index],
        [name]: value
      }
    }

    setFormData(prev => ({ ...prev, products: updatedProducts }))
  }

  // Add new product row
  const addProductRow = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { productId: '', quantity: 1 }]
    }))
  }

  // Remove product row
  const removeProductRow = index => {
    if (formData.products.length <= 1) return
    const updatedProducts = [...formData.products]
    updatedProducts.splice(index, 1)
    setFormData(prev => ({ ...prev, products: updatedProducts }))
  }

  // Calculate total amount
  const calculateTotal = () => {
    return formData.products.reduce((total, item) => {
      const product = products.find(p => p._id === item.productId)
      return total + (product ? product.price * item.quantity : 0)
    }, 0)
  }

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      setLoading(prev => ({ ...prev, submitting: true }))
      const totalAmount = calculateTotal()

      let token = decryptDataObject(sessionToken)
      token = JSON.parse(token)
      token = token?.tokens

      const submissionData = {
        userId: formData.userId,
        amount: totalAmount,
        paymentMethod: formData.paymentMethod,
        description: formData.description,
        products: formData.products.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      }

      const setTokenInJson = JSON.stringify({
        postToken: backendPostToken,
        loginToken: token
      })

      const response = await axios.post(`${baseUrl}/backend/financial/store`, submissionData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        }
      })

      if (response.data.message) {
        // Reset form after successful submission
        setFormData({
          userId: '',
          paymentMethod: 'cash',
          description: '',
          products: [{ productId: '', quantity: 1 }]
        })
        toast.success('Entry submitted successfully!')
        fetchFinancialEntries()
      } else {
        toast.error(response.data.message || 'Failed to submit entry')
      }
    } catch (error) {
      console.error('Submission error:', error)
      toast.error(error.response?.data?.message || 'Failed to submit entry. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }

  // Handle view entry details
  const handleViewEntry = entry => {
    setSelectedEntry(entry)
    setViewDialogOpen(true)
  }

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  // Handle rows per page change
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (loading.users || loading.products) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error && role == 'superAdmin') {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
        <Typography color='error'>{error}</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        Daily Financial Entry
      </Typography>

      {role == 'manager' && (
        <Card>
          <CardHeader title='Add New Entry' />
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* User Selection */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id='user-select-label'>Select User</InputLabel>
                    <Select
                      labelId='user-select-label'
                      id='userId'
                      name='userId'
                      value={formData.userId}
                      label='Select User'
                      onChange={handleInputChange}
                      required
                    >
                      {users.map(user => (
                        <MenuItem key={user._id} value={user._id}>
                          {user.uname}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  {/* Payment Method */}
                  <FormControl component='fieldset'>
                    <Typography component='legend'>Payment Method</Typography>
                    <RadioGroup row name='paymentMethod' value={formData.paymentMethod} onChange={handleInputChange}>
                      <FormControlLabel value='cash' control={<Radio />} label='Cash' />
                      <FormControlLabel value='card' control={<Radio />} label='Card' />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Description'
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                {/* Products Selection */}
                <Grid item xs={12}>
                  <Typography variant='h6' gutterBottom>
                    Products
                  </Typography>

                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Subtotal</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.products.map((product, index) => {
                          const selectedProduct = products.find(p => p._id === product.productId)
                          const subtotal = selectedProduct ? selectedProduct.price * product.quantity : 0

                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <FormControl fullWidth>
                                  <InputLabel>Select Product</InputLabel>
                                  <Select
                                    name='productId'
                                    value={product.productId}
                                    onChange={e => handleProductChange(index, e)}
                                    required
                                    disabled={products.length === 0}
                                  >
                                    <MenuItem value=''>Select a product</MenuItem>
                                    {products.map(prod => (
                                      <MenuItem key={prod._id} value={prod._id}>
                                        {prod.name} (${prod.price.toFixed(2)})
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </TableCell>
                              <TableCell>
                                <TextField
                                  type='number'
                                  name='quantity'
                                  value={product.quantity}
                                  onChange={e => handleProductChange(index, e)}
                                  inputProps={{ min: 1, step: 1 }}
                                  required
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>{selectedProduct ? `$${selectedProduct.price.toFixed(2)}` : '-'}</TableCell>
                              <TableCell>${subtotal.toFixed(2)}</TableCell>
                              <TableCell>
                                <IconButton
                                  onClick={() => removeProductRow(index)}
                                  disabled={formData.products.length <= 1}
                                >
                                  <IconTrash />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Button
                    startIcon={<IconPlus />}
                    onClick={addProductRow}
                    sx={{ mt: 2 }}
                    variant='outlined'
                    disabled={products.length === 0}
                  >
                    Add Product
                  </Button>
                </Grid>

                {/* Total Amount */}
                <Grid item xs={12}>
                  <Typography variant='h6' align='right' gutterBottom>
                    Total Amount: ${calculateTotal().toFixed(2)}
                  </Typography>
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type='submit' variant='contained' size='large' disabled={loading.submitting}>
                      {loading.submitting ? <CircularProgress size={24} /> : 'Submit Entry'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Super Admin Filters */}
      {role === 'superAdmin' && (
        <Card sx={{ mt: 4 }}>
          <CardHeader title='Filters' />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label='Start Date'
                    value={dateRange.startDate}
                    onChange={date => handleDateRangeChange('startDate', date)}
                    renderInput={params => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label='End Date'
                    value={dateRange.endDate}
                    onChange={date => handleDateRangeChange('endDate', date)}
                    renderInput={params => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Store</InputLabel>
                  <Select value={selectedStore} onChange={handleStoreChange} label='Store'>
                    <MenuItem value=''>All Stores</MenuItem>
                    {stores.map(store => (
                      <MenuItem key={store._id} value={store._id}>
                        {store.uname}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Manager</InputLabel>
                  <Select
                    value={selectedManager}
                    onChange={handleManagerChange}
                    label='Manager'
                    disabled={!selectedStore}
                  >
                    <MenuItem value=''>All Managers</MenuItem>
                    {managers
                      .filter(manager => manager.store?._id === selectedStore || manager.store === selectedStore)
                      .map(manager => (
                        <MenuItem key={manager._id} value={manager._id}>
                          {manager.uname}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button variant='contained' onClick={applyFilters}>
              Apply Filters
            </Button>
            <Button variant='outlined' onClick={resetFilters}>
              Reset Filters
            </Button>
          </CardActions>
        </Card>
      )}

      {/* Financial Entries Table */}
      <Card sx={{ mt: 4 }}>
        <CardHeader title='Financial Entries' />
        <CardContent>
          {loading.entries ? (
            <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {role === 'superAdmin' && <TableCell>User</TableCell>}
                      {role === 'superAdmin' && <TableCell>Store</TableCell>}
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEntries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(entry => {
                      const user = users.find(u => u._id === entry.userId._id)
                      console.log('user', user)

                      return (
                        <TableRow key={entry._id}>
                          {role === 'superAdmin' && <TableCell>{entry?.userId?.uname || 'Unknown User'}</TableCell>}
                          {role === 'superAdmin' && (
                            <TableCell>
                              {entry.store?.uname || entry.addedBy?.store?.uname || 'Unknown Store'}
                            </TableCell>
                          )}
                          <TableCell>
                            {new Date(entry.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>${entry.amount.toFixed(2)}</TableCell>
                          <TableCell>{entry.paymentMethod}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleViewEntry(entry)}>
                              <IconEye />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Fixed Pagination and Export */}
              <Box display='flex' justifyContent='space-between' alignItems='center' mt={2}>
                <CSVLink
                  filename={`expenses_${new Date().toISOString()}.csv`}
                  data={filteredEntries}
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant='contained'>Export {filteredEntries.length} Expenses</Button>
                </CSVLink>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component='div'
                  count={filteredEntries.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Entry Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Entry Details</DialogTitle>
        <DialogContent>
          {selectedEntry && (
            <Box p={2}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle1'>User</Typography>
                  <Typography variant='body1'>
                    {users.find(u => u._id === selectedEntry.userId)?.uname || 'Unknown User'}
                  </Typography>
                </Grid>
                {role === 'superAdmin' && (
                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle1'>Store</Typography>
                    <Typography variant='body1'>
                      {selectedEntry.store?.uname || selectedEntry.addedBy?.store?.uname || 'Unknown Store'}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle1'>Date</Typography>
                  <Typography variant='body1'>
                    {new Date(selectedEntry.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle1'>Amount</Typography>
                  <Typography variant='body1'>${selectedEntry.amount.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle1'>Payment Method</Typography>
                  <Typography variant='body1'>{selectedEntry.paymentMethod}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='subtitle1'>Description</Typography>
                  <Typography variant='body1'>{selectedEntry.description}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='subtitle1' gutterBottom>
                    Products
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Subtotal</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedEntry.products.map((item, index) => {
                          const product = item.productId
                          const price = product ? product.price : 0
                          const subtotal = price * item.quantity

                          return (
                            <TableRow key={index}>
                              <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>${price.toFixed(2)}</TableCell>
                              <TableCell>${subtotal.toFixed(2)}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DailyFinancialEntry
