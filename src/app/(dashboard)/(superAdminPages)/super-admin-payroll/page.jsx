'use client'

import React, { use, useEffect, useState } from 'react'
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
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useSnackbar } from 'notistack'
import Cookies from 'js-cookie'
import decryptDataObject from '@/@menu/utils/decrypt'
import axios from 'axios'

const SuperAdminPayrollReport = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const sessionToken = Cookies.get('sessionToken')
  const backendPostToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_POST_TOKEN
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  const decodedUser = JSON.parse(decryptDataObject(sessionToken))
  const userRole = decodedUser?.role || ''

  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stores, setStores] = useState([])
  const [managers, setManagers] = useState([])
  const [selectedStore, setSelectedStore] = useState('')
  const [selectedManager, setSelectedManager] = useState('')
  const { enqueueSnackbar } = useSnackbar()

  // Fetch stores and managers
  const fetchStoresAndManagers = async () => {
    try {
      const decrypted = JSON.parse(decryptDataObject(sessionToken))?.tokens
      const setTokenInJson = JSON.stringify({
        getToken: backendGetToken,
        loginToken: decrypted || ''
      })

      console.log('ok', decrypted)
      const url =
        userRole === 'superAdmin'
          ? `${baseUrl}/backend/authentication/all-user`
          : `${baseUrl}/backend/authentication/all-added-user`
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      console.log('response', response.data.success.data, userRole)

      // Reset data arrays
      setStores([])
      setManagers([])
      const users = response?.data?.success?.data || []
      if (userRole === 'superAdmin') {
        // Categorize users by role
        users.forEach(user => {
          const userRole = user?.role?.toLowerCase()
          switch (userRole) {
            case 'admin':
              setStores(prev => [...prev, user])
              break
            case 'manager':
              setManagers(prev => [...prev, user])
              break
            default:
              break
          }
        })
      } else {
        console.log('Without superAdmin role, users:', users)

        console.log('users', users)

        setManagers([...users])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      enqueueSnackbar('Failed to fetch stores and managers', { variant: 'error' })
    }
  }

  useEffect(() => {
    fetchStoresAndManagers()
  }, [])

  // Set default store and manager when data loads
  useEffect(() => {
    if (stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0]?._id)
    }
  }, [stores, selectedStore])

  // Set default manager when store changes
  useEffect(() => {
    if (selectedStore && managers.length > 0) {
      const storeManagers = managers.filter(manager => manager.addedBy === selectedStore)
      if (storeManagers.length > 0 && !selectedManager) {
        setSelectedManager(storeManagers[0]?._id)
      }
    }
  }, [selectedStore, managers, selectedManager])

  const handleGenerateReport = async () => {
    try {
      if (!selectedManager) {
        enqueueSnackbar('Please select a manager', { variant: 'warning' })
        return
      }

      setIsLoading(true)
      const decrypted = JSON.parse(decryptDataObject(sessionToken))?.tokens

      const setTokenInJson = JSON.stringify({
        postToken: backendPostToken,
        loginToken: decrypted || ''
      })

      const response = await axios.post(
        `${baseUrl}/backend/report/super-admin/payroll`,
        {
          startDate,
          endDate,
          //   storeId: selectedStore,
          managerId: selectedManager
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          },
          maxBodyLength: Infinity
        }
      )

      console.log('Generating report with:', response)
      setReport(response.data)
      enqueueSnackbar('Payroll report generated successfully', { variant: 'success' })
    } catch (error) {
      console.error(error)
      enqueueSnackbar('Failed to generate payroll report', { variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  // Get managers for the selected store
  const getStoreManagers = () => {
    return managers.filter(manager => manager.addedBy._id === selectedStore)
  }

  return (
    <Card>
      <CardHeader title='Super Admin Payroll Report' />
      <CardContent>
        <Box display='flex' gap={3} mb={3} flexWrap='wrap'>
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
          {userRole === 'superAdmin' && (
            <FormControl fullWidth>
              <InputLabel>Store</InputLabel>
              <Select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} label='Store'>
                {stores.map(store => (
                  <MenuItem key={store._id} value={store._id}>
                    {store.uname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {userRole === 'superAdmin' ? (
            <>
              <FormControl fullWidth>
                <InputLabel>Manager</InputLabel>
                <Select
                  value={selectedManager}
                  onChange={e => setSelectedManager(e.target.value)}
                  label='Manager'
                  disabled={!selectedStore || getStoreManagers().length === 0}
                >
                  {getStoreManagers().map(manager => (
                    <MenuItem key={manager._id} value={manager._id}>
                      {manager.uname}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant='contained'
                onClick={handleGenerateReport}
                disabled={isLoading || !selectedStore || !selectedManager}
                sx={{ minWidth: 200 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Generate Report'}
              </Button>
            </>
          ) : (
            <>
              <FormControl fullWidth>
                <InputLabel>Manager</InputLabel>
                <Select
                  value={selectedManager}
                  onChange={e => setSelectedManager(e.target.value)}
                  label='Manager'
                  // disabled={getStoreManagers().length === 0}
                >
                  {managers.map(manager => (
                    <MenuItem key={manager._id} value={manager._id}>
                      {manager.uname}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant='contained'
                onClick={handleGenerateReport}
                disabled={isLoading || !selectedManager}
                sx={{ minWidth: 200 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Generate Report'}
              </Button>
            </>
          )}
          {/* 
          <FormControl fullWidth>
            <InputLabel>Manager</InputLabel>
            <Select
              value={selectedManager}
              onChange={e => setSelectedManager(e.target.value)}
              label='Manager'
              disabled={getStoreManagers().length === 0}
            >
              {getStoreManagers().map(manager => (
                <MenuItem key={manager._id} value={manager._id}>
                  {manager.uname}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
        </Box>

        {report?.payroll?.length > 0 && (
          <>
            <Typography variant='h6' gutterBottom>
              Report Period: {report.fromDate} to {report.toDate}
            </Typography>
            <Typography variant='subtitle1' gutterBottom>
              Store: {stores.find(s => s._id === selectedStore)?.uname} | Manager:{' '}
              {managers.find(m => m._id === selectedManager)?.uname}
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

export default SuperAdminPayrollReport
