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
  TableContainer
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

  const [reportData, setReportData] = useState([])
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  })
  const [loading, setLoading] = useState(false)

  const fetchReport = async () => {
    if (!dateRange.start || !dateRange.end) return
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
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString()
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

      setReportData(response?.data?.data?.reportRows)
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
                label='Start Date'
                value={dateRange.start}
                onChange={date => setDateRange({ ...dateRange, start: date })}
                renderInput={params => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label='End Date'
                value={dateRange.end}
                onChange={date => setDateRange({ ...dateRange, end: date })}
                renderInput={params => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <Button variant='contained' onClick={fetchReport} disabled={!dateRange.start || !dateRange.end || loading}>
              Generate Report
            </Button>
          </Grid>
        </Grid>

        {reportData.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Sales (€)</TableCell>
                  <TableCell>Expenses (€)</TableCell>
                  <TableCell>Payroll (€)</TableCell>
                  <TableCell>Net Income (€)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map(row => (
                  <TableRow key={row.date}>
                    <TableCell>{formatDate(row.date)}</TableCell>
                    <TableCell>{row?.sales.toFixed(2)}</TableCell>
                    <TableCell>{row?.managerExpenses.toFixed(2)}</TableCell>
                    <TableCell>{row?.payroll.toFixed(2)}</TableCell>
                    <TableCell>{row?.netIncome.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default IncomeReport
