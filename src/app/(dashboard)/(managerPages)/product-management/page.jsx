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
import { Box, InputAdornment, Typography } from '@mui/material'

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
import CustomImageUploadField from '@/@core/components/mui/CustomImageUploadField'

// Icon Imports
import { IconChevronRight as ChevronRight } from '@tabler/icons-react'
import { IconEye as EyeOutline } from '@tabler/icons-react'
import { IconPencil as PencilOutline } from '@tabler/icons-react'
import { IconTrash as DeleteOutline } from '@tabler/icons-react'

// Style Imports
import styles from '@core/styles/table.module.css'
import axios from 'axios'
import Cookies from 'js-cookie'
import decryptDataObject from '@/@menu/utils/decrypt'
import formatDate from '@/@menu/utils/formatDate'
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

const ProductManagement = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const sessionToken = Cookies.get('sessionToken')
  const backendPostToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_POST_TOKEN
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  // States
  const [showAddForm, setShowAddForm] = useState(false)
  const [data, setData] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [btnLoading, setBtnLoading] = useState('')

  const fetchProducts = async () => {
    let token = decryptDataObject(sessionToken)
    token = JSON.parse(token)
    token = token?.tokens

    const setTokenInJson = JSON.stringify({
      getToken: backendGetToken,
      loginToken: token
    })
    try {
      const response = await axios.get(`${baseUrl}/backend/product/all`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })
      console.log(response)

      const productsArr = response?.data?.data || []
      if (productsArr.length > 0) {
        setData([...productsArr])
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchProducts()
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
      name: '',
      price: '',
      description: '',
      imageObj: []
    }
  })

  // Form Submit Handler
  const onSubmit = async formData => {
    setBtnLoading('submit')
    let token = decryptDataObject(sessionToken)
    token = JSON.parse(token)
    token = token?.tokens

    const setTokenInJson = JSON.stringify({
      postToken: backendPostToken,
      loginToken: token
    })

    try {
      const response = await axios.post(`${baseUrl}/backend/product/store`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      console.log('response', response)

      toast.success('Product Created Successfully!')
      fetchProducts()
      reset()
      setShowAddForm(false)
      setImagePreview('')
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Failed to create product')
    } finally {
      setBtnLoading('')
    }
  }

  // View Product Details
  const handleViewProduct = product => {
    setSelectedProduct(product)
    setViewDialogOpen(true)
  }

  // Edit Product
  const handleEditProduct = product => {
    setSelectedProduct(product)

    reset({
      id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
      status: product.status,
      imageObj: product.imageObj || []
    })

    // Set image preview if available
    if (product.imageObj && product.imageObj.length > 0) {
      setImagePreview(product.imageObj[0].url || '')
    } else {
      setImagePreview('')
    }

    setEditDialogOpen(true)
  }

  // Update Product
  const handleUpdateProduct = async formData => {
    setBtnLoading('update')
    if (!selectedProduct) return

    const updatedProduct = {
      ...formData,
      imageObj: formData.imageObj.length > 0 ? formData.imageObj : selectedProduct.imageObj || []
    }

    let token = decryptDataObject(sessionToken)
    token = JSON.parse(token)
    token = token?.tokens

    const setTokenInJson = JSON.stringify({
      postToken: backendPostToken,
      loginToken: token
    })

    try {
      const response = await axios.post(`${baseUrl}/backend/product/update`, updatedProduct, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      console.log('response', response)

      toast.success('Product Updated Successfully!')
      fetchProducts()
      setEditDialogOpen(false)
      reset()
      setImagePreview('')
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    } finally {
      setBtnLoading('')
    }
  }

  // Delete Product
  const handleDeleteProduct = async id => {
    setBtnLoading('delete')
    if (!id) return toast.error('Product ID is required')

    const confirm = window.confirm('Are you sure you want to delete this product?')
    if (!confirm) return
    try {
      let token = decryptDataObject(sessionToken)
      token = JSON.parse(token)
      token = token?.tokens

      const setTokenInJson = JSON.stringify({
        postToken: backendPostToken,
        loginToken: token
      })

      const response = await axios.post(
        `${baseUrl}/backend/product/destroy`,
        { id },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          },
          maxBodyLength: Infinity
        }
      )
      console.log('id', response)

      toast.success('Product Deleted Successfully!')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    } finally {
      setBtnLoading('')
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
      columnHelper.accessor('name', {
        cell: info => info.getValue(),
        header: 'Product Name'
      }),
      columnHelper.accessor('price', {
        cell: info => `$${info.getValue()}`,
        header: 'Price'
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
      columnHelper.accessor('id', {
        cell: info => (
          <div className='flex items-center gap-2'>
            <IconButton onClick={() => handleViewProduct(info.row.original)}>
              <EyeOutline className='text-textPrimary' />
            </IconButton>
            <IconButton onClick={() => handleEditProduct(info.row.original)}>
              <PencilOutline className='text-textPrimary' />
            </IconButton>
            <IconButton onClick={() => handleDeleteProduct(info.row.original._id)}>
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
    <>
      <Card>
        <CardHeader
          title='Product Management'
          action={
            <div className='flex items-center gap-4'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder='Search products...'
                className='min-is-[200px]'
              />
              <Button variant='contained' onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Hide Form' : 'Add Product'}
              </Button>
            </div>
          }
        />

        {/* Add Product Form */}
        {showAddForm && (
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={4}>
                {/* Product Name */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='name'
                    control={control}
                    rules={{ required: 'Product name is required' }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Product Name'
                        placeholder='Enter product name'
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Price */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='price'
                    control={control}
                    rules={{
                      required: 'Price is required',
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: 'Please enter a valid price'
                      }
                    }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Price'
                        placeholder='Enter price'
                        InputProps={{
                          startAdornment: <InputAdornment position='start'>$</InputAdornment>
                        }}
                        error={!!errors.price}
                        helperText={errors.price?.message}
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
                        label='Upload Product Image'
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
                  {imagePreview && (
                    <Box mt={2}>
                      <img
                        src={imagePreview}
                        alt='Preview'
                        style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                  )}
                </Grid>

                {/* Status */}
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
                </Grid>*/}

                {/* Description */}
                <Grid item xs={12}>
                  <Controller
                    name='description'
                    control={control}
                    rules={{ required: 'Description is required' }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Description'
                        placeholder='Enter product description'
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Buttons */}
                <Grid item xs={12} className='flex gap-4'>
                  <Button variant='contained' type='submit'>
                    {btnLoading === 'submit' ? (
                      <DNA
                        visible={true}
                        // className='h-full w-auto'
                        height={22}
                        ariaLabel='dna-loading'
                        wrapperStyle={{}}
                        wrapperClass='dna-wrapper'
                      />
                    ) : (
                      'Add Product'
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

        {/* Product Table */}
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
                    No products found
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
              <CSVLink filename='all_products' data={data}>
                <Button variant='contained'>Export All Products</Button>
              </CSVLink>
            </TablePaginationComponent>
          )}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
        />

        {/* View Product Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth='md' fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Product Details</DialogTitle>
          <DialogContent>
            {selectedProduct && (
              <Box className='p-4'>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Product Name
                      </Typography>
                      <Typography variant='body1'>{selectedProduct?.name}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Price
                      </Typography>
                      <Typography variant='body1'>${selectedProduct.price}</Typography>
                    </Box>
                  </Grid>
                  {/* <Grid item xs={12} sm={6}>
                    <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Status
                      </Typography>
                      <Typography variant='body1'>{selectedProduct.status}</Typography>
                    </Box>
                  </Grid> */}
                  <Grid item xs={12} sm={6}>
                    <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Created Time
                      </Typography>
                      <Typography variant='body1'>{formatDate(selectedProduct.createdAt)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Description
                      </Typography>
                      <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedProduct.description}
                      </Typography>
                    </Box>
                  </Grid>
                  {selectedProduct.imageObj?.[0]?.url && (
                    <Grid item xs={12} className='flex items-center justify-center'>
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
                          src={selectedProduct.imageObj[0].url}
                          alt='Product'
                          style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }}
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

        {/* Edit Product Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth='md' fullWidth>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit(handleUpdateProduct)}>
              <Grid container spacing={4} className='p-4'>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='name'
                    control={control}
                    rules={{ required: 'Product name is required' }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Product Name'
                        placeholder='Enter product name'
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='price'
                    control={control}
                    rules={{
                      required: 'Price is required',
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: 'Please enter a valid price'
                      }
                    }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Price'
                        placeholder='Enter price'
                        InputProps={{
                          startAdornment: <InputAdornment position='start'>$</InputAdornment>
                        }}
                        error={!!errors.price}
                        helperText={errors.price?.message}
                      />
                    )}
                  />
                </Grid>
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
                <Grid item xs={12}>
                  <Controller
                    name='imageObj'
                    control={control}
                    render={({ field: { onChange } }) => (
                      <div className='flex flex-col gap-2'>
                        <CustomImageUploadField
                          fullWidth
                          label='Upload Product Image'
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
                        {(imagePreview || (selectedProduct?.imageObj?.[0]?.url && !imagePreview)) && (
                          <div className='mt-2'>
                            <img
                              src={imagePreview || selectedProduct.imageObj[0].url}
                              alt='Preview'
                              className='max-h-[150px] max-w-full object-contain'
                            />
                          </div>
                        )}
                      </div>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name='description'
                    control={control}
                    rules={{ required: 'Description is required' }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Description'
                        placeholder='Enter product description'
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
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
            <Button variant='contained' onClick={handleSubmit(handleUpdateProduct)}>
              {btnLoading ? (
                <DNA visible={true} height={22} ariaLabel='dna-loading' wrapperStyle={{}} wrapperClass='dna-wrapper' />
              ) : (
                'Save Change'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  )
}

export default ProductManagement
