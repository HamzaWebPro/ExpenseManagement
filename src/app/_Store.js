import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../app/_Slices/counterSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})