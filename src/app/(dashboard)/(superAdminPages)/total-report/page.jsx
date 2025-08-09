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
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import axios from 'axios'
import decryptDataObject from '@/@menu/utils/decrypt'
import Cookies from 'js-cookie'
import Close from '@/@menu/svg/Close'

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
  const [openPopup, setOpenPopup] = useState(false)
  const [selectedStoreData, setSelectedStoreData] = useState(null)
  const [incomeReportData, setIncomeReportData] = useState(null)
  const [incomeReportLoading, setIncomeReportLoading] = useState(false)

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

      console.log(response.data)
      console.log(response2.data)

      setTotalSummary(response2?.data?.summary)
      setReports(response?.data?.reports || [])
      setStores(response?.data?.stores || [])
      setSummary(response2?.data?.summary || null)
    } catch (error) {
      console.error('Error fetching income reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async format => {
    try {
      setExporting(true)
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

  const handleStoreClick = async report => {
    let token = decryptDataObject(sessionToken)
    token = JSON.parse(token)
    token = token?.tokens

    const setTokenInJson = JSON.stringify({
      postToken: backendPostToken,
      loginToken: token
    })

    try {
      setIncomeReportLoading(true)
      setSelectedStoreData(report)

      const response = await axios.post(
        `${baseUrl}/backend/report/income`,
        {
          storeId: report.store.id,
          startDate: report.fromDate,
          endDate: report.toDate
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          },
          maxBodyLength: Infinity
        }
      )
      console.log(response.data)

      setIncomeReportData(response?.data)
      setOpenPopup(true)
    } catch (error) {
      console.error('Error fetching income report:', error)
    } finally {
      setIncomeReportLoading(false)
    }
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
            <Typography variant='h4' gutterBottom>
              Total: {formatCurrency(totalSummary?.totalNetIncome || 0)}
            </Typography>
          </Grid>
        </Grid>

        {summary && (
          <Box sx={{ mb: 4, p: 3, backgroundColor: 'main', borderRadius: 2 }}>
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
                    <Typography variant='h5'>{summary.averageNetIncome}</Typography>
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
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
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
                  {reports.map((report, index) => {
                    console.log('report', report)

                    return (
                      <TableRow key={index} hover onClick={() => handleStoreClick(report)} sx={{ cursor: 'pointer' }}>
                        <TableCell>
                          <Typography fontWeight='bold'>{report?.store?.uname || 'N/A'}</Typography>
                          <Typography variant='body2' color='textSecondary'>
                            {report?.store?.address || ''}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          {formatDate(report?.fromDate)} - {formatDate(report?.toDate)}
                        </TableCell>
                        <TableCell align='right'>{formatCurrency(report?.totalSales)}</TableCell>
                        <TableCell align='right'>{formatCurrency(report?.totalManagerExpenses)}</TableCell>
                        <TableCell align='right'>{formatCurrency(report?.totalPayroll)}</TableCell>
                        <TableCell align='right'>
                          <Typography fontWeight='bold' color={report?.netIncome >= 0 ? 'success.main' : 'error.main'}>
                            {formatCurrency(report?.netIncome)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={report?.netIncome >= 0 ? 'Profitable' : 'Loss'}
                            color={report?.netIncome >= 0 ? 'success' : 'error'}
                            size='small'
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
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

        {/* Income Report Popup */}
        <Dialog open={openPopup} onClose={() => setOpenPopup(false)} maxWidth='md' fullWidth>
          <DialogTitle>
            Income Report for {selectedStoreData?.store?.uname || 'Store'}
            <IconButton onClick={() => setOpenPopup(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {incomeReportLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : incomeReportData ? (
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 4,
                  backgroundColor: '#f9f9f9',
                  margin: 'auto',
                  boxShadow: '0px 0px 10px rgba(0,0,0,0.05)'
                }}
              >
                {/* Receipt Header */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant='h5' gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
                    {selectedStoreData.store?.uname}
                  </Typography>
                  <Typography variant='body2' sx={{ color: '#808069' }}>
                    {incomeReportData.storeId?.address}
                  </Typography>
                  <Typography variant='body2' sx={{ color: '#808069' }}>
                    {`Phone: ${incomeReportData?.storeId?.telephone}`}
                  </Typography>
                  <Typography variant='body2' gutterBottom sx={{ color: '#808069' }}>
                    {new Date().toLocaleDateString()}
                  </Typography>
                  <Typography variant='h6' sx={{ mt: 2, fontWeight: 'bold', color: '#333' }}>
                    INCOME REPORT
                  </Typography>
                  <Typography variant='body2' sx={{ color: '#808069' }}>
                    {incomeReportData.fromDate && `From: ${formatDate(incomeReportData.fromDate)}`}
                  </Typography>
                  <Typography variant='body2' sx={{ color: '#808069' }}>
                    {incomeReportData.toDate && `To: ${formatDate(incomeReportData.toDate)}`}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Receipt Body */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ color: '#808069' }}>Total Sales:</Typography>
                    <Typography fontWeight='bold' sx={{ color: '#333' }}>
                      {formatCurrency(incomeReportData?.totalSales)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ color: '#808069' }}>Total Payroll:</Typography>
                    <Typography fontWeight='bold' sx={{ color: '#333' }}>
                      {formatCurrency(incomeReportData?.totalPayroll)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography fontWeight='bold' sx={{ color: '#808069' }}>
                      Manager Expenses
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    {incomeReportData?.managerExpense.length > 0 &&
                      incomeReportData.managerExpense.map(exp => (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography sx={{ color: '#808069' }}>{exp.addedBy.uname}</Typography>
                          <Typography fontWeight='bold' sx={{ color: '#333' }}>
                            €{exp?.amount.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography fontWeight='bold' sx={{ color: '#808069' }}>
                      Your Expenses
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    {incomeReportData?.storeExpense.length > 0 &&
                      incomeReportData.storeExpense.map(exp => (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography sx={{ color: '#808069' }}>{exp.addedBy.uname}</Typography>
                          <Typography fontWeight='bold' sx={{ color: '#333' }}>
                            €{exp?.amount.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography fontWeight='bold' sx={{ color: '#808069' }}>
                      Total Expenses:
                    </Typography>
                    <Typography fontWeight='bold' sx={{ color: '#333' }}>
                      {formatCurrency(incomeReportData?.totalManagerExpenses)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                {/* Receipt Footer */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      backgroundColor: '#f0f0f0',
                      p: 2,
                      borderRadius: 1,
                      mb: 2
                    }}
                  >
                    <Typography variant='h6' sx={{ color: '#333' }}>
                      NET INCOME:
                    </Typography>
                    <Typography variant='h6' fontWeight='bold' sx={{ color: '#333' }}>
                      {formatCurrency(incomeReportData?.netIncome)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      backgroundColor: '#f0f0f0',
                      p: 2,
                      borderRadius: 1,
                      mb: 2
                    }}
                  >
                    <Typography variant='h6' sx={{ color: '#333' }}>
                      Total Card Payment:
                    </Typography>
                    <Typography variant='h6' fontWeight='bold' sx={{ color: '#333' }}>
                      {formatCurrency(incomeReportData?.totalCard)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      backgroundColor: '#f0f0f0',
                      p: 2,
                      borderRadius: 1,
                      mb: 2
                    }}
                  >
                    <Typography variant='h6' sx={{ color: '#333' }}>
                      Total Cash Payment:
                    </Typography>
                    <Typography variant='h6' fontWeight='bold' sx={{ color: '#333' }}>
                      {formatCurrency(incomeReportData?.totalCash)}
                    </Typography>
                  </Box>
                  <Typography variant='body2' sx={{ color: '#333', mt: 3 }}>
                    Thank you for your business!
                  </Typography>
                  <Typography variant='caption' sx={{ color: '#333' }}>
                    Report generated at: {new Date().toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant='body1' align='center' sx={{ py: 4 }}>
                No income report data available
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPopup(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default SuperAdminIncomeReports
