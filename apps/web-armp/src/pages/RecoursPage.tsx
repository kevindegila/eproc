import { Link } from 'react-router-dom'
import { useAppeals, LoadingSpinner, QueryError } from '@eproc/api-client'

function StatusBadge({ statut }: { statut: string }) {
  const colors: Record<string, string> = {
    'Audience prevue': 'bg-purple-100 text-purple-800 border-purple-200',
    'Instruction': 'bg-blue-100 text-blue-800 border-blue-200',
    'Decision rendue': 'bg-green-100 text-green-800 border-green-200',
    'Classe': 'bg-gray-100 text-gray-600 border-gray-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${colors[statut] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {statut}
    </span>
  )
}

function DelaiIndicator({ delai }: { delai: string }) {
  if (!delai || delai === '-') return <span className="text-sm text-gray-400">-</span>
  const jours = parseInt(delai)
  let color = 'text-green-700'
  if (!isNaN(jours)) {
    if (jours <= 5) color = 'text-orange-600 font-semibold'
    if (jours <= 3) color = 'text-red-700 font-bold'
  }
  return <span className={`text-sm ${color}`}>{delai}</span>
}

export default function RecoursPage() {
  const { data: appealsData, isLoading, error, refetch } = useAppeals()

  const recours = (appealsData?.data || []) as Record<string, string>[]

  if (isLoading) {
    return <LoadingSpinner message="Chargement des recours..." />
  }

  if (error) {
    return <QueryError message="Impossible de charger les recours." onRetry={refetch} />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des recours</h1>
          <p className="text-sm text-gray-500 mt-1">Recours prealables et recours devant l'ARMP</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-900/30">
            <option>Tous les types</option>
            <option>Prealable</option>
            <option>ARMP</option>
          </select>
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-900/30">
            <option>Tous les statuts</option>
            <option>Instruction</option>
            <option>Audience prevue</option>
            <option>Decision rendue</option>
            <option>Classe</option>
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total recours</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">{recours.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">En instruction</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {recours.filter((r) => (r.status || r.statut || '') === 'Instruction').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Audiences prevues</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">
            {recours.filter((r) => (r.status || r.statut || '') === 'Audience prevue').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Decisions rendues</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {recours.filter((r) => (r.status || r.statut || '') === 'Decision rendue').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          {recours.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Numero</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Requerant</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Objet</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Delai restant</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recours.map((r) => {
                  const num = r.reference || r.num || r.id
                  const status = r.status || r.statut || '-'
                  return (
                    <tr key={r.id || r.num} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <Link to={`/recours/${r.id || num}`} className="text-sm font-medium text-red-900 hover:underline">
                          {num}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700">{r.requerant || r.applicant || '-'}</td>
                      <td className="px-5 py-3 text-sm text-gray-700 max-w-xs truncate">{r.objet || r.object || r.subject || '-'}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          (r.type || '') === 'ARMP' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {r.type || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{r.date || r.createdAt || '-'}</td>
                      <td className="px-5 py-3"><StatusBadge statut={status} /></td>
                      <td className="px-5 py-3"><DelaiIndicator delai={r.delai || r.remainingDays || '-'} /></td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={`/recours/${r.id || num}`}
                          className="text-xs font-medium px-3 py-1.5 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors"
                        >
                          Consulter
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="px-5 py-12 text-center text-sm text-gray-500">Aucun recours trouve</div>
          )}
        </div>
      </div>
    </div>
  )
}
