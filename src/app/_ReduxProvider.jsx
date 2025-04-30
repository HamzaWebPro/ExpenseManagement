// _ReduxProvider.jsx
'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import store from './_Store'
import { ToastContainer } from 'react-toastify'

const ReduxProvider = ({ children }) => {
  useEffect(() => {
    store.dispatch({ type: 'APP_READY' })
  }, [])

  return (
    <Provider store={store}>
      <ToastContainer />
      {children}
    </Provider>
  )
}

export default ReduxProvider
