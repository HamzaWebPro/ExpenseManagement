'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'
import { CSVLink } from 'react-csv'

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
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'

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
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import formatDate from '@/@menu/utils/formatDate'
import { DNA } from 'react-loader-spinner'
import TokenManager from '@/@menu/utils/token'

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

const UserManagement = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const sessionToken = Cookies.get('sessionToken')
  const backendPostToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_POST_TOKEN
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  // Get current user role
  const currentUser = sessionToken ? JSON.parse(decryptDataObject(sessionToken)) : null
  const role = currentUser?.role || ''

  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [data, setData] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [percentageDialogOpen, setPercentageDialogOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [btnLoading, setBtnLoading] = useState('')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [stores, setStores] = useState([])
  const [managers, setManagers] = useState([])
  const [selectedManagers, setSelectedManagers] = useState([])

  const fetchUser = async () => {
    try {
      const loginToken = await TokenManager.getLoginToken()
      const setTokenInJson = JSON.stringify({
        getToken: backendGetToken,
        loginToken: loginToken || ''
      })

      const response = await axios.get(
        `${baseUrl}/backend/authentication/${role === 'superAdmin' ? 'all-user' : 'all-added-user'}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          },
          maxBodyLength: Infinity
        }
      )

      const users = response?.data?.success?.data || []

      // Reset all data arrays
      setData([])
      setStores([])
      setManagers([])

      // Categorize users by role
      users.forEach(user => {
        const userRole = user?.role?.toLowerCase()
        console.log(stores)
        switch (userRole) {
          case 'admin':
            setStores(prev => [...prev, user])
            break
          case 'manager':
            setManagers(prev => [...prev, user])
            break
          case 'user':
            setData(prev => [...prev, user])
            break
          default:
            break
        }
      })
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const loginToken = await TokenManager.getLoginToken()
      const setTokenInJson = JSON.stringify({
        getToken: backendGetToken,
        loginToken: loginToken || ''
      })

      const response = await axios.get(`${baseUrl}/backend/product/all`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      setProducts(response?.data?.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  // Form Hook
  const {
    control,
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      uname: '',
      email: '',
      password: '',
      designation: '',
      address: '',
      telephone: '',
      delayCost: '',
      imageObj: [],
      applyToAll: false,
      allProductPercentage: '',
      percentage: '',
      selectedProducts: []
    }
  })

  useEffect(() => {
    if (role) {
      fetchUser()
      fetchProducts()

      if (role === 'superAdmin') {
        reset({
          uname: '',
          email: '',
          password: '',
          designation: '',
          address: '',
          telephone: '',
          delayCost: '',
          imageObj: [],
          applyToAll: false,
          allProductPercentage: '',
          percentage: '',
          selectedProducts: [],
          store: '',
          addedBy: ''
        })
      }
    }
  }, [role])

  const applyToAll = watch('applyToAll')
  const percentage = watch('percentage')

  // Toggle Password Visibility
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  // Form Submit Handler
  const onSubmit = async formData => {
    setBtnLoading('submit')
    try {
      const loginToken = await TokenManager.getLoginToken()
      const authPayload = JSON.stringify({
        postToken: backendPostToken,
        loginToken: loginToken || ''
      })

      const response = await axios.post(`${baseUrl}/backend/authentication/store`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${authPayload}`)}`
        },
        maxBodyLength: Infinity
      })

      if (response?.data?.success) {
        toast.success('User Created Successfully!')
        await fetchUser()
        reset()
        setShowAddForm(false)
        setImagePreview('')
      } else {
        toast.error('Create User Failed')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error(error?.response?.data?.error?.message || 'Something went wrong.')
    } finally {
      setBtnLoading('')
    }
  }

  // View Admin Details
  const handleViewManager = manager => {
    setSelectedUser(manager)
    setViewDialogOpen(true)
  }

  // Edit User
  const handleEditManager = manager => {
    setSelectedUser(manager)

    reset({
      id: manager._id,
      uname: manager.uname,
      email: manager.email,
      password: '',
      designation: manager.designation,
      address: manager.address,
      telephone: manager.telephone,
      delayCost: manager.delayCost || '',
      imageObj: manager.imageObj || []
    })

    setImagePreview(manager.imageObj?.[0]?.url || '')
    setEditDialogOpen(true)
  }

  // Update User
  const handleUpdateUser = async formData => {
    setBtnLoading('update')

    if (!selectedUser) return

    const updatedManager = {
      ...formData,
      imageObj: formData.imageObj.length > 0 ? formData.imageObj : selectedUser.imageObj || []
    }

    try {
      const loginToken = await TokenManager.getLoginToken()
      const setTokenInJson = JSON.stringify({
        postToken: backendPostToken,
        loginToken: loginToken || ''
      })

      const response = await axios.post(`${baseUrl}/backend/authentication/update`, updatedManager, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      console.log('up user', response)

      toast.success('User Updated Successfully!')
      fetchUser()
      setEditDialogOpen(false)
      reset()
      setImagePreview('')
    } catch (error) {
      console.error('Error updating User:', error)
      toast.error('Failed to update User')
    } finally {
      setBtnLoading('')
    }
  }

  // Delete Admin
  const handleDeleteManager = async id => {
    const confirm = window.confirm('Are you sure you want to delete this User?')
    if (!confirm) return

    try {
      const loginToken = await TokenManager.getLoginToken()
      const setTokenInJson = JSON.stringify({
        postToken: backendPostToken,
        loginToken: loginToken || ''
      })

      const response = await axios.post(
        `${baseUrl}/backend/authentication/destroy`,
        { id, addBy: 'superAdmin' },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          },
          maxBodyLength: Infinity
        }
      )

      toast.success('User Deleted Successfully!')
      fetchUser()
    } catch (error) {
      console.error('Error deleting User:', error)
      toast.error('Failed to delete User')
    }
  }

  // Reset Form
  const handleResetForm = () => {
    reset()
    setImagePreview('')
  }

  // Open Percentage Management Dialog
  const handleOpenPercentageDialog = user => {
    setSelectedUser(user)
    setSelectedProducts([])

    reset({
      applyToAll: !!user.allProductPercentage,
      allProductPercentage: user.allProductPercentage || '',
      percentage: '',
      selectedProducts: []
    })

    setPercentageDialogOpen(true)
  }

  // Toggle product selection
  const handleProductSelect = productId => {
    setSelectedProducts(prev => (prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]))
  }

  // Submit Percentage Management Form
  const handleSubmitPercentage = async formData => {
    setBtnLoading('percentage')

    try {
      const loginToken = await TokenManager.getLoginToken()
      const setTokenInJson = JSON.stringify({
        postToken: backendPostToken,
        loginToken: loginToken || ''
      })

      const payload = {
        userId: selectedUser._id,
        allProductPercentage: formData.applyToAll ? formData.allProductPercentage : null,
        individualProductPercentage: formData.applyToAll
          ? []
          : selectedProducts.map(productId => ({
              product: productId,
              percentage: formData.percentage
            }))
      }

      const response = await axios.post(`${baseUrl}/backend/manage-percentage/store`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        }
      })
      console.log('Percentage response:', response)

      if (response.data && response.status === 201) {
        toast.success('Percentage settings saved successfully!')
        await fetchUser()
        setPercentageDialogOpen(false)
      } else {
        toast.error('Failed to save percentage settings')
      }
    } catch (error) {
      console.error('Error submitting percentage data:', error)
      toast.error(error?.response?.data?.error?.message || 'Failed to submit percentage data')
    } finally {
      setBtnLoading('')
    }
  }

  // Table Columns
  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.accessor('uname', {
        cell: info => info.getValue(),
        header: 'User Name'
      }),
      columnHelper.accessor('email', {
        cell: info => info.getValue(),
        header: 'Email'
      }),
      columnHelper.accessor('delayCost', {
        cell: info => (info.getValue() ? `$${info.getValue()}` : '-'),
        header: 'Delay Cost'
      }),
      columnHelper.accessor('_id', {
        cell: info => <Button onClick={() => handleOpenPercentageDialog(info.row.original)}>Manage Percentage</Button>,
        header: 'Manage Percentage'
      }),
      columnHelper.accessor('createdAt', {
        cell: info => {
          const date = new Date(info.getValue())
          return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        },
        header: 'Created Date'
      }),
      columnHelper.accessor('_id', {
        cell: info => (
          <div className='flex items-center gap-2'>
            <IconButton onClick={() => handleViewManager(info.row.original)}>
              <EyeOutline className='text-textPrimary' />
            </IconButton>
            <IconButton onClick={() => handleEditManager(info.row.original)}>
              <PencilOutline className='text-textPrimary' />
            </IconButton>
            <IconButton onClick={() => handleDeleteManager(info.row.original._id)}>
              <DeleteOutline className='text-textPrimary' />
            </IconButton>
          </div>
        ),
        header: 'Actions',
        size: 120
      })
    ]

    if (role === 'superAdmin') {
      baseColumns.splice(
        1,
        0, // Insert after uname
        columnHelper.accessor('store.uname', {
          cell: info => info.getValue() || '-',
          header: 'Store Name'
        })
      )
    }

    return baseColumns
  }, [role])

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
        title='User Management'
        action={
          <div className='flex items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search users...'
              className='min-is-[200px]'
            />
            <Button variant='contained' onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Hide Form' : 'Add User'}
            </Button>
          </div>
        }
      />

      {/* Add User Form */}
      {showAddForm && (
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              {role === 'superAdmin' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='store'
                      control={control}
                      defaultValue=''
                      rules={{
                        required: 'Store selection is required'
                      }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          select
                          fullWidth
                          label='Select Store'
                          error={!!errors.store}
                          helperText={errors.store?.message}
                          onChange={e => {
                            const selectedStoreId = e.target.value
                            field.onChange(selectedStoreId)
                            const filteredManagers = managers.filter(
                              manager => manager.store?._id === selectedStoreId || manager.store === selectedStoreId
                            )
                            console.log(filteredManagers)
                            setSelectedManagers(filteredManagers)
                            setValue('addedBy', '')
                          }}
                        >
                          <MenuItem value=''>Select Store</MenuItem>
                          {stores.map(store => (
                            <MenuItem key={store._id} value={store._id}>
                              {store.uname}
                            </MenuItem>
                          ))}
                        </CustomTextField>
                      )}
                    />
                  </Grid>

                  {watch('store') && selectedManagers.length > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name='addedBy'
                        control={control}
                        rules={{ required: 'Manager selection is required' }}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            select
                            fullWidth
                            label='Select Manager'
                            error={!!errors.addedBy}
                            helperText={errors.addedBy?.message}
                          >
                            <MenuItem value=''>Select Manager</MenuItem>
                            {selectedManagers.map(manager => (
                              <MenuItem key={manager._id} value={manager._id}>
                                {manager.uname}
                              </MenuItem>
                            ))}
                          </CustomTextField>
                        )}
                      />
                    </Grid>
                  )}
                </>
              )}

              {/* User Name */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='uname'
                  control={control}
                  rules={{ required: 'Username is required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='User Name'
                      placeholder='Enter manager name'
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
                      label='User Email'
                      placeholder='Enter email'
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
                      label='User Password'
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
                      placeholder='User Phone Number'
                      error={!!errors.telephone}
                      helperText={errors.telephone?.message}
                    />
                  )}
                />
              </Grid>

              {/* Delay Cost */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='delayCost'
                  control={control}
                  rules={{
                    min: {
                      value: 0,
                      message: 'Delay cost cannot be negative'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='number'
                      label='Delay Cost ($)'
                      placeholder='Enter delay cost'
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>$</InputAdornment>
                      }}
                      error={!!errors.delayCost}
                      helperText={errors.delayCost?.message}
                    />
                  )}
                />
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='imageObj'
                  control={control}
                  render={({ field: { onChange } }) => (
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

              {/* Buttons */}
              <Grid item xs={12} className='flex gap-4'>
                <Button disabled={btnLoading === 'submit'} variant='contained' type='submit'>
                  {btnLoading === 'submit' ? (
                    <DNA
                      visible={true}
                      height={22}
                      ariaLabel='dna-loading'
                      wrapperStyle={{}}
                      wrapperClass='dna-wrapper'
                    />
                  ) : (
                    'Add User'
                  )}
                </Button>
                <Button variant='tonal' color='secondary' type='reset' onClick={handleResetForm}>
                  Reset
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      )}

      {/* User Table */}
      <div className='overflow-x-auto'>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup, index) => (
              <tr key={index}>
                {headerGroup.headers.map((header, idx) => (
                  <th key={idx} style={{ width: header.getSize() }}>
                    {!header.isPlaceholder && (
                      <div
                        className={classnames('flex items-center', {
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}

                        {header.column.getIsSorted() === 'asc' && (
                          <ChevronRight fontSize='1.25rem' className='-rotate-90' />
                        )}
                        {header.column.getIsSorted() === 'desc' && (
                          <ChevronRight fontSize='1.25rem' className='rotate-90' />
                        )}
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
                  No User found
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
        component={() => (
          <TablePaginationComponent table={table}>
            <CSVLink filename='all_user' data={data}>
              <Button variant='contained'>Export All User</Button>
            </CSVLink>
          </TablePaginationComponent>
        )}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      />

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box className='p-4'>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      User Name
                    </Typography>
                    <Typography variant='body1'>{selectedUser?.uname}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Email
                    </Typography>
                    <Typography variant='body1'>{selectedUser.email}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Delay Cost
                    </Typography>
                    <Typography variant='body1'>
                      {selectedUser.delayCost ? `$${selectedUser.delayCost}` : '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Telephone
                    </Typography>
                    <Typography variant='body1'>{selectedUser.telephone}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Address
                    </Typography>
                    <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedUser.address}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Created Time
                    </Typography>
                    <Typography variant='body1'>{formatDate(selectedUser.createdAt)}</Typography>
                  </Box>
                </Grid>
                {selectedUser.imageObj?.[0]?.url && (
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
                        src={selectedUser.imageObj[0].url}
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(handleUpdateUser)}>
            <Grid container spacing={4} className='p-4'>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='uname'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth label='User Name' placeholder='Enter manager name' />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='email'
                  control={control}
                  render={({ field }) => <CustomTextField {...field} fullWidth type='email' label='Email' />}
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
                  name='telephone'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth label='Telephone' placeholder='Phone number' />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='delayCost'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='number'
                      label='Delay Cost ($)'
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>$</InputAdornment>
                      }}
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
                      {(imagePreview || (selectedUser?.imageObj?.[0]?.url && !imagePreview)) && (
                        <div className='mt-2'>
                          <img
                            src={imagePreview || selectedUser.imageObj[0].url}
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
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Address'
                      placeholder='Enter address'
                      multiline
                      rows={3}
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
          <Button disabled={btnLoading === 'update'} variant='contained' onClick={handleSubmit(handleUpdateUser)}>
            {btnLoading === 'update' ? (
              <DNA visible={true} height={22} ariaLabel='dna-loading' wrapperStyle={{}} wrapperClass='dna-wrapper' />
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Percentage Management Dialog */}
      <Dialog open={percentageDialogOpen} onClose={() => setPercentageDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Percentage Management for {selectedUser?.uname}</DialogTitle>
        <DialogContent>
          {/* Current Percentage Settings Section */}
          <Box sx={{ mb: 4, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant='h6' gutterBottom>
              Current Percentage Settings
            </Typography>

            {selectedUser?.allProductPercentage && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography fontWeight='bold'>Global Percentage:</Typography>
                <Typography>{selectedUser.allProductPercentage}% (applies to all products)</Typography>
              </Box>
            )}
            {selectedUser?.individualProductPercentage?.length > 0 && (
              <>
                <Typography variant='subtitle1' gutterBottom>
                  Product-Specific Percentages:
                </Typography>
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table size='small' stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align='right'>Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedUser.individualProductPercentage.map((item, index) => {
                        const product = products.find(p => p._id === item.product._id)
                        return (
                          <TableRow key={index}>
                            <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                            <TableCell align='right'>{item.percentage}%</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
            {!selectedUser?.allProductPercentage && !selectedUser?.individualProductPercentage?.length && (
              <Typography color='text.secondary'>No percentage settings configured</Typography>
            )}
          </Box>

          {/* Update Percentage Settings Section */}
          <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>
            Update Settings
          </Typography>
          <form onSubmit={handleSubmit(handleSubmitPercentage)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name='applyToAll'
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          onChange={e => {
                            field.onChange(e.target.checked)
                            if (e.target.checked) {
                              setSelectedProducts([])
                            }
                          }}
                        />
                      }
                      label='Apply percentage to all products'
                    />
                  )}
                />
              </Grid>

              {applyToAll ? (
                <Grid item xs={12}>
                  <Controller
                    name='allProductPercentage'
                    control={control}
                    rules={{
                      required: 'Percentage is required',
                      min: { value: 0, message: 'Minimum 0%' },
                      max: { value: 100, message: 'Maximum 100%' },
                      validate: value => !isNaN(value) || 'Must be a number'
                    }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Global Percentage'
                        placeholder='0-100'
                        InputProps={{
                          endAdornment: <InputAdornment position='end'>%</InputAdornment>
                        }}
                        error={!!errors.allProductPercentage}
                        helperText={errors.allProductPercentage?.message}
                      />
                    )}
                  />
                </Grid>
              ) : (
                <>
                  <Grid item xs={12}>
                    <Controller
                      name='percentage'
                      control={control}
                      rules={{
                        required: 'Percentage is required',
                        min: { value: 0, message: 'Minimum 0%' },
                        max: { value: 100, message: 'Maximum 100%' },
                        validate: value => !isNaN(value) || 'Must be a number'
                      }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          type='number'
                          label='Percentage for Selected Products'
                          placeholder='0-100'
                          InputProps={{
                            endAdornment: <InputAdornment position='end'>%</InputAdornment>
                          }}
                          error={!!errors.percentage}
                          helperText={errors.percentage?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name='selectedProducts'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          select
                          SelectProps={{
                            multiple: true,
                            value: selectedProducts,
                            onChange: e => {
                              setSelectedProducts(e.target.value)
                              field.onChange(e.target.value)
                            }
                          }}
                          fullWidth
                          label='Select Products'
                          error={!!errors.selectedProducts}
                          helperText={errors.selectedProducts?.message}
                        >
                          <MenuItem disabled value=''>
                            <em>Select products</em>
                          </MenuItem>
                          {products.map(product => (
                            <MenuItem key={product._id} value={product._id}>
                              <Checkbox checked={selectedProducts.includes(product._id)} />
                              {product.name}
                            </MenuItem>
                          ))}
                        </CustomTextField>
                      )}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPercentageDialogOpen(false)}>Cancel</Button>
          <Button
            disabled={btnLoading === 'percentage'}
            variant='contained'
            onClick={handleSubmit(handleSubmitPercentage)}
          >
            {btnLoading === 'percentage' ? (
              <DNA visible={true} height={22} ariaLabel='dna-loading' wrapperStyle={{}} wrapperClass='dna-wrapper' />
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default UserManagement
