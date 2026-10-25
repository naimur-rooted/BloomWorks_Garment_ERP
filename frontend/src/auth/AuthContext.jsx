import { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null
    } catch {
      return null
    }
  })

  const login = useCallback(async (username, password) => {
    const params = new URLSearchParams()
    params.append('username', username)
    params.append('password', password)
    const res = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    const token = res.data.access_token
    localStorage.setItem('token', token)
    
    // Explicitly pass Authorization header to avoid any local storage timing delay
    const meRes = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    localStorage.setItem('user', JSON.stringify(meRes.data))
    setUser(meRes.data)
    return meRes.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
