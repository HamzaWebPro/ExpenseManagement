'use client'

import React, { useState } from 'react'
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
  Grid
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { IconPlus, IconTrash } from '@tabler/icons-react'

const DailyFinancialEntry = () => {
  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    paymentMethod: 'cash',
    date: new Date(),
    description: '',
    products: [{ productId: '', quantity: 1 }]
  })

  // Mock data - replace with your actual data
  const users = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Robert Johnson' }
  ]

  const products = [
    { id: '101', name: 'Product A', price: 19.99 },
    { id: '102', name: 'Product B', price: 29.99 },
    { id: '103', name: 'Product C', price: 39.99 },
    { id: '104', name: 'Product D', price: 49.99 }
  ]

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
    updatedProducts[index] = { ...updatedProducts[index], [name]: value }
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
    const updatedProducts = [...formData.products]
    updatedProducts.splice(index, 1)
    setFormData(prev => ({ ...prev, products: updatedProducts }))
  }

  // Calculate total amount
  const calculateTotal = () => {
    return formData.products.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId)
      return total + (product ? product.price * item.quantity : 0)
    }, 0)
  }

  // Handle form submission
  const handleSubmit = e => {
    e.preventDefault()
    const totalAmount = calculateTotal()
    const submissionData = {
      ...formData,
      amount: totalAmount
      // Add any additional processing here
    }
    console.log('Form submitted:', submissionData)
    // Here you would typically send the data to your API
    alert('Entry submitted successfully!')
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
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div className='flex items-center gap-4'>
          {/* Payment Method */}
          <FormControl component='fieldset' margin='normal'>
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
              renderInput={params => <TextField {...params} fullWidth margin='normal' required />}
            />
          </LocalizationProvider>
        </div>

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
                const selectedProduct = products.find(p => p.id === product.productId)
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
                        >
                          {products.map(prod => (
                            <MenuItem key={prod.id} value={prod.id}>
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

        <Button startIcon={<IconPlus />} onClick={addProductRow} sx={{ mt: 2 }} variant='outlined'>
          Add Product
        </Button>

        <Divider sx={{ my: 3 }} />

        {/* Total Amount */}
        <Typography variant='h6' align='right' gutterBottom>
          Total Amount: ${calculateTotal().toFixed(2)}
        </Typography>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button type='submit' variant='contained' size='large'>
            Submit Entry
          </Button>
        </Box>
      </form>
    </Box>
  )
}

export default DailyFinancialEntry
