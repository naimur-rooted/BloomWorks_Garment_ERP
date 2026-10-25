import axios from 'axios'
import API_URL from '../config/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to /login if 401 occurs on a protected route, avoiding loops during authentication
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }
    return Promise.reject(error)
  },
)

export default api
