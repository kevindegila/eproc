import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDACs, LoadingSpinner, QueryError } from '@eproc/api-client'

export default function AppelsPage() {
  const { data, isLoading, error, refetch } = useDACs({ status: 'PUBLIE' })
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  const appels = data?.data ?? []

  const filtered = appels.filter((appel: Record<string, unknown>) => {
    if (search === '') return true
    const searchLower = search.toLowerCase()
    const objet = ((appel.objet as string) || (appel.title as string) || '').toLowerCase()
    const reference = ((appel.reference as string) || '').toLowerCase()
    const autorite = ((appel.autoriteContractante as string) || (appel.organizationName as string) || '').toLowerCase()
    return objet.includes(searchLower) || reference.includes(searchLower) || autorite.includes(searchLower)
  })

  if (isLoading) {
    return <LoadingSpinner message="Chargement des appels d'offres..." />
  }

  if (error) {
    return <QueryError message="Erreur lors du chargement des appels d'offres." onRetry={() => refetch()} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appels a concurrence</h1>
        <p className="mt-1 text-sm text-gray-500">
          Parcourez les appels d'offres en cours et retirez les dossiers de consultation.
        </p>
      </div>

      {/* Search and filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        {/* Search bar */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par reference, objet ou autorite contractante..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
            <button
              onClick={() => setViewMode('cards')}
              className={`rounded-md p-1.5 ${viewMode === 'cards' ? 'bg-teal-100 text-teal-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-md p-1.5 ${viewMode === 'table' ? 'bg-teal-100 text-teal-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        {filtered.length} appel{filtered.length > 1 ? 's' : ''} d'offres trouve{filtered.length > 1 ? 's' : ''}
      </p>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="mt-4 text-sm text-gray-500">Aucun appel d'offres trouve.</p>
        </div>
      )}

      {/* Cards view */}
      {viewMode === 'cards' && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((appel: Record<string, unknown>) => {
            const reference = (appel.reference as string) || `DAC-${(appel.id as string).slice(0, 8)}`
            const objet = (appel.objet as string) || (appel.title as string) || ''
            const autorite = (appel.autoriteContractante as string) || (appel.organizationName as string) || ''
            const type = (appel.type as string) || (appel.typeMarche as string) || ''
            const datePublication = appel.publishedAt || appel.datePublication || appel.createdAt
            const dateLimite = appel.closingDate || appel.dateLimite
            const daysLeft = dateLimite
              ? Math.max(0, Math.ceil((new Date(dateLimite as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
              : null

            return (
              <Link
                key={appel.id as string}
                to={`/appels/${appel.id}`}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-teal-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-semibold text-teal-600">{reference}</span>
                      {type && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
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
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 group-hover:text-teal-700 line-clamp-2">
                      {objet}
                    </h3>
                    {autorite && <p className="mt-1 text-xs text-gray-500">{autorite}</p>}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {datePublication && (
                      <span>Publie le {new Date(datePublication as string).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                  {daysLeft !== null && (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      daysLeft <= 5
                        ? 'bg-red-100 text-red-700'
                        : daysLeft <= 10
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {daysLeft}j restants
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Table view */}
      {viewMode === 'table' && filtered.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Objet</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Autorite Contractante</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date limite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((appel: Record<string, unknown>) => {
                  const reference = (appel.reference as string) || `DAC-${(appel.id as string).slice(0, 8)}`
                  const objet = (appel.objet as string) || (appel.title as string) || ''
                  const autorite = (appel.autoriteContractante as string) || (appel.organizationName as string) || ''
                  const type = (appel.type as string) || (appel.typeMarche as string) || ''
                  const dateLimite = appel.closingDate || appel.dateLimite
                  const daysLeft = dateLimite
                    ? Math.max(0, Math.ceil((new Date(dateLimite as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                    : null

                  return (
                    <tr key={appel.id as string} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3">
                        <Link to={`/appels/${appel.id}`} className="text-sm font-mono font-semibold text-teal-600 hover:text-teal-800">
                          {reference}
                        </Link>
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        <Link to={`/appels/${appel.id}`} className="text-sm text-gray-900 hover:text-teal-700 line-clamp-1">
                          {objet}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{autorite}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {type && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
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
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          {dateLimite && (
                            <span className="text-sm text-gray-700">
                              {new Date(dateLimite as string).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                          {daysLeft !== null && (
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                              daysLeft <= 5 ? 'bg-red-100 text-red-700' : daysLeft <= 10 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {daysLeft}j
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
