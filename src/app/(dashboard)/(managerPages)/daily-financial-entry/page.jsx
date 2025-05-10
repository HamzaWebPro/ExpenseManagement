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
  CircularProgress
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import Cookies from 'js-cookie'
import decryptDataObject from '@/@menu/utils/decrypt'
import axios from 'axios'
import { toast } from 'react-toastify'

const DailyFinancialEntry = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const sessionToken = Cookies.get('sessionToken')
  const backendPostToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_POST_TOKEN
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    amount: 0,
    paymentMethod: 'cash',
    date: new Date(),
    description: '',
    products: [{ productId: '', quantity: 1 }]
  })
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState({
    users: true,
    products: true,
    submitting: false
  })
  const [error, setError] = useState(null)

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

  useEffect(() => {
    fetchProducts()
    fetchUser()
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
    updatedProducts[index] = {
      ...updatedProducts[index],
      [name]: name === 'quantity' ? Math.max(0.01, Number.isNaN(Number(value)) ? 1 : Number(value)) : value
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
      console.log(response)

      if (response.data.message) {
        // Reset form after successful submission
        setFormData({
          userId: '',
          amount: 0,
          paymentMethod: 'cash',
          date: new Date(),
          description: '',
          products: [{ productId: '', quantity: 1 }]
        })
        toast.success('Entry submitted successfully!')
      } else {
        toast.error(response.data.message || 'Failed to submit entry')
      }
    } catch (error) {
      console.error('Submission error:', error)
      toast(error.message || 'Failed to submit entry. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }))
    }
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

      <form onSubmit={handleSubmit}>
        {/* User Selection */}
        <FormControl fullWidth margin='normal'>
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

        <Box display='flex' alignItems='center' gap={4} mb={2}>
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
              renderInput={params => <TextField {...params} required />}
            />
          </LocalizationProvider>
        </Box>

        {/* Description */}
        <TextField
          fullWidth
          margin='normal'
          label='Description'
          name='description'
          value={formData.description}
          onChange={handleInputChange}
          multiline
          rows={3}
        />

        <Divider sx={{ my: 3 }} />

        {/* Products Selection */}
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
                        inputProps={{ min: 1 }}
                        required
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>{selectedProduct ? `$${selectedProduct.price.toFixed(2)}` : '-'}</TableCell>
                    <TableCell>${subtotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => removeProductRow(index)} disabled={formData.products.length <= 1}>
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

        <Divider sx={{ my: 3 }} />

        {/* Total Amount */}
        <Typography variant='h6' align='right' gutterBottom>
          Total Amount: ${calculateTotal().toFixed(2)}
        </Typography>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button type='submit' variant='contained' size='large' disabled={loading.submitting}>
            {loading.submitting ? <CircularProgress size={24} /> : 'Submit Entry'}
          </Button>
        </Box>
      </form>
    </Box>
  )
}

export default DailyFinancialEntry
