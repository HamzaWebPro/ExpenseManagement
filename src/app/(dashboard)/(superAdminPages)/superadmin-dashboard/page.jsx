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
// import Icon from '@/@core/components/icon'

// Third-party Imports
import axios from 'axios'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'

// Utility Imports
import decryptDataObject from '@/@menu/utils/decrypt'
import formatDate from '@/@menu/utils/formatDate'
import { Icon } from '@iconify/react'

const SuperAdminDashboard = () => {
  // State
  const [dashboardData, setDashboardData] = useState({
    adminCount: 0,
    managerCount: 0,
    userCount: 0,
    recentAdmins: [],
    recentManagers: [],
    systemStatus: {}
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Constants
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  // Fatch recent admin data
  const recentAdmins = async setTokenInJson => {
    try {
      const response = await axios.get(`${baseUrl}/backend/authentication/all-admin`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        }
      })
      console.log('recentAdmins', response)

      if (response.data.success) {
        setDashboardData(prevData => ({ ...prevData, recentAdmins: response.data.success.data }))
      }
    } catch (error) {
      console.error('Error fetching recent admins:', error)
      toast.error('Failed to load recent admins')
    }
  }

  // Fatch recent manager data
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
        setDashboardData(prevData => ({ ...prevData, recentManagers: response.data.success.data }))
      }
    } catch (error) {
      console.error('Error fetching recent managers:', error)
      toast.error('Failed to load recent managers')
    }
  }

  // Fatch admin data
  const totalAdmins = async setTokenInJson => {
    try {
      const response = await axios.get(`${baseUrl}/backend/authentication/total-admins`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        }
      })
      if (response.data.success) {
        setDashboardData(prevData => ({ ...prevData, adminCount: response.data.success.data }))
      }
    } catch (error) {
      console.error('Error fetching total admins:', error)
      toast.error('Failed to load total admins')
    }
  }

  // Fatch manager data
  const totalManagers = async setTokenInJson => {
    try {
      const response = await axios.get(`${baseUrl}/backend/authentication/total-managers`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        }
      })
      if (response.data.success) {
        setDashboardData(prevData => ({ ...prevData, managerCount: response.data.success.data }))
      }
    } catch (error) {
      console.error('Error fetching total managers:', error)
      toast.error('Failed to load total managers')
    }
  }
  // Fatch user data
  const totalUsers = async setTokenInJson => {
    try {
      const response = await axios.get(`${baseUrl}/backend/authentication/total-users`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        }
      })
      console.log('response', response)

      if (response.data.success) {
        setDashboardData(prevData => ({ ...prevData, userCount: response.data.success.data }))
      }
    } catch (error) {
      console.error('Error fetching total users:', error)
      toast.error('Failed to load total users')
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

      // Fetch recent admins
      await recentAdmins(setTokenInJson)
      // Fetch recent managers
      await recentManagers(setTokenInJson)

      // Fetch total admins
      await totalAdmins(setTokenInJson)
      // Fetch total managers
      await totalManagers(setTokenInJson)
      // Fetch total users
      await totalUsers(setTokenInJson)
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
      title: 'Total Stores',
      value: dashboardData.adminCount,
      icon: 'tabler-building-store',
      color: 'primary',
      action: () => router.push('/store-management')
    },
    {
      title: 'Total Managers',
      value: dashboardData.managerCount,
      icon: 'tabler-user-shield',
      color: 'info',
      action: () => router.push('/manager-management')
    },
    {
      title: 'Total Users',
      value: dashboardData.userCount,
      icon: 'tabler-users-group',
      color: 'success',
      action: () => router.push('/user-management')
    },
    {
      title: 'System Status',
      value: dashboardData.systemStatus.status || 'Active',
      icon: 'tabler-server',
      color: dashboardData.systemStatus.status === 'Active' ? 'success' : 'error',
      action: null
    }
  ]

  return (
    <div className='p-6'>
      <Typography variant='h4' className='mb-6'>
        Super Admin Dashboard
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

          {/* Recent Admins & Managers */}
          <Grid container spacing={6}>
            {/* Recent Admins */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title='Recent Stores'
                  action={
                    <Button size='small' variant='contained' onClick={() => router.push('/store-management')}>
                      View All
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  {dashboardData.recentAdmins.length > 0 ? (
                    <div className='space-y-4'>
                      {dashboardData.recentAdmins.map((admin, index) => (
                        <div key={index} className='flex items-center justify-between'>
                          <div className='flex items-center gap-4'>
                            <Avatar src={admin.imageObj?.[0]?.url} alt={admin.uname} />
                            <div>
                              <Typography variant='subtitle1'>{admin.uname}</Typography>
                              <Typography variant='body2' color='text.secondary'>
                                {admin.email}
                              </Typography>
                            </div>
                          </div>
                          <Typography variant='caption' color='text.secondary'>
                            {formatDate(admin.createdAt)}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Typography variant='body2' color='text.secondary' className='text-center py-4'>
                      No recent admins found
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

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
          </Grid>

          {/* Quick Actions */}
          <Card className='mt-6'>
            <CardHeader title='Quick Actions' />
            <Divider />
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={12}>
                  <Button
                    fullWidth
                    variant='contained'
                    startIcon={<Icon icon='tabler-building-store' />}
                    onClick={() => router.push('/store-management')}
                  >
                    Add Store
                  </Button>
                </Grid>
                {/* <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant='contained'
                    color='success'
                    startIcon={<Icon icon='tabler-report-analytics' />}
                    onClick={() => router.push('/reports')}
                  >
                    View Reports
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant='contained'
                    color='secondary'
                    startIcon={<Icon icon='tabler-users' />}
                    onClick={() => router.push('/all_managers')}
                  >
                    Manage Managers
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    fullWidth
                    variant='contained'
                    color='info'
                    startIcon={<Icon icon='tabler-settings' />}
                    onClick={() => router.push('/system-settings')}
                  >
                    System Settings
                  </Button>
                </Grid> */}
                {/* <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant='contained'
                    color='success'
                    startIcon={<Icon icon='tabler-report-analytics' />}
                    onClick={() => router.push('/reports')}
                  >
                    View Reports
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

export default SuperAdminDashboard
