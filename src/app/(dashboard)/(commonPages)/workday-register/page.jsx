'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  TextField,
  Typography
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format } from 'date-fns'
import decryptDataObject from '@/@menu/utils/decrypt'
import Cookies from 'js-cookie'

const WorkdayRegister = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const sessionToken = Cookies.get('sessionToken')
  const backendPostToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_POST_TOKEN
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  // Get current user role
  const currentUser = sessionToken ? JSON.parse(decryptDataObject(sessionToken)) : null
  const role = currentUser?.role || ''
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [date, setDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
    setDate(new Date())
  }, [])

  const fetchUsers = async () => {
    let token = decryptDataObject(sessionToken)
    token = JSON.parse(token)
    token = token?.tokens

    const setTokenInJson = JSON.stringify({
      getToken: backendGetToken,
      loginToken: token
    })

    try {
      const response = await axios.get(`${baseUrl}/backend/authentication/all-user`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      const usersArr = response?.data?.success?.data || []
      if (usersArr.length > 0) {
        setUsers([...usersArr])
      }
    } catch (error) {
      console.log('Error fetching users:', error)
    }
  }

  const handleToggleUser = userId => {
    setSelectedUsers(prev => (prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    let token = decryptDataObject(sessionToken)
    token = JSON.parse(token)
    token = token?.tokens

    const setTokenInJson = JSON.stringify({
      postToken: backendPostToken,
      loginToken: token
    })

    try {
      await axios.post(
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
      fetchUsers()
      setSelectedUsers([])
    } catch (error) {
      console.error('Error saving workday:', error)
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

        <Typography variant='h6' gutterBottom>
          Select Users Present Today
        </Typography>

        <List>
          {users.map(user => (
            <ListItem key={user._id} disablePadding>
              <ListItemButton onClick={() => handleToggleUser(user._id)}>
                <Checkbox edge='start' checked={selectedUsers.includes(user._id)} tabIndex={-1} disableRipple />
                <ListItemText
                  primary={user.uname}
                  secondary={
                    <>
                      <span>Salary: €{user?.dailySalary?.toFixed(2)}</span>
                      <span> | Expense: €{user?.dailyExpense?.toFixed(2)}</span>
                    </>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        <Button variant='contained' onClick={handleSubmit} disabled={isLoading || selectedUsers.length === 0}>
          {isLoading ? 'Saving...' : 'Save Workday'}
        </Button>
      </CardActions>
    </Card>
  )
}

export default WorkdayRegister
