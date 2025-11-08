import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const { user, signInWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  return (
    <div className="bg-gradient-to-b from-brand-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-semibold text-slate-900 mb-6">
            Sign in
          </h1>
          <Card className="p-6">
            {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
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
            <div className="text-xs text-slate-500 mt-3">
              Google sign-in only. You can become a tutor after signing in from your Profile.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


