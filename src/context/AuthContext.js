// src/context/AuthContext.js
'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import decryptDataObject from '@/utils/decrypt'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('sessionToken')
      if (token) {
        try {
          const decoded = JSON.parse(decryptDataObject(token))
          setUser(decoded)
        } catch (error) {
          console.error('Error decoding token:', error)
          logout()
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      const { token } = res.data
      Cookies.set('sessionToken', token)
      const decoded = JSON.parse(decryptDataObject(token))
      setUser(decoded)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    Cookies.remove('sessionToken')
    setUser(null)
    router.push('/login')
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
