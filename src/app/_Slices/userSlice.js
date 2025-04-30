'use client'

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import CryptoJS from 'crypto-js'
import { dbGetAll, dbAdd, dbDelete } from '@/utils/db'
import Cookies from 'js-cookie'
import decryptDataObject from '@/@menu/utils/decrypt'

export const fetchItems = createAsyncThunk('user/fetchItems', async () => {
  return await dbGetAll()
})

// Slice
export const userSlice = createSlice({
  name: 'user',
  initialState: {
    items: [],
    status: 'idle'
  },
  reducers: {
    addItem: (state, action) => {
      const decryptedMessage = decryptDataObject(action.payload)

      if (decryptedMessage) {
        const userLoginInfo = JSON.parse(decryptedMessage)
        console.log(userLoginInfo)
        const uid = Date.now()

        state.items.push({ id: uid, ...userLoginInfo })

        dbAdd({
          id: uid,
          token: action.payload
        })

        Cookies.set('sessionToken', action.payload, {
          expires: 7,
          path: '/',
          secure: true,
          sameSite: 'Strict'
        })
      }
    },
    deleteItem: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload)

      // Remove from IndexedDB
      dbDelete(action.payload)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchItems.pending, state => {
      state.status = 'loading'
    })
    builder.addCase(fetchItems.fulfilled, (state, action) => {
      const data = action.payload

      if (data.length > 0) {
        const decryptedMessage = decryptDataObject(data[0].token)

        if (decryptedMessage) {
          const userLoginInfo = JSON.parse(decryptedMessage)

          state.items = [{ id: data[0].id, ...userLoginInfo }]
          state.status = 'succeeded'
        } else {
          state.items = []
          state.status = 'failed'
        }
      } else {
        state.items = []
        state.status = 'idle'
      }
    })
    builder.addCase(fetchItems.rejected, state => {
      state.status = 'failed'
    })
  }
})

export const { addItem, deleteItem } = userSlice.actions
export default userSlice.reducer
