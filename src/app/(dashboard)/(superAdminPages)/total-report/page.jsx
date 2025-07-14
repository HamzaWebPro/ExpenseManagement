'use client'
import { useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import axios from 'axios'
import decryptDataObject from '@/@menu/utils/decrypt'
import Cookies from 'js-cookie'
// SVG Icon Components
const PrintIcon = () => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z' />
  </svg>
)

const PdfIcon = () => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-1h8v1zm0-3H8v-1h8v1zm-3-5V3.5L18.5 10H13z' />
  </svg>
)

const EmailIcon = () => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' />
  </svg>
)

const SuperAdminIncomeReports = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const sessionToken = Cookies.get('sessionToken')
  const backendPostToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_POST_TOKEN

  const [reports, setReports] = useState([])
  const [stores, setStores] = useState([])
  const [summary, setSummary] = useState(null)
  const [totalSummary, setTotalSummary] = useState(null)
  const [selectedStore, setSelectedStore] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    let token = decryptDataObject(sessionToken)
    token = JSON.parse(token)
    token = token?.tokens

    const setTokenInJson = JSON.stringify({
      postToken: backendPostToken,
      loginToken: token
    })

    try {
      setLoading(true)
      const response = await axios.post(
        `${baseUrl}/backend/report/superadmin/income-report`,
        {
          storeId: selectedStore || undefined,
          startDate,
          endDate
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          },
          maxBodyLength: Infinity
        }
      )
      const response2 = await axios.post(
        `${baseUrl}/backend/report/superadmin/income-report-totals`,
        {
          storeId: selectedStore || undefined,
          startDate,
          endDate
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          },
          maxBodyLength: Infinity
        }
      )
      setTotalSummary(response2?.data?.summary)

      setReports(response?.data?.reports || [])
      setStores(response?.data?.stores || [])
      setSummary(response?.data?.summary || null)
    } catch (error) {
      console.error('Error fetching income reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async format => {
    try {
      setExporting(true)
      // Implement export logic here (PDF, CSV, etc.)
      // This would typically call a backend endpoint that generates the file
      console.log(`Exporting to ${format}...`)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card sx={{ margin: 'auto', p: 2 }}>
      <CardHeader
        title={
          <Typography variant='h4' gutterBottom>
            Income Reports Dashboard
          </Typography>
        }
        subheader='View and analyze income reports across all stores'
        action={
          <Box>
            <Tooltip title='Print'>
              <IconButton onClick={handlePrint} disabled={reports.length === 0}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Export PDF'>
              <IconButton onClick={() => handleExport('pdf')} disabled={reports.length === 0 || exporting}>
                {exporting ? <CircularProgress size={24} /> : <PdfIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title='Export CSV'>
              <IconButton onClick={() => handleExport('csv')} disabled={reports.length === 0 || exporting}>
                {exporting ? <CircularProgress size={24} /> : <EmailIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <CardContent>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Store</InputLabel>
              <Select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} label='Store'>
                <MenuItem value=''>All Stores</MenuItem>
                {stores.map(store => (
                  <MenuItem key={store._id} value={store._id}>
                    {store.uname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid> */}
          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label='Start Date'
                value={startDate}
                onChange={setStartDate}
                renderInput={params => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label='End Date'
                value={endDate}
                onChange={setEndDate}
                renderInput={params => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant='contained'
              onClick={fetchReports}
              disabled={loading}
              fullWidth
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Loading...' : 'Filter'}
            </Button>
          </Grid>
          <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant='h6' gutterBottom>
              Total Net Income : {totalSummary?.totalNetIncome}
            </Typography>
          </Grid>
        </Grid>

        {summary && (
          <Box sx={{ mb: 4, p: 3, backgroundColor: '#808069', borderRadius: 2 }}>
            <Typography variant='h6' gutterBottom>
              Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography color='textSecondary'>Total Reports</Typography>
                    <Typography variant='h5'>{summary.count}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography color='textSecondary'>Total Sales</Typography>
                    <Typography variant='h5'>{formatCurrency(summary.totalSales)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography color='textSecondary'>Total Net Income</Typography>
                    <Typography variant='h5'>{formatCurrency(summary.totalNetIncome)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography color='textSecondary'>Avg. Net Income</Typography>
                    <Typography variant='h5'>{formatCurrency(summary.averageNetIncome)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {loading && reports.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : reports.length > 0 ? (
          <>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary' }}>
                    <TableCell>Store</TableCell>
                    <TableCell align='right'>Period</TableCell>
                    <TableCell align='right'>Sales</TableCell>
                    <TableCell align='right'>Expenses</TableCell>
                    <TableCell align='right'>Payroll</TableCell>
                    <TableCell align='right'>Net Income</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map(report => (
                    <TableRow key={report._id} hover>
                      <TableCell>
                        <Typography fontWeight='bold'>{report.store?.uname || 'N/A'}</Typography>
                        <Typography variant='body2' color='textSecondary'>
                          {report.store?.address || ''}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        {formatDate(report.fromDate)} - {formatDate(report.toDate)}
                      </TableCell>
                      <TableCell align='right'>{formatCurrency(report.totalSales)}</TableCell>
                      <TableCell align='right'>{formatCurrency(report.totalManagerExpenses)}</TableCell>
                      <TableCell align='right'>{formatCurrency(report.totalPayroll)}</TableCell>
                      <TableCell align='right'>
                        <Typography fontWeight='bold' color={report.netIncome >= 0 ? 'success.main' : 'error.main'}>
                          {formatCurrency(report.netIncome)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.netIncome >= 0 ? 'Profitable' : 'Loss'}
                          color={report.netIncome >= 0 ? 'success' : 'error'}
                          size='small'
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant='h6' color='textSecondary'>
              No reports found matching your criteria
            </Typography>
            <Button
              variant='outlined'
              sx={{ mt: 2 }}
              onClick={() => {
                setSelectedStore('')
                setStartDate(null)
                setEndDate(null)
                fetchReports()
              }}
            >
              Clear filters
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default SuperAdminIncomeReports
