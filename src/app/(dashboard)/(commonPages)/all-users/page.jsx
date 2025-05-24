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
import { Grid } from '@mui/material'

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

const AllUser = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const sessionToken = Cookies.get('sessionToken')
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  // States
  const [data, setData] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Fetch Users
  const fetchUsers = async () => {
    let token = decryptDataObject(sessionToken)
    token = JSON.parse(token)
    token = token?.tokens

    const setTokenInJson = JSON.stringify({
      getToken: backendGetToken,
      loginToken: token
    })

    try {
      const response = await axios.get(`${baseUrl}/backend/authentication/all-user`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      const usersArr = response?.data?.success?.data || []
      if (usersArr.length > 0) {
        setData([...usersArr])
      }
    } catch (error) {
      console.log('Error fetching users:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // View User Details
  const handleViewUser = user => {
    setSelectedUser(user)
    setViewDialogOpen(true)
  }

  // Table Columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('uname', {
        cell: info => info.getValue(),
        header: 'User Name'
      }),
      columnHelper.accessor('email', {
        cell: info => info.getValue(),
        header: 'Email'
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
            <IconButton onClick={() => handleViewUser(info.row.original)}>
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
        title='All Users'
        action={
          <div className='flex items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search users...'
              className='min-is-[200px]'
            />
            <CSVLink
              data={data.map(user => ({
                'User Name': user.uname,
                Email: user.email,
                'Shop Name': user.shop?.name || 'N/A',
                'Admin Name': user.admin?.uname || 'N/A',
                'Created Date': formatDate(user.createdAt),
                Telephone: user.telephone,
                Address: user.address
              }))}
              filename='all_users.csv'
            >
              <Button variant='contained'>Export to CSV</Button>
            </CSVLink>
          </div>
        }
      />

      {/* User Table */}
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
                  No users found
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
                      Admin Name
                    </Typography>
                    <Typography variant='body1'>{selectedUser.store?.uname || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Added By
                    </Typography>
                    <Typography variant='body1'>{selectedUser.store?.uname || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Telephone
                    </Typography>
                    <Typography variant='body1'>{selectedUser.telephone || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Address
                    </Typography>
                    <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedUser.address || 'N/A'}
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
                        alt='User'
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

export default AllUser
