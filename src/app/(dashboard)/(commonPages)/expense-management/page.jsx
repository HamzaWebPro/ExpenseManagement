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
import TextField from '@mui/material/TextField'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

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

// Style Imports
import styles from '@core/styles/table.module.css'
import axios from 'axios'
import Cookies from 'js-cookie'
import decryptDataObject from '@/@menu/utils/decrypt'
import formatDate from '@/@menu/utils/formatDate'
import { formatDistance, formatDistanceToNow } from 'date-fns'
import { fi } from 'date-fns/locale'
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

const ExpenseManagement = () => {
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
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [btnLoading, setBtnLoading] = useState('')

  const fetchExpenses = async () => {
    let token = decryptDataObject(sessionToken)
    token = JSON.parse(token)
    token = token?.tokens

    const setTokenInJson = JSON.stringify({
      getToken: backendGetToken,
      loginToken: token
    })
    try {
      const response = await axios.get(`${baseUrl}/backend/expense/get-expense`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      const expensesArr = response?.data?.data || []
      if (expensesArr.length > 0) {
        setData([...expensesArr])
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchExpenses()
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
      title: '',
      amount: '',
      date: new Date(),
      description: ''
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
      const response = await axios.post(`${baseUrl}/backend/expense/store`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      toast.success('Expense Added Successfully!')
      fetchExpenses()
      reset()
      setShowAddForm(false)
    } catch (error) {
      console.error('Error creating expense:', error)
      toast.error('Failed to add expense')
    } finally {
      setBtnLoading('')
    }
  }

  // View Expense Details
  const handleViewExpense = expense => {
    setSelectedExpense(expense)
    setViewDialogOpen(true)
  }

  // Edit Expense
  const handleEditExpense = expense => {
    setBtnLoading('update')
    setSelectedExpense(expense)

    reset({
      id: expense._id,
      title: expense.title,
      amount: expense.amount,
      date: new Date(expense.date),
      description: expense.description
    })

    setEditDialogOpen(true)
  }

  // Update Expense
  const handleUpdateExpense = async formData => {
    if (!selectedExpense) return
    // console.log(expense)

    let token = decryptDataObject(sessionToken)
    token = JSON.parse(token)
    token = token?.tokens

    const setTokenInJson = JSON.stringify({
      postToken: backendPostToken,
      loginToken: token
    })

    try {
      const response = await axios.post(`${baseUrl}/backend/expense/update`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      console.log(response)

      toast.success('Expense Updated Successfully!')
      fetchExpenses()
      setEditDialogOpen(false)
      reset()
    } catch (error) {
      console.error('Error updating expense:', error)
      toast.error('Failed to update expense')
    } finally {
      setBtnLoading('')
    }
  }

  // Delete Expense
  const handleDeleteExpense = async id => {
    const confirm = window.confirm('Are you sure you want to delete this expense?')
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
        `${baseUrl}/backend/expense/destroy`,
        { id },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          },
          maxBodyLength: Infinity
        }
      )

      toast.success('Expense Deleted Successfully!')
      fetchExpenses()
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Failed to delete expense')
    }
  }

  // Reset Form
  const handleResetForm = () => {
    reset()
  }

  // Table Columns
  const columns = useMemo(() => {
    const sessionToken = Cookies.get('sessionToken')
    const role = JSON.parse(decryptDataObject(sessionToken))?.role

    console.log(role)

    return [
      columnHelper.accessor('title', {
        cell: info => info.getValue(),
        header: 'Expense Title'
      }),
      columnHelper.accessor('amount', {
        cell: info => `$${info.getValue()}`,
        header: 'Amount'
      }),
      columnHelper.accessor('date', {
        cell: info => {
          let date = new Date(info.getValue())
          date = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
          return date
        },
        header: 'Date'
      }),
      role === 'admin' &&
        columnHelper.accessor('addedBy', {
          cell: info => info.getValue()?.email || '',
          header: 'Added By'
        }),
      columnHelper.accessor('id', {
        cell: info => (
          <div className='flex items-center gap-2'>
            <IconButton onClick={() => handleViewExpense(info.row.original)}>
              <EyeOutline className='text-textPrimary' />
            </IconButton>
            {role === 'admin' && (
              <>
                <IconButton onClick={() => handleEditExpense(info.row.original)}>
                  <PencilOutline className='text-textPrimary' />
                </IconButton>
                <IconButton onClick={() => handleDeleteExpense(info.row.original._id)}>
                  <DeleteOutline className='text-textPrimary' />
                </IconButton>
              </>
            )}
          </div>
        ),
        header: 'Actions',
        size: 120
      })
    ].filter(Boolean)
  }, [Cookies.get('sessionToken')]) // Adjusted dependency to avoid stale value

  const fuzzyFilter = (row, columnId, value, addMeta) => {
    const columnsToSearch = ['title', 'amount', 'date', 'addedBy']

    for (const column of columnsToSearch) {
      // Special handling for addedBy to search both username and email
      if (column === 'addedBy') {
        const addedBy = row.getValue(column)
        const emailMatch = rankItem(addedBy?.email || '', value)
        const unameMatch = rankItem(addedBy?.uname || '', value)

        if (emailMatch.passed || unameMatch.passed) {
          addMeta({ itemRank: emailMatch.passed ? emailMatch : unameMatch })
          return true
        }
      } else {
        const itemRank = rankItem(row.getValue(column), value)
        if (itemRank.passed) {
          addMeta({ itemRank })
          return true
        }
      }
    }

    return false
  }

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
          title='Expense Management'
          action={
            <div className='flex items-center gap-4'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder='Search expenses...'
                className='min-is-[200px]'
              />
              <Button variant='contained' onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Hide Form' : 'Add Expense'}
              </Button>
            </div>
          }
        />

        {/* Add Expense Form */}
        {showAddForm && (
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={4}>
                {/* Expense Title */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='title'
                    control={control}
                    rules={{ required: 'Expense title is required' }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Expense Title'
                        placeholder='Enter expense title'
                        error={!!errors.title}
                        helperText={errors.title?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Amount */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='amount'
                    control={control}
                    rules={{
                      required: 'Amount is required',
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: 'Please enter a valid amount'
                      }
                    }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Amount'
                        placeholder='Enter amount'
                        InputProps={{
                          startAdornment: <InputAdornment position='start'>$</InputAdornment>
                        }}
                        error={!!errors.amount}
                        helperText={errors.amount?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Date */}
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Controller
                      name='date'
                      control={control}
                      rules={{ required: 'Date is required' }}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label='Expense Date'
                          renderInput={params => (
                            <TextField {...params} fullWidth error={!!errors.date} helperText={errors.date?.message} />
                          )}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>

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
                        placeholder='Enter expense description'
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
                    {btnLoading === 'percentage' ? (
                      <DNA
                        visible={true}
                        height={22}
                        ariaLabel='dna-loading'
                        wrapperStyle={{}}
                        wrapperClass='dna-wrapper'
                      />
                    ) : (
                      'Add Expense'
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

        {/* Expense Table */}
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
                    No expenses found
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
              <CSVLink filename='all_expenses' data={data}>
                <Button variant='contained'>Export All Expenses</Button>
              </CSVLink>
            </TablePaginationComponent>
          )}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
        />

        {/* View Expense Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth='md' fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Expense Details</DialogTitle>
          <DialogContent>
            {selectedExpense && (
              <Box className='p-4'>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Expense Title
                      </Typography>
                      <Typography variant='body1'>{selectedExpense?.title}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Amount
                      </Typography>
                      <Typography variant='body1'>${selectedExpense.amount}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Date
                      </Typography>
                      <Typography variant='body1'>{formatDate(selectedExpense.date)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box p={2} borderRadius={2} boxShadow={1} bgcolor='background.paper'>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Description
                      </Typography>
                      <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedExpense.description}
                      </Typography>
                    </Box>
                  </Grid>
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

        {/* Edit Expense Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth='md' fullWidth>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit(handleUpdateExpense)}>
              <Grid container spacing={4} className='p-4'>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='title'
                    control={control}
                    // rules={{ required: 'Expense title is required' }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Expense Title'
                        placeholder='Enter expense title'
                        error={!!errors.title}
                        helperText={errors.title?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='amount'
                    control={control}
                    rules={{
                      // required: 'Amount is required',
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: 'Please enter a valid amount'
                      }
                    }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Amount'
                        placeholder='Enter amount'
                        InputProps={{
                          startAdornment: <InputAdornment position='start'>$</InputAdornment>
                        }}
                        error={!!errors.amount}
                        helperText={errors.amount?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Controller
                      name='date'
                      control={control}
                      // rules={{ required: 'Date is required' }}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label='Expense Date'
                          renderInput={params => (
                            <TextField {...params} fullWidth error={!!errors.date} helperText={errors.date?.message} />
                          )}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name='description'
                    control={control}
                    // rules={{ required: 'Description is required' }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Description'
                        placeholder='Enter expense description'
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
              }}
            >
              Cancel
            </Button>
            <Button variant='contained' onClick={handleSubmit(handleUpdateExpense)}>
              {btnLoading === 'percentage' ? (
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

export default ExpenseManagement
