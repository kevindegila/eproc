import { useState } from 'react'
import { useDACs, LoadingSpinner, QueryError } from '@eproc/api-client'

export default function AvisPage() {
  const [typeFilter, setTypeFilter] = useState('')
  const [orgFilter, setOrgFilter] = useState('')

  const { data, isLoading, isError, error, refetch } = useDACs({ status: 'PUBLIE' })

  const avis = data?.data ?? []
  const meta = data?.meta

  // Extract unique types and orgs for filter dropdowns
  const types = [...new Set(avis.map((a: Record<string, unknown>) => a.type as string))].filter(Boolean)
  const orgs = [...new Set(avis.map((a: Record<string, unknown>) => a.autorite as string))].filter(Boolean)

  // Client-side filtering
  const filtered = avis.filter((a: Record<string, unknown>) => {
    if (typeFilter && a.type !== typeFilter) return false
    if (orgFilter && a.autorite !== orgFilter) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Avis d'appels a concurrence
        </h1>
        <p className="text-gray-600">
          Retrouvez l'ensemble des avis d'appels d'offres, demandes de propositions
          et avis de pre-qualification publies par les autorites contractantes.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
          Filtres
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Type de procedure</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Tous les types</option>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Autorite contractante</label>
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Toutes les autorites</option>
              {orgs.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date de publication</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setTypeFilter(''); setOrgFilter('') }}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Reinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && <LoadingSpinner message="Chargement des avis..." />}

      {/* Error state */}
      {isError && (
        <QueryError
          message={
            (error as Error)?.message ||
            'Impossible de charger les avis d\'appels a concurrence.'
          }
          onRetry={() => refetch()}
        />
      )}

      {/* Content */}
      {!isLoading && !isError && (
        <>
          {/* Results count */}
          <p className="text-sm text-gray-600 mb-4">
            {filtered.length} resultat{filtered.length > 1 ? 's' : ''} trouve{filtered.length > 1 ? 's' : ''}
          </p>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-sm">
                Aucun avis d'appel a concurrence ne correspond aux criteres selectionnes.
              </p>
            </div>
          ) : (
            /* Table */
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Objet</th>
                    <th className="px-4 py-3">Autorite contractante</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Publication</th>
                    <th className="px-4 py-3">Date limite</th>
                    <th className="px-4 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((a: Record<string, unknown>) => (
                    <tr key={a.reference as string || a.id as string} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-3 font-medium text-green-700">{a.reference as string}</td>
                      <td className="px-4 py-3 text-gray-900 max-w-xs">{a.objet as string}</td>
                      <td className="px-4 py-3 text-gray-600">{a.autorite as string}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded whitespace-nowrap">
                          {a.type as string}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{a.datePublication as string}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{a.dateLimite as string}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            a.statut === 'Ouvert' || a.statut === 'PUBLIE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {a.statut as string}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Page {meta?.page ?? 1} sur {meta?.totalPages ?? 1}
            </p>
            <div className="flex gap-2">
              <button
                disabled={!meta?.page || meta.page <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-400 cursor-not-allowed disabled:opacity-50"
              >
                Precedent
              </button>
              <button
                disabled={!meta?.totalPages || (meta?.page ?? 1) >= meta.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-400 cursor-not-allowed disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
