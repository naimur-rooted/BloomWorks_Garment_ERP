import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Lock, User, AlertCircle, ArrowRight, Sparkles, KeyRound, RefreshCw } from 'lucide-react'
import ThemeToggle from '../components/ui/ThemeToggle'
import api from '../services/api'

export default function Login() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusStep, setStatusStep] = useState('')
  const [backendStatus, setBackendStatus] = useState('checking')
  const { user, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // If user is already authenticated, navigate to dashboard immediately
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (user || (token && savedUser)) {
      navigate('/', { replace: true })
      return
    }

    // Probe backend connection
    api
      .get('/health')
      .then((res) => {
        if (res.data?.status === 'ok') {
          setBackendStatus('connected')
        } else {
          setBackendStatus('degraded')
        }
      })
      .catch(() => setBackendStatus('offline'))
  }, [user, navigate])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    setStatusStep('Authenticating credentials...')
    try {
      await login(username, password)
      setStatusStep('Redirecting to Dashboard...')
      navigate('/', { replace: true })
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          window.location.href = '/'
        }
      }, 500)
    } catch (err) {
      console.error('Login error:', err)
      const detail = err.response?.data?.detail
      if (detail) {
        setError(`Authentication failed: ${detail}`)
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Server took too long to respond. The cloud service may be cold-starting. Please click to retry.')
      } else if (err.message?.includes('Network Error')) {
        setError('Network error connecting to backend API. Please check your connection and retry.')
      } else {
        setError(err.message || 'Authentication failed. Please verify credentials.')
      }
    } finally {
      setLoading(false)
      setStatusStep('')
    }
  }

  const handleDemoLogin = async () => {
    if (loading) return
    setUsername('admin')
    setPassword('admin123')
    setLoading(true)
    setError('')
    setStatusStep('Authenticating as System Administrator...')
    try {
      await login('admin', 'admin123')
      setStatusStep('Redirecting to Dashboard...')
      navigate('/', { replace: true })
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          window.location.href = '/'
        }
      }, 500)
    } catch (err) {
      console.error('Demo login error:', err)
      const detail = err.response?.data?.detail
      if (detail) {
        setError(`Demo sign-in failed: ${detail}`)
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Server cold start took too long. Please click again to retry.')
      } else {
        setError(err.message || 'Demo authentication failed. Please retry in a few moments.')
      }
    } finally {
      setLoading(false)
      setStatusStep('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative transition-colors duration-150">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="card p-8 shadow-md transition-colors">
          {/* Brand & Terminal Header */}
          <div className="text-center mb-8">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg tracking-wider mx-auto mb-3 shadow-sm">
              BW
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              BloomWorks Garment ERP
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Industrial Manufacturing & Telemetry Control
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Username or Operator ID
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="input pl-9"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {statusStep && (
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-xs flex items-center gap-2 font-medium">
                <RefreshCw size={13} className="shrink-0 animate-spin" />
                <span>{statusStep}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <span>{loading ? (statusStep || 'Authenticating...') : 'Sign In'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Demo Access Section */}
          <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <KeyRound size={13} className="text-blue-500" />
                Demo Inspection Access
              </span>
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                Auto-Provisioned
              </span>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 hover:from-blue-500/20 hover:via-indigo-500/20 hover:to-emerald-500/20 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-[0.99] group cursor-pointer"
            >
              <Sparkles size={14} className="text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform" />
              <span>{loading ? (statusStep || 'Authenticating as Demo Admin...') : 'Instant Demo Login (System Admin)'}</span>
            </button>

            <div className="mt-2 text-center">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Credentials: <code className="text-slate-700 dark:text-slate-300 font-mono font-semibold">admin</code> / <code className="text-slate-700 dark:text-slate-300 font-mono font-semibold">admin123</code>
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Terminal: DHAKA-01</span>
            <span className="font-semibold flex items-center gap-1.5">
              {backendStatus === 'connected' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">API Online</span>
                </>
              )}
              {backendStatus === 'checking' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-500">Connecting...</span>
                </>
              )}
              {backendStatus === 'offline' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="text-rose-500">API Offline</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
