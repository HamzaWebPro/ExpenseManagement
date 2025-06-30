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
  Tooltip
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

const IncomeReport = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const sessionToken = Cookies.get('sessionToken')
  const backendPostToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_POST_TOKEN

  const [reportData, setReportData] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
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
        `${baseUrl}/backend/report/income`,
        {
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
      console.log(response)

      setReportData(response?.data)
    } catch (error) {
      console.error('Error fetching income report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Card sx={{ margin: 'auto' }}>
      <CardHeader
        title={
          <Typography variant='h4' align='center' gutterBottom>
            Store Income Report
          </Typography>
        }
        action={
          reportData && (
            <Box>
              <Tooltip title='Print'>
                <IconButton onClick={handlePrint}>
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Export PDF'>
                <IconButton>
                  <PdfIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Email'>
                <IconButton>
                  <EmailIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )
        }
      />
      <CardContent>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label='Start Date'
                value={startDate}
                onChange={setStartDate}
                renderInput={params => <TextField {...params} fullWidth />}
              />
              <DatePicker
                label='End Date'
                value={endDate}
                onChange={setEndDate}
                renderInput={params => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button variant='contained' onClick={fetchReport} disabled={loading} fullWidth>
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </Grid>
        </Grid>

        {reportData && (
          <Box
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              p: 4,
              backgroundColor: '#f9f9f9',
              // maxWidth: 500,
              margin: 'auto',
              boxShadow: '0px 0px 10px rgba(0,0,0,0.05)'
            }}
          >
            {/* Receipt Header - Changed text colors */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant='h5' gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
                {reportData.storeId?.uname}
              </Typography>
              <Typography variant='body2' sx={{ color: '#808069' }}>
                {reportData.storeId?.address}
              </Typography>
              <Typography variant='body2' sx={{ color: '#808069' }}>
                {`Phone: ${reportData?.storeId?.telephone}`}
              </Typography>
              <Typography variant='body2' gutterBottom sx={{ color: '#808069' }}>
                {new Date().toLocaleDateString()}
              </Typography>
              <Typography variant='h6' sx={{ mt: 2, fontWeight: 'bold', color: '#333' }}>
                INCOME REPORT
              </Typography>
              <Typography variant='body2' sx={{ color: '#808069' }}>
                {reportData.fromDate && `From: ${new Date(reportData.fromDate).toLocaleDateString()}`}
              </Typography>
              <Typography variant='body2' sx={{ color: '#808069' }}>
                {reportData.toDate && `To: ${new Date(reportData.toDate).toLocaleDateString()}`}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Receipt Body - Changed text colors */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: '#808069' }}>Total Sales:</Typography>
                <Typography fontWeight='bold' sx={{ color: '#333' }}>
                  €{reportData?.totalSales.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: '#808069' }}>Total Payroll:</Typography>
                <Typography fontWeight='bold' sx={{ color: '#333' }}>
                  €{reportData?.totalPayroll.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: '#808069' }}>Total Expenses:</Typography>
                <Typography fontWeight='bold' sx={{ color: '#333' }}>
                  €{reportData?.totalManagerExpenses.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

            {/* Receipt Footer - Changed text colors */}
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
                  €{reportData?.netIncome.toFixed(2)}
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
                  €{reportData?.totalCard.toFixed(2)}
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
                  €{reportData?.totalCash.toFixed(2)}
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
        )}
      </CardContent>
    </Card>
  )
}

export default IncomeReport
