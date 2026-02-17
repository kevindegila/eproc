import { useDenunciations, LoadingSpinner, QueryError } from '@eproc/api-client'

function PrioriteBadge({ priorite }: { priorite: string }) {
  const colors: Record<string, string> = {
    'Critique': 'bg-red-100 text-red-800 border-red-200',
    'Haute': 'bg-orange-100 text-orange-800 border-orange-200',
    'Moyenne': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${colors[priorite] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {priorite}
    </span>
  )
}

function StatusBadge({ statut }: { statut: string }) {
  const colors: Record<string, string> = {
    'Nouveau': 'bg-red-100 text-red-800 border-red-200',
    'En examen': 'bg-blue-100 text-blue-800 border-blue-200',
    'Enquete': 'bg-purple-100 text-purple-800 border-purple-200',
    'Cloture': 'bg-gray-100 text-gray-600 border-gray-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${colors[statut] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {statut}
    </span>
  )
}

export default function DenonciationsPage() {
  const { data: denunciationsData, isLoading, error, refetch } = useDenunciations()

  const denonciations = (denunciationsData?.data || []) as Record<string, string | number>[]

  if (isLoading) {
    return <LoadingSpinner message="Chargement des denonciations..." />
  }

  if (error) {
    return <QueryError message="Impossible de charger les denonciations." onRetry={refetch} />
  }

  const nouvelles = denonciations.filter((d) => String(d.status || d.statut || '') === 'Nouveau').length
  const enExamen = denonciations.filter((d) => String(d.status || d.statut || '') === 'En examen').length
  const enquetes = denonciations.filter((d) => String(d.status || d.statut || '') === 'Enquete').length
  const cloturees = denonciations.filter((d) => String(d.status || d.statut || '') === 'Cloture').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Denonciations</h1>
          <p className="text-sm text-gray-500 mt-1">Examen des denonciations recues - Acces restreint (Art. 171)</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-900/30">
            <option>Toutes les priorites</option>
            <option>Critique</option>
            <option>Haute</option>
            <option>Moyenne</option>
          </select>
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-900/30">
            <option>Tous les statuts</option>
            <option>Nouveau</option>
            <option>En examen</option>
            <option>Enquete</option>
            <option>Cloture</option>
          </select>
        </div>
      </div>

      {/* Access restriction notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Acces restreint</span> - Cette section est reservee aux profils habilites conformement a l'article 171 du Code des marches publics. La confidentialite des sources doit etre strictement preservee.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Nouvelles</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{nouvelles}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">En examen</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{enExamen}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Enquetes ouvertes</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{enquetes}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Cloturees ce mois</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">{cloturees}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          {denonciations.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Objet</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priorite</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Preuves</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {denonciations.map((d) => {
                  const ref = String(d.reference || d.ref || d.id)
                  const statut = String(d.status || d.statut || '-')
                  return (
                    <tr key={ref} className={`hover:bg-gray-50 transition-colors ${statut === 'Nouveau' ? 'bg-red-50/50' : ''}`}>
                      <td className="px-5 py-3 text-sm font-medium text-red-900">{ref}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          String(d.source || '') === 'Anonyme' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {String(d.source || '-')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700 max-w-xs truncate">{String(d.objet || d.object || d.subject || '-')}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{String(d.date || d.createdAt || '-')}</td>
                      <td className="px-5 py-3"><PrioriteBadge priorite={String(d.priorite || d.priority || '-')} /></td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-gray-700">{String(d.preuves || d.evidenceCount || 0)} doc(s)</span>
                      </td>
                      <td className="px-5 py-3"><StatusBadge statut={statut} /></td>
                      <td className="px-5 py-3 text-right">
                        <button className="text-xs font-medium px-3 py-1.5 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors">
                          Examiner
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="px-5 py-12 text-center text-sm text-gray-500">Aucune denonciation trouvee</div>
          )}
        </div>
      </div>
    </div>
  )
}
