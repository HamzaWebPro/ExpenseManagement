'use client'

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import CryptoJS from 'crypto-js'

import Cookies from 'js-cookie'

import { dbGetAll, dbAdd, dbDelete } from '@/utils/db'


const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_VITE_ENCRYPTION_KEY

function decryptDataObject(encryptedString) {
  if (!encryptedString) return null

  try {
    const [ivBase64, encryptedBase64] = encryptedString.split(':')
    const key = CryptoJS.SHA256(ENCRYPTION_KEY)
    const iv = CryptoJS.enc.Base64.parse(ivBase64)

    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Decryption failed:', error)
    return null
  }
}

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
