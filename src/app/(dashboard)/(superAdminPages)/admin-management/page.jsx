'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

// Third-party Imports
import { toast } from 'react-toastify'
import { useForm, Controller } from 'react-hook-form'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import classnames from 'classnames'

// Component Imports
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'

// Icon Imports
import { IconChevronRight as ChevronRight } from '@tabler/icons-react'
import { IconEye as EyeOutline } from '@tabler/icons-react'
import { IconPencil as PencilOutline } from '@tabler/icons-react'
import { IconTrash as DeleteOutline } from '@tabler/icons-react'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

// Style Imports
import styles from '@core/styles/table.module.css'
import CustomImageUploadField from '@/@core/components/mui/CustomImageUploadField'
import axios from 'axios'
import Cookies from 'js-cookie'
import decryptDataObject from '@/@menu/utils/decrypt'
import { Box, Typography } from '@mui/material'
import formatDate from '@/@menu/utils/formatDate'

// Sample Data
const defaultData = [
  {
    id: 1,
    uname: 'admin1',
    email: 'admin1@example.com',
    password: 'password123',
    franchiseAmount: '5000',
    status: 'Active',
    telephone: '1234567890',
    address: '123 Admin St',
    designation: 'Super Admin',
    imageObj: [{ url: '/images/avatars/1.png' }],
    start_date: '09/23/2023'
  },
  {
    id: 2,
    uname: 'admin2',
    email: 'admin2@example.com',
    password: 'password123',
    franchiseAmount: '3000',
    status: 'Inactive',
    telephone: '9876543210',
    address: '456 Admin Ave',
    designation: 'Regional Admin',
    imageObj: [{ url: '/images/avatars/2.png' }],
    start_date: '05/15/2023'
  }
]

// Column Helper
const columnHelper = createColumnHelper()

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const AdminManagement = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const sessionToken = Cookies.get('sessionToken')
  const backendPostToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_POST_TOKEN
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [data, setData] = useState(defaultData)
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const fetchAdmin = async () => {
    let token = decryptDataObject(sessionToken)
    token = JSON.parse(token)
    token = token?.tokens

    const setTokenInJson = JSON.stringify({
      getToken: backendGetToken,
      loginToken: token
    })
    try {
      const response = await axios.get(`${baseUrl}/backend/authentication/all-admin`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      const adminArr = response?.data?.success?.data || []
      if (adminArr.length > 0) {
        setData([...adminArr])
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchAdmin()
  }, [])

  // Form Hook
  const {
    control,
    reset,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      uname: '',
      email: '',
      password: '',
      designation: '',
      amount: '',
      address: '',
      telephone: '',
      status: '',
      imageObj: []
    }
  })

  // Toggle Password Visibility
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  // Form Submit Handler
  const onSubmit = async formData => {
    const newAdmin = {
      ...formData,
      role: 'admin',
      status: formData.status || 'inactive',
      addBy: 'superAdmin'
    }

    let token = decryptDataObject(sessionToken)
    token = JSON.parse(token)
    token = token?.tokens

    const setTokenInJson = JSON.stringify({
      postToken: backendPostToken,
      loginToken: token
    })

    try {
      const response = await axios.post(
        `${baseUrl}/backend/authentication/store`,
        {
          ...newAdmin
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          },
          maxBodyLength: Infinity
        }
      )

      console.log(response)

      toast.success('Admin Created Successfully!')
      fetchAdmin()
      reset()
      setShowAddForm(false)
      setImagePreview('')
    } catch (error) {
      console.error('Error creating admin:', error)
      toast.error('Failed to create admin')
    }
  }

  // View Admin Details
  const handleViewAdmin = admin => {
    setSelectedAdmin(admin)
    setViewDialogOpen(true)
  }

  // Edit Admin
  const handleEditAdmin = admin => {
    console.log(admin)

    setSelectedAdmin(admin)

    // Reset form with admin data
    reset({
      uname: admin.uname,
      email: admin.email,
      password: '',
      designation: admin.designation,
      amount: admin.amount || admin.franchiseAmount,
      address: admin.address,
      telephone: admin.telephone,
      status: admin.status,
      imageObj: admin.imageObj || []
    })

    // Set image preview if available
    if (admin.imageObj && admin.imageObj.length > 0) {
      setImagePreview(admin.imageObj[0].url || '')
    } else {
      setImagePreview('')
    }

    setEditDialogOpen(true)
  }

  // Update Admin
  const handleUpdateAdmin = async formData => {
    if (!selectedAdmin) return

    const updatedAdmin = {
      ...formData,
      id: selectedAdmin.id,

      imageObj: formData.imageObj.length > 0 ? formData.imageObj : selectedAdmin.imageObj || []
    }

    let token = decryptDataObject(sessionToken)
    token = JSON.parse(token)
    token = token?.tokens

    const setTokenInJson = JSON.stringify({
      postToken: backendPostToken,
      loginToken: token
    })

    try {
      const response = await axios.post(`${baseUrl}/backend/authentication/update, updatedAdmin`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      toast.success('Admin Updated Successfully!')
      fetchAdmin()
      setEditDialogOpen(false)
      reset()
      setImagePreview('')
    } catch (error) {
      console.error('Error updating admin:', error)
      toast.error('Failed to update admin')
    }
  }

  // Delete Admin
  const handleDeleteAdmin = async email => {
    const confirm = window.confirm('Are you sure you want to delete this admin?')
    if (!confirm) return
    let token = decryptDataObject(sessionToken)
    token = JSON.parse(token)
    token = token?.tokens

    const setTokenInJson = JSON.stringify({
      postToken: backendPostToken,
      loginToken: token
    })

    try {
      const response = await axios.post(
       ` ${baseUrl}/backend/authentication/destroy`,
        { email, addBy: 'superAdmin' },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          },
          maxBodyLength: Infinity
        }
      )

      console.log(response)

      toast.success('Admin Deleted Successfully!')
      fetchAdmin()
    } catch (error) {
      console.error('Error deleting admin:', error)
      toast.error('Failed to delete admin')
    } finally {
      return
    }
  }

  // Reset Form
  const handleResetForm = () => {
    reset()
    setImagePreview('')
  }

  // Table Columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('uname', {
        cell: info => info.getValue(),
        header: 'Admin Name'
      }),
      columnHelper.accessor('email', {
        cell: info => info.getValue(),
        header: 'Email'
      }),
      columnHelper.accessor('designation', {
        cell: info => info.getValue(),
        header: 'Designation'
      }),
      columnHelper.accessor('status', {
        cell: info => (
          <span
            className={classnames({
              'text-success': info.getValue() === 'active',
              'text-error': info.getValue() === 'inactive'
            })}
          >
            {info.getValue()}
          </span>
        ),
        header: 'Status'
      }),
      columnHelper.accessor('createdAt', {
        cell: info => {
          let date = new Date(info.getValue())
          date = date.toLocaleDateString()
          console.log(date)
          return date
        },
        header: 'Created Date'
      }),
      columnHelper.accessor('id', {
        cell: info => (
          <div className='flex items-center gap-2'>
            <IconButton onClick={() => handleViewAdmin(info.row.original)}>
              <EyeOutline className='text-textPrimary' />
            </IconButton>
            <IconButton onClick={() => handleEditAdmin(info.row.original)}>
              <PencilOutline className='text-textPrimary' />
            </IconButton>
            <IconButton onClick={() => handleDeleteAdmin(info.row.original.email)}>
              <DeleteOutline className='text-textPrimary' />
            </IconButton>
          </div>
        ),
        header: 'Actions',
        size: 120
      })
    ],
    []
  )

  // React Table Instance
  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      columnFilters,
      globalFilter
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <Card>
      <CardHeader
        title='Admin Management'
        action={
          <div className='flex items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search admins...'
              className='min-is-[200px]'
            />
            <Button variant='contained' onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Hide Form' : 'Add Admin'}
            </Button>
          </div>
        }
      />

      {/* Add Admin Form */}
      {showAddForm && (
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              {/* Admin Name */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='uname'
                  control={control}
                  rules={{ required: 'Username is required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Admin Name'
                      placeholder='Enter admin name'
                      error={!!errors.uname}
                      helperText={errors.uname?.message}
                    />
                  )}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='email'
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='email'
                      label='Admin Email'
                      placeholder='Enter admin email'
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='password'
                  control={control}
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type={isPasswordShown ? 'text' : 'password'}
                      label='Admin Password'
                      placeholder='Enter password'
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onClick={handleClickShowPassword}
                              onMouseDown={e => e.preventDefault()}
                              aria-label='toggle password visibility'
                            >
                              {isPasswordShown ? <IconEyeOff /> : <IconEye />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Franchise Amount */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='amount'
                  control={control}
                  rules={{
                    required: 'Franchise amount is required',
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Please enter a valid number'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Franchise Amount'
                      placeholder='Enter amount'
                      type='number'
                      error={!!errors.amount}
                      helperText={errors.amount?.message}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>$</InputAdornment>
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Telephone */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='telephone'
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[0-9]{10,15}$/,
                      message: 'Please enter a valid phone number'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Telephone'
                      placeholder='Admin Phone Number'
                      error={!!errors.telephone}
                      helperText={errors.telephone?.message}
                    />
                  )}
                />
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='imageObj'
                  control={control}
                  rules={{
                    required: 'Please upload an image'
                  }}
                  render={({ field: { onChange } }) => (
                    <CustomImageUploadField
                      fullWidth
                      label='Upload Image'
                      error={!!errors.imageObj}
                      helperText={errors.imageObj?.message}
                      onChange={e => {
                        const file = e.target.files[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            const imageDataUrl = reader.result
                            setImagePreview(imageDataUrl)
                            onChange([imageDataUrl])
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <Controller
                  name='address'
                  control={control}
                  rules={{ required: 'Address is required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Address'
                      placeholder='Enter address'
                      multiline
                      rows={3}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  )}
                />
              </Grid>

              {/* Designation */}
              <Grid item xs={12}>
                <Controller
                  name='designation'
                  control={control}
                  rules={{ required: 'Designation is required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Designation'
                      placeholder='Enter designation'
                      error={!!errors.designation}
                      helperText={errors.designation?.message}
                    />
                  )}
                />
              </Grid>

              {/* Buttons */}
              <Grid item xs={12} className='flex gap-4'>
                <Button variant='contained' type='submit'>
                  Add Admin
                </Button>
                <Button variant='tonal' color='secondary' type='reset' onClick={handleResetForm}>
                  Reset
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      )}

      {/* Admins Table */}
      <div className='overflow-x-auto'>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames('flex items-center', {
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronRight fontSize='1.25rem' className='-rotate-90' />,
                          desc: <ChevronRight fontSize='1.25rem' className='rotate-90' />
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No admins found
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className='p-3'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      />

      {/* View Admin Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Admin Details</DialogTitle>
        <DialogContent>
          {selectedAdmin && (
            <Box className='p-4'>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Admin Name
                    </Typography>
                    <Typography variant='body1'>{selectedAdmin?.uname}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Email
                    </Typography>
                    <Typography variant='body1'>{selectedAdmin.email}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Designation
                    </Typography>
                    <Typography variant='body1'>{selectedAdmin.designation}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Status
                    </Typography>
                    <Typography variant='body1'>{selectedAdmin.status}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Franchise Amount
                    </Typography>
                    <Typography variant='body1'>${selectedAdmin?.amount}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Telephone
                    </Typography>
                    <Typography variant='body1'>{selectedAdmin.telephone}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Address
                    </Typography>
                    <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedAdmin.address}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Created Time
                    </Typography>
                    <Typography variant='body1'>{formatDate(selectedAdmin.createdAt)}</Typography>
                  </Box>
                </Grid>
                {selectedAdmin.imageObj?.[0]?.url && (
                  <Grid item xs={12} sm={6} className='flex items-center justify-center'>
                    <Box
                      border={1}
                      borderColor='divider'
                      p={2}
                      borderRadius={2}
                      display='flex'
                      justifyContent='center'
                      alignItems='center'
                      bgcolor='background.paper'
                    >
                      <img
                        src={selectedAdmin.imageObj[0].url}
                        alt='Admin'
                        style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='primary' onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Edit Admin</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(handleUpdateAdmin)}>
            <Grid container spacing={4} className='p-4'>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='uname'
                  control={control}
                  rules={{ required: 'Username is required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Admin Name'
                      placeholder='Enter admin name'
                      error={!!errors.uname}
                      helperText={errors.uname?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='email'
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='email'
                      label='Email'
                      placeholder='Enter admin email'
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='password'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type={isPasswordShown ? 'text' : 'password'}
                      label='Password'
                      placeholder='Enter new password (leave blank to keep current)'
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onClick={handleClickShowPassword}
                              onMouseDown={e => e.preventDefault()}
                              aria-label='toggle password visibility'
                            >
                              {isPasswordShown ? <IconEyeOff /> : <IconEye />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='amount'
                  control={control}
                  rules={{
                    required: 'Franchise amount is required',
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Please enter a valid number'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Franchise Amount'
                      placeholder='Enter amount'
                      type='number'
                      error={!!errors.amount}
                      helperText={errors.amount?.message}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>$</InputAdornment>
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='status'
                  control={control}
                  rules={{ required: 'Status is required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      select
                      label='Status'
                      error={!!errors.status}
                      helperText={errors.status?.message}
                      SelectProps={{ native: true }}
                    >
                      <option value=''>Select Status</option>
                      <option value='active'>Active</option>
                      <option value='inactive'>Inactive</option>
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='telephone'
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[0-9]{10,15}$/,
                      message: 'Please enter a valid phone number'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Telephone'
                      placeholder='Phone number'
                      error={!!errors.telephone}
                      helperText={errors.telephone?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='imageObj'
                  control={control}
                  render={({ field: { onChange } }) => (
                    <div className='flex flex-col gap-2'>
                      <CustomImageUploadField
                        fullWidth
                        label='Upload Image'
                        onChange={e => {
                          const file = e.target.files[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              const imageDataUrl = reader.result
                              setImagePreview(imageDataUrl)
                              onChange([{ url: imageDataUrl }])
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                      {(imagePreview || (selectedAdmin?.imageObj?.[0]?.url && !imagePreview)) && (
                        <div className='mt-2'>
                          <img
                            src={imagePreview || selectedAdmin.imageObj[0].url}
                            alt='Preview'
                            className='max-h-[100px] max-w-full object-contain'
                          />
                        </div>
                      )}
                    </div>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='address'
                  control={control}
                  rules={{ required: 'Address is required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Address'
                      placeholder='Enter address'
                      multiline
                      rows={3}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='designation'
                  control={control}
                  rules={{ required: 'Designation is required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Designation'
                      placeholder='Enter designation'
                      error={!!errors.designation}
                      helperText={errors.designation?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditDialogOpen(false)
              setImagePreview('')
            }}
          >
            Cancel
          </Button>
          <Button variant='contained' onClick={handleSubmit(handleUpdateAdmin)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default AdminManagement