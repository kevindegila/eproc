import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@eproc/api-client'

export default function ConnexionPage() {
  const { login, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch {
      setError('Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-teal-700">eProcurement Benin</h1>
          <p className="text-sm text-gray-500 mt-1">Portail Soumissionnaire</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Connexion</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="votre@email.bj" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Votre mot de passe" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full mt-6 bg-teal-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Test accounts */}
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-800 mb-3 uppercase tracking-wider">Comptes de test</p>
          <div className="space-y-2">
            {[
              { email: 'contact@dronebj.bj', password: 'EprocTest2026!', label: 'Drone BJ', role: 'Christophe AGOSSOU' },
              { email: 'contact@btpplus.bj', password: 'EprocTest2026!', label: 'BTP Plus', role: 'Raoul Ahouandjinou' },
            ].map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => { setEmail(account.email); setPassword(account.password) }}
                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-amber-200 rounded-lg text-left hover:bg-amber-100 transition-colors group"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">{account.label}</span>
                  <span className="text-xs text-gray-500 ml-2">{account.email}</span>
                </div>
                <span className="text-xs text-amber-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Utiliser</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
