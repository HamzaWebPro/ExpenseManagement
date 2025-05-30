// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

import ReduxProvider from './_ReduxProvider'

export const metadata = {
  title: 'Expmanager Dashboard',
  description:
    'EXPMANAGER POWERED BY BYTELIBERTY'
}

const RootLayout = async props => {
  const { children } = props

  // Vars
  const systemMode = await getSystemMode()
  const direction = 'ltr'

  return (
    <html id='__next' lang='en' dir={direction} suppressHydrationWarning>
      
      <body className='flex flex-col flex-auto is-full min-bs-full'>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
        <ReduxProvider>
        {children}
        </ReduxProvider>
      </body>
    </html>
  )
}

export default RootLayout
