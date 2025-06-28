'use client'

import React, { useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  TextField,
  CircularProgress
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
// import { format } from 'date-fns'
import { useSnackbar } from 'notistack'
import Cookies from 'js-cookie'
import decryptDataObject from '@/@menu/utils/decrypt'
import axios from 'axios'

const PayrollReport = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const sessionToken = Cookies.get('sessionToken')
  const backendPostToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_POST_TOKEN
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  // const [date, setDate] = useState(null)
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    handleGenerateReport()
  }, [])

  const handleGenerateReport = async () => {
    try {
      setIsLoading(true)
      const decrypted = JSON.parse(decryptDataObject(sessionToken))?.tokens
      console.log('ok', decrypted)

      const setTokenInJson = JSON.stringify({
        postToken: backendPostToken,
        loginToken: decrypted || ''
      })

      const response = await axios.post(
        `${baseUrl}/backend/report/payroll`,
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
      console.log(response.data)

      setReport(response.data)
      enqueueSnackbar('Payroll report generated successfully', { variant: 'success' })
    } catch (error) {
      console.log(error)

      enqueueSnackbar('Failed to generate payroll report', { variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }
  // const handleGenerateReport = async () => {
  //   try {
  //     setIsLoading(true)
  //     const response = await generatePayrollReport({
  //       startDate: startDate ? format(startDate, 'yyyy-MM-dd') : null,
  //       endDate: endDate ? format(endDate, 'yyyy-MM-dd') : null
  //     })
  //     setReport(response.data)
  //     enqueueSnackbar('Payroll report generated successfully', { variant: 'success' })
  //   } catch (error) {
  //     enqueueSnackbar('Failed to generate payroll report', { variant: 'error' })
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <Card>
      <CardHeader title='Payroll Report' />
      <CardContent>
        <Box display='flex' gap={3} mb={3}>
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
          <Button variant='contained' onClick={handleGenerateReport} disabled={isLoading} sx={{ minWidth: 200 }}>
            {isLoading ? <CircularProgress size={24} /> : 'Generate Report'}
          </Button>
        </Box>

        {report?.payroll.length > 0 && (
          <>
            <Typography variant='h6' gutterBottom>
              Report Period: {report.startDate} to {report.endDate}
            </Typography>

            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell align='right'>Work Days</TableCell>
                    <TableCell align='right'>Salary (€)</TableCell>
                    <TableCell align='right'>Commission (€)</TableCell>
                    <TableCell align='right'>Expense (€)</TableCell>
                    <TableCell align='right'>Net Pay (€)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.payroll.map(row => (
                    <TableRow key={row.userId}>
                      <TableCell>{row.uname}</TableCell>
                      <TableCell align='right'>{row.workedDaysCount}</TableCell>
                      <TableCell align='right'>{row.salary.toFixed(2)}</TableCell>
                      <TableCell align='right'>{row.commission.toFixed(2)}</TableCell>
                      <TableCell align='right'>{row.expense.toFixed(2)}</TableCell>
                      <TableCell align='right'>{row.netPay.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

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
                      <TableCell>Total Salary</TableCell>
                      <TableCell align='right'>€{report.totalSalary.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Commission</TableCell>
                      <TableCell align='right'>€{report.totalCommission.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Expense</TableCell>
                      <TableCell align='right'>€{report.totalExpense.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight='bold'>Net Total</Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography fontWeight='bold'>€{report.totalNetPay.toFixed(2)}</Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default PayrollReport
