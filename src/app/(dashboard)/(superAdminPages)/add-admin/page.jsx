'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormLabel from '@mui/material/FormLabel'
import FormHelperText from '@mui/material/FormHelperText'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import { FormControlLabel } from '@mui/material'

// Third-party Imports
import { toast } from 'react-toastify'
import { useForm, Controller } from 'react-hook-form'

// Components Imports
import CustomTextField from '@core/components/mui/TextField'

const FormValidationBasic = () => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // Hooks
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      uname: '',
      email: '',
      password: '',
      imageName: '',
      photoURL: '',
      designation: '',
      amount: false,
      percentage: false,
      productID: [],
      address: '',
      telephone: '',
      status: '',
      franchiseAmount: ''
    }
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit = data => {
    const finalData = {
      ...data,
      role: 'admin' // Always admin
    }

    console.log(finalData)
    toast.success('Admin Created Successfully!')

    // You can send `finalData` to your backend here
  }

  return (
    <Card>
      <CardHeader title='Add Admin' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            {/* User Name */}
            <Grid xs={12} sm={6}>
              <Controller
                name='uname'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Admin Name'
                    placeholder='Enter your admin name'
                    error={!!errors.uname}
                    helperText={errors.uname && 'This field is required.'}
                    onChange={e => field.onChange(e.target.value)}
                  />
                )}
              />
            </Grid>

            {/* Email */}
            <Grid xs={12} sm={6}>
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='email'
                    label='Email'
                    placeholder='Enter your admin email'
                    error={!!errors.email}
                    helperText={errors.email && 'This field is required.'}
                    onChange={e => field.onChange(e.target.value)}
                  />
                )}
              />
            </Grid>

            {/* Password */}
            <Grid xs={12} sm={6}>
              <Controller
                name='password'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type={isPasswordShown ? 'text' : 'password'}
                    label='Password'
                    placeholder='Enter your admin password'
                    error={!!errors.password}
                    helperText={errors.password && 'This field is required.'}
                    onChange={e => field.onChange(e.target.value)}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onClick={handleClickShowPassword}
                              onMouseDown={e => e.preventDefault()}
                              aria-label='toggle password visibility'
                            >
                              <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {/* Franchise Amount */}
            <Grid xs={12} sm={6}>
              <Controller
                name='franchiseAmount'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Franchise Amount'
                    placeholder='Enter amount'
                    type='number'
                    error={!!errors.franchiseAmount}
                    helperText={errors.franchiseAmount && 'This field is required.'}
                    onChange={e => field.onChange(e.target.value)}
                  />
                )}
              />
            </Grid>

            {/* Status */}
            <Grid xs={12} sm={6}>
              <Controller
                name='status'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Status'
                    placeholder='Enter status'
                    error={!!errors.status}
                    helperText={errors.status && 'This field is required.'}
                    onChange={e => field.onChange(e.target.value)}
                  />
                )}
              />
            </Grid>

            {/* Telephone */}
            <Grid xs={12} sm={6}>
              <Controller
                name='telephone'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Telephone'
                    placeholder='Phone number'
                    onChange={e => field.onChange(e.target.value)}
                  />
                )}
              />
            </Grid>

            {/* Address */}
            <Grid xs={12}>
              <Controller
                name='address'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Address'
                    placeholder='Enter address'
                    onChange={e => field.onChange(e.target.value)}
                  />
                )}
              />
            </Grid>

            {/* Designation */}
            <Grid xs={12}>
              <Controller
                name='designation'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Designation'
                    placeholder='Designation'
                    onChange={e => field.onChange(e.target.value)}
                  />
                )}
              />
            </Grid>

            {/* Photo URL */}
            <Grid xs={12}>
              <Controller
                name='photoURL'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Photo URL'
                    placeholder='Paste image URL'
                    onChange={e => field.onChange(e.target.value)}
                  />
                )}
              />
            </Grid>

            {/* Amount Checkbox */}
            <Grid xs={12}>
              <FormControl error={!!errors.amount}>
                <FormLabel>Amount</FormLabel>
                <Controller
                  name='amount'
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label='Amount Enabled' />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Percentage Checkbox */}
            <Grid xs={12}>
              <FormControl error={!!errors.percentage}>
                <FormLabel>Percentage</FormLabel>
                <Controller
                  name='percentage'
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label='Percentage Enabled'
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Buttons */}
            <Grid xs={12} className='flex gap-4'>
              <Button variant='contained' type='submit'>
                Submit
              </Button>
              <Button variant='tonal' color='secondary' type='reset' onClick={() => reset()}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default FormValidationBasic
