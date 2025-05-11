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
  Grid
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

const DailyFinancialEntry = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const sessionToken = Cookies.get('sessionToken')
  const backendPostToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_POST_TOKEN
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    paymentMethod: 'cash',
    date: new Date(),
    description: '',
    products: [{ productId: '', quantity: 1 }]
  })
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [entries, setEntries] = useState([])
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

      const response = await axios.get(`${baseUrl}/backend/authentication/all-added-user`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      const usersArr = response?.data?.success?.data || []
      setUsers(usersArr)
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

      const entriesArr = response?.data?.data || []
      setEntries(entriesArr)
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
  }, [])

  // Handle input changes
  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle date change
  const handleDateChange = date => {
    setFormData(prev => ({ ...prev, date }))
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
        date: formData.date,
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
          date: new Date(),
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

  if (error) {
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
                <Box display='flex' alignItems='center' gap={2}>
                  {/* Payment Method */}
                  <FormControl component='fieldset'>
                    <Typography component='legend'>Payment Method</Typography>
                    <RadioGroup row name='paymentMethod' value={formData.paymentMethod} onChange={handleInputChange}>
                      <FormControlLabel value='cash' control={<Radio />} label='Cash' />
                      <FormControlLabel value='card' control={<Radio />} label='Card' />
                    </RadioGroup>
                  </FormControl>

                  {/* Date Picker */}
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label='Date'
                      value={formData.date}
                      onChange={handleDateChange}
                      renderInput={params => <TextField {...params} required fullWidth />}
                    />
                  </LocalizationProvider>
                </Box>
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
                      <TableCell>User</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(entry => {
                      const user = users.find(u => u._id === entry.userId)
                      return (
                        <TableRow key={entry._id}>
                          <TableCell>{user?.uname || 'Unknown User'}</TableCell>
                          <TableCell>{formatDate(entry.date)}</TableCell>
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
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component='div'
                count={entries.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
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
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle1'>Date</Typography>
                  <Typography variant='body1'>{formatDate(selectedEntry.date)}</Typography>
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
                  {/* <Typography variant='subtitle1' gutterBottom>
                    Products
                  </Typography> */}
                  <Box p={2}>
                    <Grid container spacing={3}>
                      {/* ... other entry details ... */}
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
                                // Find the full product details from the products list
                                const product = item.productId
                                console.log('Product:', product)

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
