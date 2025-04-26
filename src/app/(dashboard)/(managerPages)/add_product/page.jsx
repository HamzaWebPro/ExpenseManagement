'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormLabel from '@mui/material/FormLabel'
import FormHelperText from '@mui/material/FormHelperText'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

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
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      dob: null,
      select: '',
      textarea: '',
      radio: false,
      checkbox: false
    }
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const onSubmit = () => toast.success('Form Submitted')

  return (
    <Card>
      <CardHeader title='Add a New Product' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='firstName'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Product Name'
                    placeholder='Write product name here (e.g., IPhone 12)'
                    {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
                  />
                )}
              />
            </Grid>
        
           
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='productPrice'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Product Price (€)'
                    placeholder={`€1000, €2000, €3000`}
                    {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='Upload Photo'
                control={control}
                rules={{ required: true }}
                render={({ field }) => <CustomTextField {...field} fullWidth type='file' label='Product Photo' />}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name='textarea'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    rows={4}
                    fullWidth
                    multiline
                    label='Product Description'
                    {...(errors.textarea && { error: true, helperText: 'This field is required.' })}
                  />
                )}
              />
            </Grid>
           
           
            <Grid size={{ xs: 12 }} className='flex gap-4'>
              <Button variant='contained' type='submit'>
                Add Product
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
