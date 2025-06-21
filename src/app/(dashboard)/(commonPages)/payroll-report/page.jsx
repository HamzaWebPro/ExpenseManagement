'use client'
import { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  TextField,
  Button,
  Typography
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import axios from 'axios'
import decryptDataObject from '@/@menu/utils/decrypt'
import Cookies from 'js-cookie'

const PayrollReport = () => {
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
    setLoading(true)

    if (!dateRange.start || !dateRange.end) return

    try {
      const decrypted = JSON.parse(decryptDataObject(sessionToken))?.tokens

      const setTokenInJson = JSON.stringify({
        postToken: backendPostToken,
        loginToken: decrypted || ''
      })

      const response = await axios.post(
        `${baseUrl}/backend/report/payroll`, // URL
        {
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString()
        }, // BODY (goes here for POST)
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          },
          maxBodyLength: Infinity
        }
      )

      console.log('response', response)
      setReportData(response.data.data.payrollData)
    } catch (error) {
      console.error('Error fetching payroll:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Payroll Report' />
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
                  <TableCell>User</TableCell>
                  <TableCell>Work Days</TableCell>
                  <TableCell>Salary (€)</TableCell>
                  <TableCell>Commission (€)</TableCell>
                  <TableCell>Expense (€)</TableCell>
                  <TableCell>Total (€)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map(
                  row =>
                    row?.workDays > 0 && (
                      <TableRow key={row?.userId}>
                        <TableCell>{row?.userName}</TableCell>
                        <TableCell>{row?.workDays}</TableCell>
                        <TableCell>{(row?.salary * row?.workDays || 0).toFixed(2)}</TableCell>
                        <TableCell>{row?.commission.toFixed(2)}</TableCell>
                        <TableCell>{(row?.expense * 7).toFixed(2)}</TableCell>
                        <TableCell>
                          {(row?.salary * row?.workDays + row?.commission - row?.expense).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default PayrollReport
