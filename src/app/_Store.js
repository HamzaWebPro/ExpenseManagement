import { configureStore } from '@reduxjs/toolkit'
import userReducer from './_Slices/userSlice'

export default configureStore({
  reducer: {
    userInfo: userReducer
  }
})
