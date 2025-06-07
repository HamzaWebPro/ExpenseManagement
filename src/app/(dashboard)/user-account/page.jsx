// 'use client'

// // React Imports
// import { useState } from 'react'
// import { useEffect, useRef } from 'react'
// // MUI Imports
// import Grid from '@mui/material/Grid2'
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Button from '@mui/material/Button'
// import Typography from '@mui/material/Typography'
// import MenuItem from '@mui/material/MenuItem'
// import Chip from '@mui/material/Chip'
// import Cookies from 'js-cookie'
// import decryptDataObject from '@/@menu/utils/decrypt'
// // Component Imports
// import CustomTextField from '@core/components/mui/TextField'

// // Vars
// const initialData = {
//   firstName: 'John',
//   lastName: 'Doe',
//   email: 'john.doe@example.com',
//   organization: 'Pixinvent',
//   phoneNumber: '+1 (917) 543-9876',
//   address: '123 Main St, New York, NY 10001',
//   state: 'New York',
//   zipCode: '634880',
//   country: 'usa',
//   language: 'english',
//   timezone: 'gmt-12',
//   currency: 'usd'
// }

// const languageData = ['English', 'Arabic', 'French', 'German', 'Portuguese']

// const AccountDetails = () => {
//   // States
//   const [formData, setFormData] = useState(initialData)
//   const [fileInput, setFileInput] = useState('')
//   const [userData, setUserData] = useState('')
//   const [imgSrc, setImgSrc] = useState('/images/avatars/1.png')
//   const [language, setLanguage] = useState(['English'])

//   const handleDelete = value => {
//     setLanguage(current => current.filter(item => item !== value))
//   }

//   const handleChange = event => {
//     setLanguage(event.target.value)
//   }

//   const handleFormChange = (field, value) => {
//     setFormData({ ...formData, [field]: value })
//   }

//   const handleFileInputChange = file => {
//     const reader = new FileReader()
//     const { files } = file.target

//     if (files && files.length !== 0) {
//       reader.onload = () => setImgSrc(reader.result)
//       reader.readAsDataURL(files[0])

//       if (reader.result !== null) {
//         setFileInput(reader.result)
//       }
//     }
//   }

//   const handleFileInputReset = () => {
//     setFileInput('')
//     setImgSrc('/images/avatars/1.png')
//   }

//   // get login user data
//     useEffect(() => {
//       const sessionToken = Cookies.get('sessionToken')
//       const data = JSON.parse(decryptDataObject(sessionToken))
//       setUserData(data)
//     }, [])

//   return (
//     <Card>
//       <CardContent className='mbe-4'>
//         <div className='flex items-center gap-6 max-sm:flex-col'>
//           <img height={100} width={100} className='rounded' src={userData.photoURL} alt='Profile' />
//           <div className='flex flex-col flex-grow gap-4'>
//             <div className='flex flex-col gap-4 sm:flex-row'>
//               <Button component='label' variant='contained' htmlFor='account-settings-upload-image'>
//                 Upload New Photo
//                 <input
//                   hidden
//                   type='file'
//                   value={fileInput}
//                   accept='image/png, image/jpeg'
//                   onChange={handleFileInputChange}
//                   id='account-settings-upload-image'
//                 />
//               </Button>
//               <Button variant='tonal' color='secondary' onClick={handleFileInputReset}>
//                 Reset
//               </Button>
//             </div>
//             <Typography>Allowed JPG, GIF or PNG. Max size of 800K</Typography>
//           </div>
//         </div>
//       </CardContent>
//       <CardContent>
//         <form onSubmit={e => e.preventDefault()}>
//           <Grid container spacing={6}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <CustomTextField
//                 fullWidth
//                 label='User Name'
//                 value={userData.uname}
//                 placeholder='Enter Your Name'
//                 onChange={e => handleFormChange('firstName', e.target.value)}
//               />
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <CustomTextField
//                 fullWidth
//                 label='Email'
//                 value={userData.email}
//                 placeholder='Enter Your Email'
//                 onChange={e => handleFormChange('email', e.target.value)}
//               />
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <CustomTextField
//                 fullWidth
//                 label='Organization'
//                 value={formData.organization}
//                 placeholder='Pixinvent'
//                 onChange={e => handleFormChange('organization', e.target.value)}
//               />
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <CustomTextField
//                 fullWidth
//                 label='Phone Number'
//                 value={userData.telephone}
//                 placeholder='Enter Your Phone Number'
//                 onChange={e => handleFormChange('phoneNumber', e.target.value)}
//               />
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <CustomTextField
//                 fullWidth
//                 label='Address'
//                 value={userData.address}
//                 placeholder='Enter Your Address'
//                 onChange={e => handleFormChange('address', e.target.value)}
//               />
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <CustomTextField
//                 fullWidth
//                 label='State'
//                 value={formData.state}
//                 placeholder='New York'
//                 onChange={e => handleFormChange('state', e.target.value)}
//               />
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <CustomTextField
//                 fullWidth
//                 type='number'
//                 label='Zip Code'
//                 value={formData.zipCode}
//                 placeholder='123456'
//                 onChange={e => handleFormChange('zipCode', e.target.value)}
//               />
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <CustomTextField
//                 select
//                 fullWidth
//                 label='Country'
//                 value={formData.country}
//                 onChange={e => handleFormChange('country', e.target.value)}
//               >
//                 <MenuItem value='usa'>USA</MenuItem>
//                 <MenuItem value='uk'>UK</MenuItem>
//                 <MenuItem value='australia'>Australia</MenuItem>
//                 <MenuItem value='germany'>Germany</MenuItem>
//               </CustomTextField>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <CustomTextField
//                 select
//                 fullWidth
//                 label='Language'
//                 value={language}
//                 slotProps={{
//                   select: {
//                     multiple: true, // @ts-ignore
//                     onChange: handleChange,
//                     renderValue: selected => (
//                       <div className='flex flex-wrap gap-2'>
//                         {selected.map(value => (
//                           <Chip
//                             key={value}
//                             clickable
//                             onMouseDown={event => event.stopPropagation()}
//                             size='small'
//                             label={value}
//                             onDelete={() => handleDelete(value)}
//                           />
//                         ))}
//                       </div>
//                     )
//                   }
//                 }}
//               >
//                 {languageData.map(name => (
//                   <MenuItem key={name} value={name}>
//                     {name}
//                   </MenuItem>
//                 ))}
//               </CustomTextField>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <CustomTextField
//                 select
//                 fullWidth
//                 label='TimeZone'
//                 value={formData.timezone}
//                 onChange={e => handleFormChange('timezone', e.target.value)}
//                 slotProps={{
//                   select: { MenuProps: { PaperProps: { style: { maxHeight: 250 } } } }
//                 }}
//               >
//                 <MenuItem value='gmt-12'>(GMT-12:00) International Date Line West</MenuItem>
//                 <MenuItem value='gmt-11'>(GMT-11:00) Midway Island, Samoa</MenuItem>
//                 <MenuItem value='gmt-10'>(GMT-10:00) Hawaii</MenuItem>
//                 <MenuItem value='gmt-09'>(GMT-09:00) Alaska</MenuItem>
//                 <MenuItem value='gmt-08'>(GMT-08:00) Pacific Time (US & Canada)</MenuItem>
//                 <MenuItem value='gmt-08-baja'>(GMT-08:00) Tijuana, Baja California</MenuItem>
//                 <MenuItem value='gmt-07'>(GMT-07:00) Chihuahua, La Paz, Mazatlan</MenuItem>
//                 <MenuItem value='gmt-07-mt'>(GMT-07:00) Mountain Time (US & Canada)</MenuItem>
//                 <MenuItem value='gmt-06'>(GMT-06:00) Central America</MenuItem>
//                 <MenuItem value='gmt-06-ct'>(GMT-06:00) Central Time (US & Canada)</MenuItem>
//                 <MenuItem value='gmt-06-mc'>(GMT-06:00) Guadalajara, Mexico City, Monterrey</MenuItem>
//                 <MenuItem value='gmt-06-sk'>(GMT-06:00) Saskatchewan</MenuItem>
//                 <MenuItem value='gmt-05'>(GMT-05:00) Bogota, Lima, Quito, Rio Branco</MenuItem>
//                 <MenuItem value='gmt-05-et'>(GMT-05:00) Eastern Time (US & Canada)</MenuItem>
//                 <MenuItem value='gmt-05-ind'>(GMT-05:00) Indiana (East)</MenuItem>
//                 <MenuItem value='gmt-04'>(GMT-04:00) Atlantic Time (Canada)</MenuItem>
//                 <MenuItem value='gmt-04-clp'>(GMT-04:00) Caracas, La Paz</MenuItem>
//               </CustomTextField>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <CustomTextField
//                 select
//                 fullWidth
//                 label='Currency'
//                 value={formData.currency}
//                 onChange={e => handleFormChange('currency', e.target.value)}
//               >
//                 <MenuItem value='usd'>USD</MenuItem>
//                 <MenuItem value='euro'>EUR</MenuItem>
//                 <MenuItem value='pound'>Pound</MenuItem>
//                 <MenuItem value='bitcoin'>Bitcoin</MenuItem>
//               </CustomTextField>
//             </Grid>
//             <Grid size={{ xs: 12 }} className='flex flex-wrap gap-4'>
//               <Button variant='contained' type='submit'>
//                 Save Changes
//               </Button>
//               <Button variant='tonal' type='reset' color='secondary' onClick={() => setFormData(initialData)}>
//                 Reset
//               </Button>
//             </Grid>
//           </Grid>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }

// export default AccountDetails

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import decryptDataObject from '@/@menu/utils/decrypt'

// MUI Imports
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Divider,
  Button,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material'
import { Icon } from '@mui/material'

const MyProfile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({})
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const backendGetToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_GET_TOKEN
  const backenPostToken = process.env.NEXT_PUBLIC_VITE_API_BACKEND_POST_TOKEN

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const sessionToken = Cookies.get('sessionToken')
        const decryptedData = decryptDataObject(sessionToken)
        const { tokens, userId, role } = JSON.parse(decryptedData)

        const setTokenInJson = JSON.stringify({
          getToken: backendGetToken,
          loginToken: tokens
        })

        const response = await axios.get(`${baseUrl}/backend/authentication/user-logdin`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          }
        })
        console.log('User Data:', response.data)

        if (response.data.success) {
          setUser(response.data.success.data)
          setFormData({
            uname: response.data.success.data.uname,
            email: response.data.success.data.email,
            designation: response.data.success.data.designation || '',
            address: response.data.success.data.address || '',
            telephone: response.data.success.data.telephone || ''
          })
        } else {
          toast.error('Failed to fetch user data')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast.error('Failed to fetch user data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Handle form input changes
  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle password input changes
  const handlePasswordChange = e => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword)
  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

  // Update profile
  // const updateProfile = async () => {
  //   try {
  //     setIsUpdating(true)
  //     const sessionToken = Cookies.get('sessionToken')
  //     const decryptedData = decryptDataObject(sessionToken)
  //     const { tokens, userId } = JSON.parse(decryptedData)

  //     const setTokenInJson = JSON.stringify({
  //       getToken: backendGetToken,
  //       loginToken: tokens
  //     })

  //     const response = await axios.put(`${baseUrl}/backend/authentication/update-user/${userId}`, formData, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
  //       }
  //     })

  //     if (response.data.success) {
  //       toast.success('Profile updated successfully')
  //       setUser(prev => ({ ...prev, ...formData }))
  //       setEditMode(false)
  //     } else {
  //       toast.error(response.data.message || 'Failed to update profile')
  //     }
  //   } catch (error) {
  //     console.error('Error updating profile:', error)
  //     toast.error('Failed to update profile')
  //   } finally {
  //     setIsUpdating(false)
  //   }
  // }

  // Change password
  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    try {
      setIsUpdating(true)
      const sessionToken = Cookies.get('sessionToken')
      const decryptedData = decryptDataObject(sessionToken)
      const { tokens } = JSON.parse(decryptedData)

      const setTokenInJson = JSON.stringify({
        postToken: backenPostToken,
        loginToken: tokens
      })

      const response = await axios.post(
        `${baseUrl}/backend/authentication/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`user:${setTokenInJson}`)}`
          }
        }
      )

      console.log(response)

      if (response.data.success) {
        toast.success('Password changed successfully')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(response.data.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setIsUpdating(false)
    }
  }

  // Role-specific sections
  const renderRoleSpecificInfo = () => {
    if (!user) return null

    switch (user.role) {
      case 'superAdmin':
        return (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Super Admin Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant='body2' color='text.secondary'>
                  You have full system access and can manage all aspects of the platform.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )
      case 'admin':
        return (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Admin Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant='body2'>
                  <strong>Added By:</strong> {user.addedBy?.uname || 'System'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  You can manage managers, products, and expenses.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )
      case 'manager':
        return (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Manager Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant='body2'>
                  <strong>Added By:</strong> {user.addedBy?.uname || 'System'}
                </Typography>
                {user.store && (
                  <Typography variant='body2'>
                    <strong>Store:</strong> {user.store?.uname || 'N/A'}
                  </Typography>
                )}
                <Typography variant='body2'>
                  <strong>All Product Percentage:</strong> {user.allProductPercentage}%
                </Typography>
                {user.individualProductPercentage?.length > 0 && (
                  <>
                    <Typography variant='body2' mt={1}>
                      <strong>Individual Product Percentages:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {user.individualProductPercentage.map((item, index) => (
                        <Chip
                          key={index}
                          label={`${item.product?.name || 'Product'}: ${item.percentage}%`}
                          size='small'
                        />
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        )
      case 'user':
        return (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  User Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant='body2'>
                  <strong>Added By:</strong> {user.addedBy?.uname || 'System'}
                </Typography>
                <Typography variant='body2'>
                  <strong>Account Balance:</strong> ${user.amount.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Typography variant='h6'>User data not available</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='h4' gutterBottom>
        My Profile
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar src={user.photoURL} alt={user.uname} sx={{ width: 120, height: 120, mb: 2 }} />
              <Typography variant='h5'>{user.uname}</Typography>
              <Chip
                label={user.role}
                color={
                  user.role === 'superAdmin'
                    ? 'primary'
                    : user.role === 'admin'
                      ? 'secondary'
                      : user.role === 'manager'
                        ? 'info'
                        : 'success'
                }
                size='small'
                sx={{ mt: 1 }}
              />
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                {user.designation || 'No designation'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {user.email}
              </Typography>

              {/* <Button
                variant='outlined'
                sx={{ mt: 3 }}
                onClick={() => setEditMode(!editMode)}
                startIcon={<Icon icon={editMode ? 'tabler-eye' : 'tabler-edit'} />}
              >
                {editMode ? 'View Profile' : 'Edit Profile'}
              </Button> */}
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* {editMode ? (
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Edit Profile
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Username'
                      name='uname'
                      value={formData.uname}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Email'
                      name='email'
                      type='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Designation'
                      name='designation'
                      value={formData.designation}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Telephone'
                      name='telephone'
                      value={formData.telephone}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Address'
                      name='address'
                      multiline
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button variant='outlined' onClick={() => setEditMode(false)} sx={{ mr: 2 }}>
                    Cancel
                  </Button>
                  <Button
                    variant='contained'
                    onClick={updateProfile}
                    disabled={isUpdating}
                    startIcon={isUpdating ? <CircularProgress size={20} /> : null}
                  >
                    Save Changes
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : ( */}
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2'>Username</Typography>
                  <Typography variant='body1'>{user.uname}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2'>Email</Typography>
                  <Typography variant='body1'>{user.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2'>Designation</Typography>
                  <Typography variant='body1'>{user.designation || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2'>Telephone</Typography>
                  <Typography variant='body1'>{user.telephone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='subtitle2'>Address</Typography>
                  <Typography variant='body1'>{user.address || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          {/* )} */}

          {/* Password Change Card */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Change Password
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {user.role === 'superAdmin' ? (
                <>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label='Current Password'
                        name='currentPassword'
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton onClick={togglePasswordVisibility}>
                                <Icon icon={showPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label='New Password'
                        name='newPassword'
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton onClick={toggleNewPasswordVisibility}>
                                <Icon icon={showNewPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label='Confirm Password'
                        name='confirmPassword'
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton onClick={toggleConfirmPasswordVisibility}>
                                <Icon icon={showConfirmPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant='contained'
                      onClick={changePassword}
                      disabled={
                        isUpdating ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword
                      }
                      startIcon={isUpdating ? <CircularProgress size={20} /> : null}
                    >
                      Change Password
                    </Button>
                  </Box>
                </>
              ) : (
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  {`If you want to change your password or anything, please contact ${user.role === 'admin' ? 'the super admin' : role === 'manager' ? 'your store' : 'your manager'}.`}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Role-specific information */}
          {renderRoleSpecificInfo()}
        </Grid>
      </Grid>
    </Box>
  )
}

export default MyProfile
