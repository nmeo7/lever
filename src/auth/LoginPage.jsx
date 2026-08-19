import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLogin } from './useAuth'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()

  const from = location.state?.from?.pathname ?? '/app'

  const handleSubmit = (e) => {
    e.preventDefault()
    login.mutate({ email, password }, { onSuccess: () => navigate(from, { replace: true }) })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-background)', fontFamily: 'var(--font-family)' }}>
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-3" style={{ background: 'var(--color-primary)' }}>
            E
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Sign in to your workspace</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 flex flex-col gap-4"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 4px 24px color-mix(in srgb, var(--color-primary) 8%, transparent)' }}
        >
          {login.isError && (
            <div className="rounded-lg px-3 py-2 text-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {login.error?.message ?? 'Invalid credentials'}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all"
              style={{
                background: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all"
              style={{
                background: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity mt-1"
            style={{ background: 'var(--color-primary)', opacity: login.isPending ? 0.6 : 1 }}
          >
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
