import React, { useEffect, useState } from 'react'
import { getSupabase } from '../lib/supabase'
import { LogOut } from 'lucide-react'

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      const supabase = getSupabase()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } catch (e: any) {
      setError(e?.message || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Acceder</h2>
      <div className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full border rounded px-3 py-2"
        />
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
        )}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2"
        >
          {loading ? 'Procesando…' : 'Entrar'}
        </button>
        <p className="text-sm text-gray-600 text-center">El registro está deshabilitado.</p>
      </div>
    </div>
  )
}

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const enabled = import.meta.env.VITE_ENABLE_AUTH === 'true'
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled) return
    let unsub: (() => void) | undefined
    (async () => {
      try {
        const supabase = getSupabase()
        const { data } = await supabase.auth.getSession()
        setEmail(data.session?.user?.email ?? null)
        const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
          setEmail(session?.user?.email ?? null)
        })
        unsub = () => sub.subscription.unsubscribe()
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      unsub?.()
    }
  }, [enabled])

  if (!enabled) return <>{children}</>
  if (loading) return <div className="p-6 text-center text-gray-600">Cargando…</div>
  if (!email) return <AuthForm />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-3">
        <span className="text-sm text-gray-700">Sesión: {email}</span>
        <button
          onClick={async () => { const s = getSupabase(); await s.auth.signOut() }}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>
      {children}
    </div>
  )
}

export default AuthGate