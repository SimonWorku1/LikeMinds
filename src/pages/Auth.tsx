import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const { user, signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<'student' | 'tutor'>('student')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'in') {
        await signIn(email, password)
      } else {
        await signUp({ email, password, displayName, role })
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-b from-brand-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-semibold text-slate-900 mb-6">
            {mode === 'in' ? 'Welcome back' : 'Create your account'}
          </h1>
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'up' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Display name</label>
                    <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="mt-1 w-full rounded-lg border p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value as any)} className="mt-1 w-full rounded-lg border p-2">
                      <option value="student">Student</option>
                      <option value="tutor">Tutor (requires verification)</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-lg border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-lg border p-2" />
                </div>
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={loading}>{mode === 'in' ? 'Sign In' : 'Create Account'}</Button>
                <button type="button" onClick={() => setMode(mode === 'in' ? 'up' : 'in')} className="text-brand">
                  {mode === 'in' ? "Don't have an account? Sign up" : 'Have an account? Sign in'}
                </button>
              </div>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-slate-500 text-sm">or</span>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full"
              onClick={async () => {
                setError(null)
                setLoading(true)
                try {
                  await signInWithGoogle()
                } catch (e: any) {
                  setError(e.message || 'Google sign-in failed')
                } finally {
                  setLoading(false)
                }
              }}
            >
              Continue with Google
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}


