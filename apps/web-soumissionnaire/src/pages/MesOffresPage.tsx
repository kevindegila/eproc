import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSubmissions, LoadingSpinner, QueryError } from '@eproc/api-client'

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  SOUMISE: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Soumise' },
  EN_EVALUATION: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'En evaluation' },
  RETENUE: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Retenue' },
  REJETEE: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Rejetee' },
}

const defaultStatus = { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500', label: '' }

type StatutFilter = 'Tous' | 'SOUMISE' | 'EN_EVALUATION' | 'RETENUE' | 'REJETEE'

export default function MesOffresPage() {
  const { data, isLoading, error, refetch } = useSubmissions()
  const [filterStatut, setFilterStatut] = useState<StatutFilter>('Tous')

  const offres = data?.data ?? []

  const filtered = offres.filter(
    (o: Record<string, unknown>) => filterStatut === 'Tous' || o.status === filterStatut
  )

  const counts = {
    total: offres.length,
    soumise: offres.filter((o: Record<string, unknown>) => o.status === 'SOUMISE').length,
    evaluation: offres.filter((o: Record<string, unknown>) => o.status === 'EN_EVALUATION').length,
    retenue: offres.filter((o: Record<string, unknown>) => o.status === 'RETENUE').length,
    rejetee: offres.filter((o: Record<string, unknown>) => o.status === 'REJETEE').length,
  }

  if (isLoading) {
    return <LoadingSpinner message="Chargement de vos offres..." />
  }

  if (error) {
    return <QueryError message="Erreur lors du chargement de vos offres." onRetry={() => refetch()} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes offres</h1>
          <p className="mt-1 text-sm text-gray-500">
            Suivez l'etat de toutes vos soumissions.
          </p>
        </div>
        <Link
          to="/appels"
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
        >
          Parcourir les appels
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <button
          onClick={() => setFilterStatut('Tous')}
          className={`rounded-lg border p-3 text-center transition-all ${
            filterStatut === 'Tous' ? 'border-teal-300 bg-teal-50 ring-1 ring-teal-200' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
          <p className="text-xs font-medium text-gray-500">Total</p>
        </button>
        <button
          onClick={() => setFilterStatut('SOUMISE')}
          className={`rounded-lg border p-3 text-center transition-all ${
            filterStatut === 'SOUMISE' ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-blue-600">{counts.soumise}</p>
          <p className="text-xs font-medium text-gray-500">Soumises</p>
        </button>
        <button
          onClick={() => setFilterStatut('EN_EVALUATION')}
          className={`rounded-lg border p-3 text-center transition-all ${
            filterStatut === 'EN_EVALUATION' ? 'border-amber-300 bg-amber-50 ring-1 ring-amber-200' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-amber-600">{counts.evaluation}</p>
          <p className="text-xs font-medium text-gray-500">En evaluation</p>
        </button>
        <button
          onClick={() => setFilterStatut('RETENUE')}
          className={`rounded-lg border p-3 text-center transition-all ${
            filterStatut === 'RETENUE' ? 'border-green-300 bg-green-50 ring-1 ring-green-200' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-green-600">{counts.retenue}</p>
          <p className="text-xs font-medium text-gray-500">Retenues</p>
        </button>
        <button
          onClick={() => setFilterStatut('REJETEE')}
          className={`rounded-lg border p-3 text-center transition-all ${
            filterStatut === 'REJETEE' ? 'border-red-300 bg-red-50 ring-1 ring-red-200' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-red-600">{counts.rejetee}</p>
          <p className="text-xs font-medium text-gray-500">Rejetees</p>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">DAC</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Objet</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date de soumission</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((offre: Record<string, unknown>) => {
                const statusKey = (offre.status as string) || 'SOUMISE'
                const status = statusConfig[statusKey] || { ...defaultStatus, label: statusKey }
                const reference = (offre.reference as string) || `OFF-${(offre.id as string).slice(0, 8)}`
                const dacRef = (offre.dacReference as string) || (offre.dacId as string) || ''
                const objet = (offre.objet as string) || (offre.title as string) || ''
                const dateSubmitted = offre.submittedAt || offre.createdAt

                return (
                  <tr key={offre.id as string} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm font-mono font-semibold text-teal-600">
                      {reference}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm font-mono text-gray-600">
                      {dacRef}
                    </td>
                    <td className="max-w-xs px-4 py-3.5">
                      <p className="text-sm text-gray-900 line-clamp-1">{objet}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-500">
                      {dateSubmitted ? new Date(dateSubmitted as string).toLocaleDateString('fr-FR') : '---'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500">Aucune offre trouvee pour ce filtre.</p>
          </div>
        )}
      </div>
    </div>
  )
}
