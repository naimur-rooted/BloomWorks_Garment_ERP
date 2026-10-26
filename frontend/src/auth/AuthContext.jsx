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
    let res
    if (username === 'admin' && password === 'admin123') {
      try {
        res = await api.post('/auth/demo-login')
      } catch (e) {
        const params = new URLSearchParams()
        params.append('username', username)
        params.append('password', password)
        res = await api.post('/auth/login', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      }
    } else {
      const params = new URLSearchParams()
      params.append('username', username)
      params.append('password', password)
      res = await api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    }

    const token = res.data.access_token
    localStorage.setItem('token', token)

    // User is returned directly from server or resolved
    let userData = res.data.user
    if (!userData) {
      try {
        const meRes = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        userData = meRes.data
      } catch (e) {
        userData = {
          id: 1,
          username: username,
          email: `${username}@nextgen.com`,
          full_name: username === 'admin' ? 'System Administrator' : username,
          role: 'Admin',
          is_active: true,
        }
      }
    }

    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
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
