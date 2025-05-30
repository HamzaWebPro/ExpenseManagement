'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Styled Component Imports
import AuthIllustrationWrapper from './AuthIllustrationWrapper'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { addItem } from '@/app/_Slices/userSlice'
import decryptDataObject from '@/@menu/utils/decrypt'
import { toast } from 'react-toastify'

import { DNA } from 'react-loader-spinner'

const Login = () => {
  const loginToken = process.env.NEXT_PUBLIC_VITE_LOGIN_TOKEN
  const baseUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL
  const dispatch = useDispatch()
  const router = useRouter()

  const [btnLoading, setBtnLoading] = useState(false)

  // States
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // Hooks
  const { lang: locale } = useParams()
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const changeHandler = e => {
    setValues({ ...values, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    let tempErrors = { email: '', password: '' }
    let isValid = true

    if (!values.email) {
      tempErrors.email = 'Email is required'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      tempErrors.email = 'Email is invalid'
      isValid = false
    }

    if (!values.password) {
      tempErrors.password = 'Password is required'
      isValid = false
    } else if (values.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters'
      isValid = false
    }

    setErrors(tempErrors)
    return isValid
  }

  const encodeCredentials = (username, password) => {
    const str = `${username}:${password}`
    return btoa(unescape(encodeURIComponent(str)))
  }

  const loginHandler = async e => {
    setBtnLoading(true)
    e.preventDefault()

    if (!validate()) {
      setBtnLoading(false)
      return
    } else {
      try {
        const response = await axios.post(
          `${baseUrl}/backend/authentication/login`,
          {
            email: values.email,
            password: values.password
          },
          // {
          //   email: 'superAdmin@gmail.com',
          //   password: '12345678'
          // },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${encodeCredentials('user', loginToken)}`
            },
            maxBodyLength: Infinity
          }
        )
        const userRole = JSON.parse(decryptDataObject(response?.data?.success?.info))?.role || ''

        if (userRole) {
          console.log('Login API response:', response.data)
          await dispatch(addItem(response.data.success.info))

          if (userRole === 'admin') {
            router.push('/admin-dashboard')
          } else if (userRole === 'superAdmin') {
            router.push('/superadmin-dashboard')
          } else if (userRole === 'manager') {
            router.push('/manager-dashboard')
          } else if (userRole === 'user') {
            router.push('/user-dashboard')
          } else {
            router.push('/home')
          }
          toast.success(response?.data?.success?.message)
          return
        } else {
          toast.error(response?.data?.error?.message)
        }
      } catch (error) {
        console.error('Login error:', error.response ? error.response.data : error.message)
      } finally {
        setBtnLoading(false)
      }
    }
  }
  // sss
  return (
    <AuthIllustrationWrapper>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='sm:!p-12'>
          <Link href='/login' className='flex justify-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-1 mbe-6'>
            <Typography className='text-center'>Please sign-in to your account and start the adventure</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={loginHandler} className='flex flex-col gap-6'>
            <CustomTextField
              name='email'
              value={values.email}
              onChange={changeHandler}
              error={Boolean(errors.email)}
              helperText={errors.email}
              autoFocus
              fullWidth
              label='Email or Username'
              placeholder='Enter your email or username'
            />
            <CustomTextField
              name='password'
              value={values.password}
              onChange={changeHandler}
              error={Boolean(errors.password)}
              helperText={errors.password}
              fullWidth
              label='Password'
              placeholder='············'
              id='outlined-adornment-password'
              type={isPasswordShown ? 'text' : 'password'}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                        <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            {errorMessage && (
              <Typography color='error' variant='body2' align='center'>
                {errorMessage}
              </Typography>
            )}
            <div className='flex flex-wrap items-center justify-center gap-x-3 gap-y-1'>
              <Typography className='text-end' color='primary.main'>
                Forgot password?
              </Typography>{' '}
              <Typography>Please Contact with Admin.</Typography>
            </div>
            <Button fullWidth disabled={btnLoading} variant='contained' type='submit'>
              {btnLoading ? (
                <DNA
                  visible={true}
                  // className='h-full w-auto'
                  height={22}
                  ariaLabel='dna-loading'
                  wrapperStyle={{}}
                  wrapperClass='dna-wrapper'
                />
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default Login
