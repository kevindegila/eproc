import { useArbitrations, LoadingSpinner, QueryError } from '@eproc/api-client'

function StatusBadge({ statut }: { statut: string }) {
  const colors: Record<string, string> = {
    'En cours': 'bg-blue-100 text-blue-800 border-blue-200',
    'Deliberation': 'bg-purple-100 text-purple-800 border-purple-200',
    'Sentence rendue': 'bg-green-100 text-green-800 border-green-200',
    'Cloture': 'bg-gray-100 text-gray-600 border-gray-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${colors[statut] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {statut}
    </span>
  )
}

export default function ArbitragePage() {
  const { data: arbitrationsData, isLoading, error, refetch } = useArbitrations()

  const cases = (arbitrationsData?.data || []) as Record<string, string | number>[]

  if (isLoading) {
    return <LoadingSpinner message="Chargement des affaires d'arbitrage..." />
  }

  if (error) {
    return <QueryError message="Impossible de charger les affaires d'arbitrage." onRetry={refetch} />
  }

  const enCours = cases.filter((c) => String(c.status || c.statut || '') === 'En cours').length
  const enDeliberation = cases.filter((c) => String(c.status || c.statut || '') === 'Deliberation').length
  const sentencesRendues = cases.filter((c) => String(c.status || c.statut || '') === 'Sentence rendue').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arbitrage</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion des affaires d'arbitrage en matiere de marches publics</p>
        </div>
        <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-900/30">
          <option>Tous les statuts</option>
          <option>En cours</option>
          <option>Deliberation</option>
          <option>Sentence rendue</option>
          <option>Cloture</option>
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Affaires en cours</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{enCours}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">En deliberation</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{enDeliberation}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Sentences ce trimestre</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{sentencesRendues}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total affaires</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">{cases.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          {cases.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parties</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Objet</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Arbitre</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cases.map((c) => {
                  const ref = String(c.reference || c.ref || c.id)
                  return (
                    <tr key={ref} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-red-900">{ref}</td>
                      <td className="px-5 py-3 text-sm text-gray-700">{String(c.parties || c.applicant || '-')}</td>
                      <td className="px-5 py-3 text-sm text-gray-700 max-w-xs truncate">{String(c.objet || c.object || c.subject || '-')}</td>
                      <td className="px-5 py-3 text-sm text-gray-700 whitespace-nowrap">{String(c.montant || c.amount || '-')}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{String(c.date || c.createdAt || '-')}</td>
                      <td className="px-5 py-3 text-sm text-gray-700">{String(c.arbitre || c.arbitrator || '-')}</td>
                      <td className="px-5 py-3"><StatusBadge statut={String(c.status || c.statut || '-')} /></td>
                      <td className="px-5 py-3 text-right">
                        <button className="text-xs font-medium px-3 py-1.5 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors">
                          Consulter
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="px-5 py-12 text-center text-sm text-gray-500">Aucune affaire d'arbitrage trouvee</div>
          )}
        </div>
      </div>
    </div>
  )
}
