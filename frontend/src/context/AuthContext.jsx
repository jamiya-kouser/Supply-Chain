// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      authApi.me()
        .then((res) => setUser(res.data))
        .catch(()  => localStorage.removeItem('auth_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password })
    localStorage.setItem('auth_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {})
    localStorage.removeItem('auth_token')
    setUser(null)
  }, [])

  // Demo login — bypass backend for UI preview
  const demoLogin = useCallback((role = 'dispatcher') => {
    const demoUser = {
      id:    'demo-001',
      name:  role === 'dispatcher' ? 'Rajesh Sharma' : 'Suresh Kumar',
      email: `${role}@logistix.in`,
      role,
      avatar: null,
    }
    localStorage.setItem('auth_token', 'demo_token')
    setUser(demoUser)
    return demoUser
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, demoLogin, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
