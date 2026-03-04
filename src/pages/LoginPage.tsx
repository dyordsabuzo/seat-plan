import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { user, loading, signInWithGoogle, registerWithEmail, signInWithEmail } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin'|'register'>('signin')
  const [error, setError] = useState<string | null>(null)

  const onGoogle = async () => {
    try {
      await signInWithGoogle()
      navigate('/')
    } catch (err) {
      console.error('Google sign-in failed', err)
      setError('Google sign-in failed')
    }
  }

  const onSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (mode === 'register') {
        await registerWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
      const dest = (location.state as any)?.from?.pathname || '/'
      navigate(dest)
    } catch (err: any) {
      console.error('Email auth failed', err)
      setError(err?.message || 'Authentication failed')
    }
  }

  const [resetMode, setResetMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const { sendPasswordReset } = useAuth()

  const onSendReset = async () => {
    setResetMessage(null)
    try {
      await sendPasswordReset(resetEmail)
      setResetMessage('Password reset email sent. Check your inbox.')
    } catch (err: any) {
      setResetMessage(err?.message || 'Failed to send reset email')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center text-white text-lg font-semibold">SP</div>
          <div>
            <h1 className="text-xl font-semibold">Welcome to Seat Plan</h1>
            <p className="text-sm text-gray-500">Sign in to manage regattas and paddlers</p>
          </div>
        </div>

        <form onSubmit={onSubmitEmail} className="mt-6">
          <div className="flex gap-2 mb-4">
            <button type="button" onClick={() => setMode('signin')} className={`flex-1 py-2 rounded ${mode === 'signin' ? 'bg-sky-600 text-white' : 'bg-gray-100'}`}>Sign in</button>
            <button type="button" onClick={() => setMode('register')} className={`flex-1 py-2 rounded ${mode === 'register' ? 'bg-sky-600 text-white' : 'bg-gray-100'}`}>Register</button>
          </div>

          <div className="mb-3">
            <label className="text-sm text-gray-600">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border rounded px-3 py-2 mt-1" required />
          </div>
          <div className="mb-3">
            <label className="text-sm text-gray-600">Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full border rounded px-3 py-2 mt-1" required minLength={6} />
          </div>

          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

          {!resetMode ? (
            <>
              <button type="submit" disabled={loading} className="w-full bg-sky-600 text-white py-2 rounded mb-3">{mode === 'register' ? 'Create account' : 'Sign in'}</button>
              <div className="text-right mb-3">
                <button type="button" onClick={() => setResetMode(true)} className="text-sm text-sky-600 hover:underline">Forgot password?</button>
              </div>
            </>
          ) : (
            <div className="mb-3">
              <label className="text-sm text-gray-600">Email for reset</label>
              <input value={resetEmail} onChange={e => setResetEmail(e.target.value)} type="email" className="w-full border rounded px-3 py-2 mt-1 mb-2" />
              <div className="flex gap-2">
                <button type="button" onClick={onSendReset} className="flex-1 bg-sky-600 text-white py-2 rounded">Send reset</button>
                <button type="button" onClick={() => { setResetMode(false); setResetMessage(null); }} className="flex-1 border rounded py-2">Cancel</button>
              </div>
              {resetMessage && <div className="text-sm text-gray-600 mt-2">{resetMessage}</div>}
            </div>
          )}

          <div className="text-sm text-center text-gray-500 mb-3">or</div>

          <button
            type="button"
            onClick={onGoogle}
            disabled={loading || !!user}
            className="w-full flex items-center justify-center gap-3 border rounded-lg px-4 py-2 hover:shadow transition disabled:opacity-60 disabled:cursor-not-allowed">
            <span className="w-5 h-5 inline-block">
              {/* Inline Google logo SVG */}
              <svg viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <path d="M533.5 278.4c0-18.5-1.5-37.2-4.6-55.3H272v104.8h147.1c-6.4 34.6-25.4 63.9-54 83.6v69.7h87.2c51.1-47 80.2-116.3 80.2-202.8z" fill="#4285f4"/>
                <path d="M272 544.3c73.5 0 135.3-24.4 180.4-66.2l-87.2-69.7c-24.2 16.3-55 25.9-93.2 25.9-71.6 0-132.3-48.3-154-113.2H28.6v71.1C73.8 490.7 166.6 544.3 272 544.3z" fill="#34a853"/>
                <path d="M118 323.1c-10.9-32.3-10.9-67 0-99.3v-71.1H28.6c-39.9 79.2-39.9 173.6 0 252.8L118 323.1z" fill="#fbbc04"/>
                <path d="M272 214.6c39.9 0 75.8 13.7 104.1 40.6l78-78C407.3 132.1 347.4 104 272 104 166.6 104 73.8 157.6 28.6 237.2l89.4 71.1c21.7-64.9 82.4-113.7 154-113.7z" fill="#ea4335"/>
              </svg>
            </span>
            <span className="text-sm font-medium">Continue with Google</span>
          </button>

          <div className="mt-6 text-center text-xs text-gray-400">
            By signing in you agree to the terms of service.
          </div>

          {user && (
            <div className="mt-4 p-3 bg-green-50 rounded text-sm text-green-800">
              Signed in as {user.displayName ?? user.email}
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => navigate(-1)} className="text-sm text-sky-600 hover:underline">Back</button>
        </div>
      </div>
    </div>
  )
}
