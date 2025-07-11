'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import { DNA } from 'react-loader-spinner'
import IconButton from '@mui/material/IconButton'

// Icon Imports
import { IconBell as NotificationIcon } from '@tabler/icons-react'
import { IconCircleCheck as ActiveIcon } from '@tabler/icons-react'
import { IconCircleX as InactiveIcon } from '@tabler/icons-react'

// API Imports
import axios from 'axios'
import formatDate from '@/@menu/utils/formatDate'
import TokenManager from '@/@menu/utils/token'

const NotificationsPage = () => {
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN

  // States
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const loginToken = await TokenManager.getLoginToken()
      const setTokenInJson = JSON.stringify({
        getToken: backendGetToken,
        loginToken: loginToken || ''
      })

      const response = await axios.get(`${baseUrl}/backend/authentication/all-notifications`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
        },
        maxBodyLength: Infinity
      })

      setNotifications(response?.data?.data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <Card className='max-w-3xl mx-auto'>
      <CardHeader
        title={
          <Typography variant='h5' className='font-medium'>
            Notifications
          </Typography>
        }
        avatar={
          <IconButton>
            <NotificationIcon className='text-primary' />
          </IconButton>
        }
        className='border-b'
      />

      <CardContent className='p-0'>
        {loading ? (
          <div className='flex items-center justify-center h-64'>
            <DNA
              visible={true}
              height={80}
              width={80}
              ariaLabel='dna-loading'
              wrapperStyle={{}}
              wrapperClass='dna-wrapper'
            />
          </div>
        ) : notifications.length === 0 ? (
          <div className='flex flex-col items-center justify-center p-8 text-center'>
            <NotificationIcon className='text-textSecondary' size={48} />
            <Typography variant='body1' className='mt-4 text-textSecondary'>
              No notifications available
            </Typography>
          </div>
        ) : (
          <List className='divide-y'>
            {notifications.map((notification, index) => (
              <ListItem key={notification._id} className='hover:bg-actionHover'>
                <ListItemAvatar>
                  <Avatar className='bg-primary/10'>
                    {notification.status ? (
                      <ActiveIcon className='text-success' />
                    ) : (
                      <InactiveIcon className='text-error' />
                    )}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant='subtitle1' className='font-medium'>
                      {notification.message}
                    </Typography>
                  }
                  secondary={
                    <Typography variant='body2' className='text-textSecondary'>
                      {formatDate(notification.createdAt)}
                    </Typography>
                  }
                />
                <Chip
                  label={notification.status ? 'Active' : 'Inactive'}
                  color={notification.status ? 'success' : 'error'}
                  size='small'
                  variant='outlined'
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}

export default NotificationsPage
