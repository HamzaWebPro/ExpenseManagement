'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'
import { CSVLink, CSVDownload } from 'react-csv'

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
import { Box, MenuItem, Typography } from '@mui/material'
import formatDate from '@/@menu/utils/formatDate'
import TokenManager from '@/@menu/utils/token'
import { DNA } from 'react-loader-spinner'

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
  const [selectedManager, setSelectedManager] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const [btnLoading, setBtnLoading] = useState('')

  const [stores, setStores] = useState([])

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
      // setData([])
      setStores([])
      // setManagers([])

      // Categorize users by role
      users.forEach(user => {
        const userRole = user?.role?.toLowerCase()
        console.log(stores)
        switch (userRole) {
          case 'admin':
            setStores(prev => [...prev, user])
            break

          default:
            break
        }
      })
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }
  const fetchManager = async () => {
    try {
      const loginToken = await TokenManager.getLoginToken()
      const setTokenInJson = JSON.stringify({
        getToken: backendGetToken,
        loginToken: loginToken || ''
      })

      console.log(loginToken)

      const response = await axios.get(`${baseUrl}/backend/authentication/all-manager`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })
      console.log('response', response)

      const managerArr = response?.data?.success?.data || []
      if (managerArr.length > 0) {
        setData([...managerArr])
      }
    } catch (error) {
      console.log(error)
    }
  }

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
      address: '',
      telephone: '',
      // status: 'inactive',
      imageObj: []
    }
  })

  useEffect(() => {
    if (role) {
      fetchManager()
      // fetchProducts()

      if (role === 'superAdmin') {
        fetchUser()
        reset({
          uname: '',
          email: '',
          password: '',
          designation: '',
          address: '',
          telephone: '',
          // status: 'inactive',
          imageObj: [],
          store: ''
        })
      }
    }
  }, [role])
  // Toggle Password Visibility
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  // Form Submit Handler
  const onSubmit = async formData => {
    setBtnLoading('submit')
    try {
      const loginToken = await TokenManager.getLoginToken()
      const setTokenInJson = JSON.stringify({
        postToken: backendPostToken,
        loginToken: loginToken || ''
      })
      const response = await axios.post(
        `${baseUrl}/backend/authentication/${role === 'superAdmin' ? 'store_manager' : 'store'}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          },
          maxBodyLength: Infinity
        }
      )

      console.log('response post', response)

      toast.success('Manager Created Successfully!')
      fetchManager()
      reset()
      setShowAddForm(false)
      setImagePreview('')
    } catch (error) {
      console.error('Error creating manager:', error)
      toast.error(error?.response?.data?.error?.message)
    } finally {
      setBtnLoading('')
    }
  }

  // View Admin Details
  const handleViewManager = manager => {
    setSelectedManager(manager)
    setViewDialogOpen(true)
  }

  // Edit Manager
  const handleEditManager = manager => {
    console.log(manager)

    setSelectedManager(manager)

    reset({
      id: manager._id,
      uname: manager.uname,
      email: manager.email,
      password: '',
      designation: manager.designation,

      address: manager.address,
      telephone: manager.telephone,
      status: manager.status,
      imageObj: manager.imageObj || []
    })

    // Set image preview if available
    if (manager.imageObj && manager.imageObj.length > 0) {
      setImagePreview(manager.imageObj[0].url || '')
    } else {
      setImagePreview('')
    }

    setEditDialogOpen(true)
  }

  // Update Manager
  const handleUpdateManager = async formData => {
    setBtnLoading('update')
    console.log('formData for update', formData)

    if (!selectedManager) return

    const updatedManager = {
      ...formData,
      imageObj: formData.imageObj.length > 0 ? formData.imageObj : selectedManager.imageObj || []
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
      console.log(response)

      toast.success('Manager Updated Successfully!')
      fetchManager()
      setEditDialogOpen(false)
      reset()
      setImagePreview('')
    } catch (error) {
      console.error('Error updating manager:', error)
      toast.error('Failed to update manager')
    } finally {
      setBtnLoading('')
    }
  }

  // Delete Admin
  const handleDeleteManager = async id => {
    const confirm = window.confirm('Are you sure you want to delete this manager?')
    if (!confirm) return

    try {
      const loginToken = await TokenManager.getLoginToken()
      const setTokenInJson = JSON.stringify({
        postToken: backendPostToken,
        loginToken: loginToken || ''
      })
      const response = await axios.post(
        ` ${baseUrl}/backend/authentication/destroy`,
        { id, addBy: 'superAdmin' },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          },
          maxBodyLength: Infinity
        }
      )

      console.log(response)

      toast.success('manager Deleted Successfully!')
      fetchManager()
    } catch (error) {
      console.error('Error deleting manager:', error)
      toast.error('Failed to delete manager')
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
  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.accessor('uname', {
        cell: info => info.getValue(),
        header: 'Manager Name'
      }),
      columnHelper.accessor('email', {
        cell: info => info.getValue(),
        header: 'Email'
      }),

      // columnHelper.accessor('status', {
      //   cell: info => (
      //     <span
      //       className={classnames({
      //         'text-success': info.getValue() === 'active',
      //         'text-error': info.getValue() === 'inactive'
      //       })}
      //     >
      //       {info.getValue()}
      //     </span>
      //   ),
      //   header: 'Status'
      // }),
      columnHelper.accessor('createdAt', {
        cell: info => {
          let date = new Date(info.getValue())
          date = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
          return date
        },
        header: 'Created Date'
      }),
      columnHelper.accessor('addedBy.uname', {
        cell: info => (
          <div className='flex items-center gap-2'>
            {info.row.original?.isSuperAdminAdded ? <p>Super Admin</p> : <p>{info.getValue()}</p>}
          </div>
        ),
        header: 'Added By',
        size: 120
      }),
      columnHelper.accessor('id', {
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
        0,
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
    <>
      <Card>
        <CardHeader
          title='Manager Management'
          action={
            <div className='flex items-center gap-4'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder='Search manager...'
                className='min-is-[200px]'
              />
              <Button variant='contained' onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Hide Form' : 'Add Manager'}
              </Button>
            </div>
          }
        />

        {/* Add Admin Form */}
        {showAddForm && (
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={4}>
                {role === 'superAdmin' && (
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
                          // onChange={e => {
                          //   const selectedStoreId = e.target.value

                          // }}
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
                )}

                {/* Manager Name */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='uname'
                    control={control}
                    rules={{ required: 'Username is required' }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Manager Name'
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
                        label='Manager Email'
                        placeholder='Enter manager email'
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
                    rules={{
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    }}
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type={isPasswordShown ? 'text' : 'password'}
                        label='Password'
                        placeholder='Enter new password'
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
                        placeholder='Manager Phone Number'
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

                {/* status */}
                {/* <Grid item xs={12} sm={6}>
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
                </Grid> */}

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

                {/* Buttons */}
                <Grid item xs={12} className='flex gap-4'>
                  <Button variant='contained' disabled={btnLoading === 'submit'} type='submit'>
                    {btnLoading === 'submit' ? (
                      <DNA
                        visible={true}
                        height={22}
                        ariaLabel='dna-loading'
                        wrapperStyle={{}}
                        wrapperClass='dna-wrapper'
                      />
                    ) : (
                      'Add Manager'
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

        {/* manager Table */}
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
                    No Manager found
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
              {data && data.length > 0 ? (
                <CSVLink
                  filename='all_manager.csv'
                  data={data.map(manager => ({
                    uname: manager.uname,
                    email: manager.email,
                    telephone: manager.telephone,
                    address: manager.address,
                    createdAt: manager.createdAt,
                    store: manager.store?.uname || '',
                    addedBy: manager.addedBy?.uname || ''
                  }))}
                >
                  <Button variant='contained'>Export All Manager</Button>
                </CSVLink>
              ) : (
                <Button variant='contained' disabled>
                  Export All Manager
                </Button>
              )}
            </TablePaginationComponent>
          )}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
        />

        {/* View Manager Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth='md' fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Manager Details</DialogTitle>
          <DialogContent>
            {selectedManager && (
              <Box className='p-4'>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Manager Name
                      </Typography>
                      <Typography variant='body1'>{selectedManager?.uname}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Email
                      </Typography>
                      <Typography variant='body1'>{selectedManager.email}</Typography>
                    </Box>
                  </Grid>
                  {/* <Grid item xs={12} sm={6}>
                    <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Status
                      </Typography>
                      <Typography variant='body1'>{selectedManager.status}</Typography>
                    </Box>
                  </Grid> */}

                  <Grid item xs={12} sm={6}>
                    <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Telephone
                      </Typography>
                      <Typography variant='body1'>{selectedManager.telephone}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Address
                      </Typography>
                      <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedManager.address}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Created Time
                      </Typography>
                      <Typography variant='body1'>{formatDate(selectedManager.createdAt)}</Typography>
                    </Box>
                  </Grid>
                  {selectedManager.imageObj?.[0]?.url && (
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
                          src={selectedManager.imageObj[0].url}
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
          <DialogTitle>Edit Manager</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit(handleUpdateManager)}>
              <Grid container spacing={4} className='p-4'>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='uname'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Manager Name'
                        placeholder='Enter manager name'
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
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      },
                      required: false
                    }}
                    render={({ field }) => <CustomTextField {...field} fullWidth type='email' label='Email' />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='password'
                    control={control}
                    required={false}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type={isPasswordShown ? 'text' : 'password'}
                        label='Password'
                        placeholder='Enter password (leave blank to keep current)'
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
                {/* <Grid item xs={12} sm={6}>
                  <Controller
                    name='amount'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Franchise Amount'
                        placeholder='Enter amount'
                        type='number'
                        InputProps={{
                          startAdornment: <InputAdornment position='start'>$</InputAdornment>
                        }}
                      />
                    )}
                  />
                </Grid> */}
                {/* <Grid item xs={12} sm={6}>
                  <Controller
                    name='status'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth select label='Status' SelectProps={{ native: true }}>
                        <option value=''>Select Status</option>
                        <option value='active'>Active</option>
                        <option value='inactive'>Inactive</option>
                      </CustomTextField>
                    )}
                  />
                </Grid> */}
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
                      <CustomTextField {...field} fullWidth label='Telephone' placeholder='Phone number' />
                    )}
                  />
                </Grid>
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
            <Button variant='contained' disabled={btnLoading === 'update'} onClick={handleSubmit(handleUpdateManager)}>
              {btnLoading === 'update' ? (
                <DNA visible={true} height={22} ariaLabel='dna-loading' wrapperStyle={{}} wrapperClass='dna-wrapper' />
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  )
}

export default AdminManagement
