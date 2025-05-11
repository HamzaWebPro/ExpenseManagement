'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'
import { CSVLink } from 'react-csv'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

// Third-party Imports
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

// Utility Imports
import axios from 'axios'
import Cookies from 'js-cookie'
import decryptDataObject from '@/@menu/utils/decrypt'
import formatDate from '@/@menu/utils/formatDate'
import styles from '@core/styles/table.module.css'

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

const AllProducts = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const sessionToken = Cookies.get('sessionToken')
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  // States
  const [data, setData] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Fetch Products
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
      console.log('Error fetching products:', error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // View Product Details
  const handleViewProduct = product => {
    setSelectedProduct(product)
    setViewDialogOpen(true)
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
      columnHelper.accessor('store.uname', {
        cell: info => info.getValue() || 'N/A',
        header: 'Shop Name'
      }),
      columnHelper.accessor('addedBy.uname', {
        cell: info => info.getValue() || 'N/A',
        header: 'Added By'
      }),
      columnHelper.accessor('createdAt', {
        cell: info => formatDate(info.getValue()),
        header: 'Created Date'
      }),
      columnHelper.accessor('id', {
        cell: info => (
          <div className='flex items-center gap-2'>
            <IconButton onClick={() => handleViewProduct(info.row.original)}>
              <EyeOutline className='text-textPrimary' />
            </IconButton>
          </div>
        ),
        header: 'Actions',
        size: 80
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
        title='All Products'
        action={
          <div className='flex items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search products...'
              className='min-is-[200px]'
            />
            <CSVLink
              data={data.map(product => ({
                'Product Name': product.name,
                Price: `$${product.price}`,
                'Shop Name': product.store?.uname || 'N/A',
                'Added By': product.addedBy?.uname || 'N/A',
                'Created Date': formatDate(product.createdAt),
                Description: product.description
              }))}
              filename='all_products.csv'
            >
              <Button variant='contained'>Export to CSV</Button>
            </CSVLink>
          </div>
        }
      />

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
        component={() => <TablePaginationComponent table={table} />}
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
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Shop Name
                    </Typography>
                    <Typography variant='body1'>{selectedProduct.store?.uname || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Added By
                    </Typography>
                    <Typography variant='body1'>{selectedProduct.addedBy?.uname || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Description
                    </Typography>
                    <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedProduct.description || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Created Time
                    </Typography>
                    <Typography variant='body1'>{formatDate(selectedProduct.createdAt)}</Typography>
                  </Box>
                </Grid>
                {selectedProduct.photoUrl?.[0] && (
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
                        src={selectedProduct.photoUrl[0]}
                        alt='Product'
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
    </Card>
  )
}

export default AllProducts
