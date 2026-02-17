import { Link } from 'react-router-dom'
import { useForecastPlans, LoadingSpinner, QueryError } from '@eproc/api-client'

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount) + ' FCFA'
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr))
  } catch {
    return dateStr || '--'
  }
}

export default function PlansPage() {
  const { data, isLoading, isError, error, refetch } = useForecastPlans({ status: 'PUBLIE' })

  const plans = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Plans previsionnels de passation des marches
        </h1>
        <p className="text-gray-600">
          Consultez les plans previsionnels annuels de passation des marches publics
          publies par les autorites contractantes conformement a l'article 12 du
          Decret 2025-169.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Exercice</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Autorite contractante</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Toutes les autorites</option>
              {([...new Set(plans.map((p: Record<string, unknown>) => p.organizationName as string).filter(Boolean))] as string[]).map((name: string) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button className="px-4 py-2 text-sm bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors">
              Filtrer
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && <LoadingSpinner message="Chargement des plans previsionnels..." />}

      {/* Error state */}
      {isError && (
        <QueryError
          message={
            (error as Error)?.message ||
            'Impossible de charger les plans previsionnels.'
          }
          onRetry={() => refetch()}
        />
      )}

      {/* Content */}
      {!isLoading && !isError && (
        <>
          {plans.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-sm">
                Aucun plan previsionnel publie pour le moment.
              </p>
            </div>
          ) : (
            /* Table */
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Autorite contractante</th>
                    <th className="px-4 py-3">Exercice</th>
                    <th className="px-4 py-3">Date de publication</th>
                    <th className="px-4 py-3">Nombre de marches</th>
                    <th className="px-4 py-3">Montant total previsionnel</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {plans.map((p: Record<string, unknown>) => {
                    const count = (p._count as Record<string, number>)?.entries ?? 0
                    return (
                      <tr key={p.id as string} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-green-700">{p.reference as string}</td>
                        <td className="px-4 py-3 text-gray-900">{(p.organizationName as string) || '--'}</td>
                        <td className="px-4 py-3 text-gray-600">{String(p.fiscalYear ?? '')}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(p.updatedAt as string)}</td>
                        <td className="px-4 py-3 text-gray-600 text-center">{count}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">{formatAmount(Number(p.totalAmount ?? 0))}</td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/plans/${p.id}`}
                            className="px-3 py-1 text-xs font-medium text-green-700 border border-green-300 rounded hover:bg-green-50 transition-colors"
                          >
                            Consulter
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
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
