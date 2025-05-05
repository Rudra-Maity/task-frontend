// context/auth-context.jsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
// import { useToast } from '@/components/ui/use-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
//   const { toast } = useToast()
  
  // Set up axios defaults
  useEffect(() => {
    axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    axios.defaults.withCredentials = true
  }, [])
  
  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const res = await axios.get('/auth/me')
          setUser(res.data.user)
        }
      } catch (err) {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])
  
  const login = async (email, password) => {
    try {
      setLoading(true)
      const res = await axios.post('/auth/login', { email, password })
      setUser(res.data.user)
      localStorage.setItem('token', res.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      router.push('/dashboard')
      toast({
        title: 'Login successful',
        description: `Welcome back, ${res.data.user.name}!`,
      })
      return res.data
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: err.response?.data?.message || 'Invalid credentials',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  const register = async (userData) => {
    try {
      setLoading(true)
      const res = await axios.post('/auth/register', userData)
      setUser(res.data.user)
      localStorage.setItem('token', res.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      router.push('/dashboard')
      toast({
        title: 'Registration successful',
        description: `Welcome, ${res.data.user.name}!`,
      })
      return res.data
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: err.response?.data?.message || 'Could not create account',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  const logout = async () => {
    try {
      await axios.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      router.push('/login')
      // toast({
      //   title: 'Logged out',
      //   description: 'You have been successfully logged out',
      // })
    }
  }
  
  const updateProfile = async (userData) => {
    try {
      setLoading(true)
      const res = await axios.put('/auth/profile', userData)
      setUser(res.data.user)
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      })
      return res.data
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: err.response?.data?.message || 'Could not update profile',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  const changePassword = async (passwords) => {
    try {
      setLoading(true)
      await axios.put('/auth/change-password', passwords)
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully',
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed')
      toast({
        variant: 'destructive',
        title: 'Password Change Failed',
        description: err.response?.data?.message || 'Could not update password',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isManager: user?.role === 'manager',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
  
}