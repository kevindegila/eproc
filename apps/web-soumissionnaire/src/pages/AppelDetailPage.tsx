import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDAC, LoadingSpinner, QueryError } from '@eproc/api-client'

export default function AppelDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: dac, isLoading, error, refetch } = useDAC(id!)
  const [dacRetire, setDacRetire] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    jours: 0,
    heures: 0,
    minutes: 0,
    secondes: 0,
  })

  // Calculate countdown from closing date
  useEffect(() => {
    if (!dac) return

    const closingDate = dac.closingDate || dac.dateLimite
    if (!closingDate) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const target = new Date(closingDate).getTime()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft({ jours: 0, heures: 0, minutes: 0, secondes: 0 })
        return
      }

      setTimeLeft({
        jours: Math.floor(diff / (1000 * 60 * 60 * 24)),
        heures: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secondes: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [dac])

  if (isLoading) {
    return <LoadingSpinner message="Chargement de l'appel d'offres..." />
  }

  if (error || !dac) {
    return <QueryError message="Erreur lors du chargement de l'appel d'offres." onRetry={() => refetch()} />
  }

  const reference = dac.reference || `DAC-${id?.slice(0, 8)}`
  const objet = dac.objet || dac.title || ''
  const autorite = dac.autoriteContractante || dac.organizationName || ''
  const type = dac.type || dac.typeMarche || ''
  const description = dac.description || ''
  const datePublication = dac.publishedAt || dac.datePublication || dac.createdAt
  const closingDate = dac.closingDate || dac.dateLimite

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/appels" className="hover:text-teal-600 transition-colors">Appels a concurrence</Link>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="font-medium text-gray-900">{reference}</span>
      </nav>

      {/* Header section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex flex-wrap items-start gap-3">
            <span className="text-sm font-mono font-semibold text-teal-600">{reference}</span>
            {type && (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                type === 'TRAVAUX' || type === 'Travaux'
                  ? 'bg-orange-100 text-orange-700'
                  : type === 'FOURNITURES' || type === 'Fournitures'
                  ? 'bg-blue-100 text-blue-700'
                  : type === 'SERVICES' || type === 'Services'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}>
                {type}
              </span>
            )}
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              {dac.status || 'En cours'}
            </span>
          </div>
          <h1 className="mt-3 text-xl font-bold text-gray-900">{objet}</h1>
          {autorite && (
            <p className="mt-2 text-sm text-gray-500">
              Autorite Contractante : <span className="font-medium text-gray-700">{autorite}</span>
            </p>
          )}
        </div>

        {/* Countdown timer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Temps restant avant cloture</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-gray-900">{String(timeLeft.jours).padStart(2, '0')}</span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Jours</span>
                </div>
                <span className="text-xl font-bold text-gray-300">:</span>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-gray-900">{String(timeLeft.heures).padStart(2, '0')}</span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Heures</span>
                </div>
                <span className="text-xl font-bold text-gray-300">:</span>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-gray-900">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Min</span>
                </div>
                <span className="text-xl font-bold text-gray-300">:</span>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-teal-600">{String(timeLeft.secondes).padStart(2, '0')}</span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Sec</span>
                </div>
              </div>
            </div>
            <div className="ml-auto flex flex-wrap gap-3">
              {!dacRetire ? (
                <button
                  onClick={() => setDacRetire(true)}
                  className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  Retirer le DAC
                </button>
              ) : (
                <span className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 text-sm font-medium text-green-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  DAC retire
                </span>
              )}
              <Link
                to={`/mes-offres/soumettre/${id}`}
                className={`rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  dacRetire
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                }`}
              >
                Soumettre une offre
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Description de l'appel</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600 leading-relaxed">
              {description ? (
                <p>{description}</p>
              ) : (
                <p className="text-gray-400 italic">Aucune description disponible.</p>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Documents du dossier</h2>
              <p className="mt-1 text-xs text-gray-500">
                {dacRetire
                  ? 'Telechargez les documents du dossier de consultation.'
                  : 'Veuillez retirer le DAC pour acceder aux documents.'}
              </p>
            </div>
            <div className="p-6 text-center">
              {!dacRetire ? (
                <p className="text-sm text-gray-400">Retirez le DAC pour voir les documents.</p>
              ) : (
                <p className="text-sm text-gray-500">Les documents seront disponibles au telechargement.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          {/* Key info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Informations cles</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Reference</dt>
                <dd className="mt-1 text-sm font-mono font-semibold text-gray-900">{reference}</dd>
              </div>
              {type && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Type de marche</dt>
                  <dd className="mt-1 text-sm text-gray-900">{type}</dd>
                </div>
              )}
              {dac.secteur && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Secteur</dt>
                  <dd className="mt-1 text-sm text-gray-900">{dac.secteur}</dd>
                </div>
              )}
              {dac.montantEstime && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Montant estime</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{dac.montantEstime}</dd>
                </div>
              )}
              {datePublication && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Date de publication</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(datePublication).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </dd>
                </div>
              )}
              {closingDate && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Date limite de depot</dt>
                  <dd className="mt-1 text-sm font-semibold text-red-600">
                    {new Date(closingDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Contact */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Contact</h2>
            <div className="mt-4 space-y-3">
              {autorite && (
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{autorite}</p>
                    <p className="text-xs text-gray-500">Personne Responsable des Marches</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
