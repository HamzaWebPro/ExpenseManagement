'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'

// Icon Imports
import { Icon } from '@iconify/react'

// Third-party Imports
import axios from 'axios'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'

// Utility Imports
import decryptDataObject from '@/@menu/utils/decrypt'
import formatDate from '@/@menu/utils/formatDate'

const AdminDashboard = () => {
  // State
  const [dashboardData, setDashboardData] = useState({
    managerCount: 0,
    userCount: 0,
    productCount: 0,
    expenseCount: 0,
    recentManagers: [],
    recentUsers: [],
    recentExpenses: []
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Constants
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  // Fatch recent users data
  const recentUsers = async setTokenInJson => {
    try {
      const response = await axios.get(`${baseUrl}/backend/authentication/all-user`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        }
      })
      console.log('recentUsers', response)

      if (response.data.success) {
        setDashboardData(prevData => ({
          ...prevData,
          recentUsers: response.data.success.data,
          userCount: response.data.success.data.length
        }))
      }
    } catch (error) {
      console.error('Error fetching recent managers:', error)
      toast.error('Failed to load recent managers')
    }
  }

  // Fatch recent products data
  const recentProducts = async setTokenInJson => {
    try {
      const response = await axios.get(`${baseUrl}/backend/product/all`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        }
      })
      console.log('recentProducts', response)
      if (response.data.data) {
        setDashboardData(prevData => ({
          ...prevData,
          recentProducts: response.data.data,
          productCount: response.data.data.length
        }))
      }
    } catch (error) {
      console.error('Error fetching recent products:', error)
      toast.error('Failed to load recent products')
    }
  }

  // Fatch recent expenses data
  const recentExpenses = async setTokenInJson => {
    try {
      const response = await axios.get(`${baseUrl}/backend/expense/get-expense`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        }
      })
      console.log('recentExpenses', response)
      if (response.data.data) {
        setDashboardData(prevData => ({
          ...prevData,
          recentExpenses: response.data.data,
          expenseCount: response.data.data.length
        }))
      }
    } catch (error) {
      console.error('Error fetching recent expenses:', error)
      toast.error('Failed to load recent expenses')
    }
  }

  // Fatch recent managers data
  const recentManagers = async setTokenInJson => {
    try {
      const response = await axios.get(`${baseUrl}/backend/authentication/all-manager`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        }
      })
      console.log('recentManagers', response)
      if (response.data.success) {
        setDashboardData(prevData => ({
          ...prevData,
          recentManagers: response.data.success.data,
          managerCount: response.data.success.data.length
        }))
      }
    } catch (error) {
      console.error('Error fetching recent managers:', error)
      toast.error('Failed to load recent managers')
    }
  }

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const sessionToken = Cookies.get('sessionToken')
      let token = decryptDataObject(sessionToken)
      token = JSON.parse(token)
      token = token?.tokens

      const setTokenInJson = JSON.stringify({
        getToken: backendGetToken,
        loginToken: token
      })

      // Fetch recent managers
      await recentManagers(setTokenInJson)

      // Fetch recent users
      await recentUsers(setTokenInJson)

      // Fetch recent products
      await recentProducts(setTokenInJson)

      // Fetch recent expenses
      await recentExpenses(setTokenInJson)

      // Fetch recent managers
      // await recentManagers(setTokenInJson)

      // Fetch total admins
      // await totalAdmins(setTokenInJson)
      // // Fetch total managers
      // await totalManagers(setTokenInJson)
      // // Fetch total users
      // await totalUsers(setTokenInJson)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Stats Cards Data
  const stats = [
    {
      title: 'Total Managers',
      value: dashboardData.managerCount,
      icon: 'tabler-user-check',
      color: 'primary',
      action: () => router.push('/manager-management')
    },
    {
      title: 'Total Users',
      value: dashboardData.userCount,
      icon: 'tabler-users',
      color: 'info',
      action: () => router.push('/all-users')
    },
    {
      title: 'Total Products',
      value: dashboardData.productCount,
      icon: 'tabler-shopping-bag',
      color: 'success',
      action: () => router.push('/all-products')
    },
    {
      title: 'Total Expenses',
      value: dashboardData.expenseCount,
      icon: 'tabler-currency-dollar',
      color: 'warning',
      action: () => router.push('/expense-management')
    }
  ]

  return (
    <div className='p-6'>
      <Typography variant='h4' className='mb-6'>
        Admin Dashboard
      </Typography>

      {loading ? (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={6} className='mb-6'>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  onClick={stat.action}
                  sx={{
                    cursor: stat.action ? 'pointer' : 'default',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: stat.action ? 'translateY(-5px)' : 'none',
                      boxShadow: stat.action ? 6 : 1
                    }
                  }}
                >
                  <CardContent className='flex justify-between items-center'>
                    <div>
                      <Typography variant='h6' color='text.secondary'>
                        {stat.title}
                      </Typography>
                      <Typography variant='h4' className='mt-2'>
                        {stat.value}
                      </Typography>
                    </div>
                    <Avatar variant='rounded' sx={{ backgroundColor: `${stat.color}.light` }}>
                      <Icon icon={stat.icon} fontSize='1.5rem' color={`${stat.color}.main`} />
                    </Avatar>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Recent Managers & Users */}
          <Grid container spacing={6}>
            {/* Recent Managers */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title='Recent Managers'
                  action={
                    <Button size='small' variant='contained' onClick={() => router.push('/manager-management')}>
                      View All
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  {dashboardData.recentManagers.length > 0 ? (
                    <div className='space-y-4'>
                      {dashboardData.recentManagers.map((manager, index) => (
                        <div key={index} className='flex items-center justify-between'>
                          <div className='flex items-center gap-4'>
                            <Avatar src={manager.imageObj?.[0]?.url} alt={manager.uname} />
                            <div>
                              <Typography variant='subtitle1'>{manager.uname}</Typography>
                              <Typography variant='body2' color='text.secondary'>
                                {manager.email}
                              </Typography>
                            </div>
                          </div>
                          <Typography variant='caption' color='text.secondary'>
                            {formatDate(manager.createdAt)}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Typography variant='body2' color='text.secondary' className='text-center py-4'>
                      No recent managers found
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Users */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title='Recent Users'
                  action={
                    <Button size='small' variant='contained' onClick={() => router.push('/all-users')}>
                      View All
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  {dashboardData.recentUsers.length > 0 ? (
                    <div className='space-y-4'>
                      {dashboardData.recentUsers.map((user, index) => (
                        <div key={index} className='flex items-center justify-between'>
                          <div className='flex items-center gap-4'>
                            <Avatar src={user.imageObj?.[0]?.url} alt={user.uname} />
                            <div>
                              <Typography variant='subtitle1'>{user.uname}</Typography>
                              <Typography variant='body2' color='text.secondary'>
                                {user.email}
                              </Typography>
                            </div>
                          </div>
                          <Typography variant='caption' color='text.secondary'>
                            {formatDate(user.createdAt)}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Typography variant='body2' color='text.secondary' className='text-center py-4'>
                      No recent users found
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Expenses */}
          <Card className='mt-6'>
            <CardHeader
              title='Recent Expenses'
              action={
                <Button size='small' variant='contained' onClick={() => router.push('/expense-management')}>
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {dashboardData.recentExpenses.length > 0 ? (
                <div className='space-y-4'>
                  {dashboardData.recentExpenses.map((expense, index) => (
                    <div key={index} className='flex items-center justify-between'>
                      <div className='flex items-center gap-4'>
                        <Avatar variant='rounded' sx={{ backgroundColor: 'warning.light' }}>
                          <Icon icon='tabler-currency-dollar' color='warning.main' />
                        </Avatar>
                        <div>
                          <Typography variant='subtitle1'>{expense.title}</Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {expense.category}
                          </Typography>
                        </div>
                      </div>
                      <div className='text-right'>
                        <Typography variant='subtitle1'>€{expense.amount.toFixed(2)}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {formatDate(expense.date)}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Typography variant='body2' color='text.secondary' className='text-center py-4'>
                  No recent expenses found
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className='mt-6'>
            <CardHeader title='Quick Actions' />
            <Divider />
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    fullWidth
                    variant='contained'
                    startIcon={<Icon icon='tabler-user-plus' />}
                    onClick={() => router.push('/manager-management')}
                  >
                    Add Manager
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    fullWidth
                    variant='contained'
                    color='secondary'
                    startIcon={<Icon icon='tabler-users' />}
                    onClick={() => router.push('/all-users')}
                  >
                    Manage Users
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    fullWidth
                    variant='contained'
                    color='info'
                    startIcon={<Icon icon='tabler-shopping-bag' />}
                    onClick={() => router.push('/all-products')}
                  >
                    View Products
                  </Button>
                </Grid>
                {/* <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant='contained'
                    color='success'
                    startIcon={<Icon icon='tabler-report' />}
                    onClick={() => router.push('/reports')}
                  >
                    Generate Reports
                  </Button>
                </Grid> */}
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default AdminDashboard
