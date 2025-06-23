'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  TextField
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format } from 'date-fns'
import { useSnackbar } from 'notistack'
// import { getUsers, registerWorkday, getTodayWorkers } from '../../services/workdayService'
import TokenManager from '@/@menu/utils/token'
import Cookies from 'js-cookie'
import axios from 'axios'

const WorkdayRegister = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const sessionToken = Cookies.get('sessionToken')
  const backendPostToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_POST_TOKEN
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  const [users, setUsers] = useState([])
  const [entries, setEntries] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [date, setDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [todayWorkers, setTodayWorkers] = useState([])
  const [loadingWorkers, setLoadingWorkers] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    fetchTodayWorkers()
  }, [])

  const fetchTodayWorkers = async () => {
    try {
      setLoadingWorkers(true)
      const today = format(new Date(), 'yyyy-MM-dd')
      const loginToken = await TokenManager.getLoginToken(sessionToken)
      const setTokenInJson = JSON.stringify({
        getToken: backendGetToken,
        loginToken: loginToken || ''
      })
      const response = await axios.get(
        `${baseUrl}/backend/workday/today-workers`,
        // { date: today },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          },
          maxBodyLength: Infinity
        }
      )
      console.log(response.data)

      setUsers(response.data?.todayNotWorking)

      setTodayWorkers(response.data?.todayWorking)
      setEntries(response.data?.data?.entry)
    } catch (error) {
      enqueueSnackbar('Failed to load today workers', { variant: 'error' })
    } finally {
      setLoadingWorkers(false)
    }
  }

  const handleUserSelect = event => {
    setSelectedUsers(event.target.value)
  }

  const handleSubmitWorkday = async () => {
    try {
      setIsLoading(true)
      const loginToken = await TokenManager.getLoginToken(sessionToken)
      const setTokenInJson = JSON.stringify({
        postToken: backendPostToken,
        loginToken: loginToken || ''
      })
      const response = await axios.post(
        `${baseUrl}/backend/workday/register`,
        {
          userIds: selectedUsers,
          date: format(date, 'yyyy-MM-dd')
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

      enqueueSnackbar('Workday registered successfully!', { variant: 'success' })
      fetchTodayWorkers()
      setSelectedUsers([])
    } catch (error) {
      enqueueSnackbar('Failed to register workday', { variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Daily Workday Register' />
      <CardContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label='Work Date'
            value={date}
            onChange={setDate}
            renderInput={params => <TextField {...params} fullWidth sx={{ mb: 3 }} />}
          />
        </LocalizationProvider>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id='users-select-label'>Select Today's Workers</InputLabel>
          <Select
            labelId='users-select-label'
            id='users-select'
            multiple
            value={selectedUsers}
            onChange={handleUserSelect}
            label="Select Today's Workers"
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map(userId => {
                  const user = users.find(u => u._id === userId)
                  return <Typography key={userId}>{user?.uname}</Typography>
                })}
              </Box>
            )}
          >
            {users.length > 0 &&
              users.map(user => (
                <MenuItem key={user._id} value={user._id}>
                  <Checkbox checked={selectedUsers.indexOf(user._id) > -1} />
                  <ListItemText
                    primary={user.uname}
                    secondary={`Salary: €${user.dailySalary?.toFixed(2)} | Expense: €${user.dailyExpense?.toFixed(2)}`}
                  />
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>
          Today's Workers ({todayWorkers.length})
        </Typography>

        {loadingWorkers ? (
          <Box display='flex' justifyContent='center' p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Daily Salary</TableCell>
                  <TableCell>Daily Expense</TableCell>
                  <TableCell>Today Entry</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {todayWorkers.length > 0 ? (
                  todayWorkers.map(worker => {
                    // const entry = entries.reduce((amount, e) => {
                    //   return e.userId === worker.userId._id ? amount + e.amount : amount
                    // }, 0)
                    // console.log()

                    return (
                      <TableRow key={worker._id}>
                        <TableCell>{worker?.uname || 'Unknown'}</TableCell>
                        <TableCell>€{worker?.dailySalary?.toFixed(2)}</TableCell>
                        <TableCell>€{worker?.dailyExpense?.toFixed(2)}</TableCell>
                        <TableCell>
                          €{worker?.financialEntries.reduce((am, entry) => am + entry.amount, 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Typography color={worker.isWorking ? 'success.main' : 'error.main'}>
                            {worker.isWorking ? 'Working' : 'Absent'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align='center'>
                      No workers registered for today
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        <Button variant='contained' onClick={handleSubmitWorkday} disabled={isLoading || selectedUsers.length === 0}>
          {isLoading ? <CircularProgress size={24} /> : 'Register Workday'}
        </Button>
      </CardActions>
    </Card>
  )
}

export default WorkdayRegister
