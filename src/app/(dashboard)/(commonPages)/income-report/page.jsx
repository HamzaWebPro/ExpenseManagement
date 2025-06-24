'use client'
import { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Grid,
  TextField,
  Button,
  TableContainer,
  Box,
  Typography
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import axios from 'axios'
import formatDate from '@/@menu/utils/formatDate'
import decryptDataObject from '@/@menu/utils/decrypt'
import Cookies from 'js-cookie'

const IncomeReport = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const sessionToken = Cookies.get('sessionToken')
  const backendPostToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_POST_TOKEN
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  // Get current user role
  const currentUser = sessionToken ? JSON.parse(decryptDataObject(sessionToken)) : null
  const role = currentUser?.role || ''

  const [reportData, setReportData] = useState(null)
  const [date, setDate] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchReport = async () => {
    // if (!dateRange.start || !dateRange.end) return
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
          date
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          },
          maxBodyLength: Infinity
        }
      )
      console.log(response?.data)

      setReportData(response?.data)
    } catch (error) {
      console.error('Error fetching income report:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Store Income Report' />
      <CardContent>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label='End Date'
                value={date}
                onChange={setDate}
                renderInput={params => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <Button variant='contained' onClick={fetchReport} disabled={loading}>
              Generate Report
            </Button>
          </Grid>
        </Grid>
        <Box display='flex' justifyContent='flex-end'>
          <TableContainer component={Paper} sx={{ maxWidth: 500 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant='h6' align='center'>
                      Totals
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Total Sales</TableCell>
                  <TableCell align='right'>€{reportData?.totalSales.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Payroll</TableCell>
                  <TableCell align='right'>€{reportData?.totalPayroll.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Expense</TableCell>
                  <TableCell align='right'>€{reportData?.totalManagerExpenses.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight='bold'>Net Total</Typography>
                  </TableCell>
                  <TableCell align='right'>
                    <Typography fontWeight='bold'>€{reportData?.netIncome.toFixed(2)}</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

export default IncomeReport
