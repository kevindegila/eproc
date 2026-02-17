import { useEvaluationSessions, LoadingSpinner, QueryError } from '@eproc/api-client'

const statutConfig: Record<string, { bg: string; text: string; dot: string }> = {
  'in_progress': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  'En cours': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  'completed': { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Terminee': { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'pending': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  'En attente': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  'rejected': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  'Rejetee': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    in_progress: 'En cours',
    completed: 'Terminee',
    pending: 'En attente',
    rejected: 'Rejetee',
  }
  return map[status] || status
}

export default function EvaluationsPage() {
  const { data, isLoading, isError, refetch } = useEvaluationSessions()

  const evaluations = data?.data ?? []

  // Compute summary stats from API data
  const enCoursCount = evaluations.filter(
    (e: Record<string, unknown>) => e.status === 'in_progress' || e.statut === 'En cours'
  ).length
  const enAttenteCount = evaluations.filter(
    (e: Record<string, unknown>) => e.status === 'pending' || e.statut === 'En attente'
  ).length
  const termineesCount = evaluations.filter(
    (e: Record<string, unknown>) => e.status === 'completed' || e.statut === 'Terminee'
  ).length
  const totalOffres = evaluations.reduce(
    (sum: number, e: Record<string, unknown>) => sum + (Number(e.submissionCount || e.nombreOffres || 0)),
    0
  )

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Evaluations des offres</h1>
            <p className="text-sm text-gray-500 mt-1">
              Suivi des evaluations des offres recues
            </p>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Evaluations des offres</h1>
            <p className="text-sm text-gray-500 mt-1">
              Suivi des evaluations des offres recues
            </p>
          </div>
        </div>
        <QueryError onRetry={refetch} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluations des offres</h1>
          <p className="text-sm text-gray-500 mt-1">
            Suivi des evaluations des offres recues
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-blue-600">{enCoursCount}</p>
          <p className="text-sm text-gray-500">En cours</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-amber-600">{enAttenteCount}</p>
          <p className="text-sm text-gray-500">En attente</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-emerald-600">{termineesCount}</p>
          <p className="text-sm text-gray-500">Terminees</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-gray-600">{totalOffres}</p>
          <p className="text-sm text-gray-500">Offres evaluees</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Objet
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Offres
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ouverture
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {evaluations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    Aucune evaluation trouvee
                  </td>
                </tr>
              ) : (
                evaluations.map((evaluation: Record<string, unknown>) => {
                  const status = String(evaluation.status || evaluation.statut || 'pending')
                  const config = statutConfig[status] || statutConfig['pending']
                  const reference = String(evaluation.reference || evaluation.id || '')
                  const objet = String(evaluation.subject || evaluation.objet || '')
                  const nombreOffres = Number(evaluation.submissionCount || evaluation.nombreOffres || 0)
                  const commission = String(evaluation.committee || evaluation.commission || '')
                  const dateOuverture = evaluation.openingDate || evaluation.dateOuverture || null
                  return (
                    <tr key={String(evaluation.id)} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">
                        {reference}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {objet}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{nombreOffres}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{commission}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {dateOuverture ? String(dateOuverture) : '\u2014'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                          {formatStatus(status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          Details
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
