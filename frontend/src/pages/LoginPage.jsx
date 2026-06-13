// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Eye, EyeOff, Loader2, Radio } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const { login, demoLogin } = useAuth()
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid credentials. Use demo login to preview.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = async (role) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    demoLogin(role)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(124,109,244,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,109,244,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-cyan/5 rounded-full blur-[80px]" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
              <Truck size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">
              Logisti<span className="text-brand-400">X</span>
            </span>
          </div>
          <p className="text-sm text-gray-500">Command Center · Voice AI Platform</p>
        </div>

        {/* Card */}
        <div className="card-glow p-6">
          <h1 className="font-display font-bold text-lg text-gray-100 mb-6">Sign In</h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="dispatcher@logistix.in"
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary justify-center h-10 mt-1"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-surface-600" />
            <span className="text-xs text-gray-600">or try demo</span>
            <div className="flex-1 h-px bg-surface-600" />
          </div>

          {/* Demo buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDemo('dispatcher')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
                         bg-surface-700 hover:bg-surface-600 border border-surface-500
                         text-sm text-gray-300 transition-all duration-200"
            >
              <Radio size={15} className="text-brand-400" />
              <span className="text-xs font-medium">Dispatcher</span>
            </button>
            <button
              onClick={() => handleDemo('driver')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
                         bg-surface-700 hover:bg-surface-600 border border-surface-500
                         text-sm text-gray-300 transition-all duration-200"
            >
              <Truck size={15} className="text-accent-cyan" />
              <span className="text-xs font-medium">Driver</span>
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-700 mt-4">
          Powered by Vapi Voice AI · LogistiX © 2025
        </p>
      </div>
    </div>
  )
}

export default LoginPage
