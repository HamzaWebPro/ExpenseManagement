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
import Chip from '@mui/material/Chip'

// Icon Imports
import { Icon } from '@mui/material'

// Third-party Imports
import axios from 'axios'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'

// Utility Imports
import decryptDataObject from '@/@menu/utils/decrypt'
import formatDate from '@/@menu/utils/formatDate'

const UserDashboard = () => {
  // State
  const [dashboardData, setDashboardData] = useState({
    productCount: 0,
    recentProducts: []
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Constants
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  // Fetch recent products data
  const recentProducts = async setTokenInJson => {
    try {
      const response = await axios.get(`${baseUrl}/backend/product/all`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        }
      })
      if (response.data.data) {
        setDashboardData(prevData => ({
          ...prevData,
          recentProducts: response.data.data,
          productCount: response.data.data.length
        }))
      } else {
        console.error('Error fetching recent products:', response.data.message)
        toast.error('Failed to load recent products')
      }
    } catch (error) {
      console.error('Error fetching recent products:', error)
      toast.error('Failed to load recent products')
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

      // Fetch recent products
      await recentProducts(setTokenInJson)
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
      title: 'Total Products',
      value: dashboardData.productCount,
      icon: 'tabler-shopping-bag',
      color: 'info',
      action: () => router.push('/all-products')
    }
  ]

  return (
    <div className='p-6'>
      <Typography variant='h4' className='mb-6'>
        User Dashboard
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
              <Grid item xs={12} sm={6} md={4} key={index}>
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

          {/* Recent Products */}
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title='Recent Products'
                  action={
                    <Button size='small' variant='contained' onClick={() => router.push('/all-products')}>
                      View All
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  {dashboardData.recentProducts.length > 0 ? (
                    <Grid container spacing={4}>
                      {dashboardData.recentProducts.map((product, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card
                            onClick={() => router.push(`/all-products/${product._id}`)}
                            sx={{
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: 6
                              }
                            }}
                          >
                            <CardContent className='flex flex-col items-center text-center'>
                              <Avatar
                                src={product.photoUrl[0]}
                                alt={product.name}
                                variant='rounded'
                                sx={{ width: 100, height: 100, mb: 2 }}
                              />
                              <Typography variant='subtitle1'>{product.name}</Typography>
                              <Typography variant='body1' color='primary' className='mt-1'>
                                ${product.price.toFixed(2)}
                              </Typography>
                              <Chip
                                label={product.status}
                                color={product.status === 'active' ? 'success' : 'error'}
                                size='small'
                                className='mt-2'
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant='body2' color='text.secondary' className='text-center py-4'>
                      No recent products found
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
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant='contained'
                    startIcon={<Icon icon='tabler-shopping-bag' />}
                    onClick={() => router.push('/all-products')}
                  >
                    Browse Products
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant='contained'
                    color='secondary'
                    startIcon={<Icon icon='tabler-user' />}
                    onClick={() => router.push('/account-settings')}
                  >
                    My Account
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default UserDashboard
