import { useDACs, useAppeals, LoadingSpinner, QueryError } from '@eproc/api-client'

const urgentItems = [
  {
    id: 1,
    type: 'delai',
    message: 'DAC-2026-0142 : delai de transmission de 2 jours expire dans 6h (Art. 145)',
    priority: 'critique',
  },
  {
    id: 2,
    type: 'audience',
    message: 'Audience recours REC-2026-0089 prevue demain a 14h00',
    priority: 'haute',
  },
  {
    id: 3,
    type: 'denonciation',
    message: 'Denonciation anonyme recue - preuves jointes a examiner',
    priority: 'haute',
  },
  {
    id: 4,
    type: 'delai',
    message: '3 DAC en attente de controle depuis plus de 48h',
    priority: 'moyenne',
  },
]

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    critique: 'bg-red-100 text-red-800 border-red-200',
    haute: 'bg-orange-100 text-orange-800 border-orange-200',
    moyenne: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

function StatusBadge({ statut }: { statut: string }) {
  let color = 'bg-gray-100 text-gray-700 border-gray-200'
  if (statut === 'En cours' || statut === 'En examen' || statut === 'Instruction') color = 'bg-blue-100 text-blue-800 border-blue-200'
  if (statut === 'En attente') color = 'bg-yellow-100 text-yellow-800 border-yellow-200'
  if (statut === 'Audience prevue') color = 'bg-purple-100 text-purple-800 border-purple-200'
  if (statut === 'Decision rendue') color = 'bg-green-100 text-green-800 border-green-200'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      {statut}
    </span>
  )
}

export default function DashboardPage() {
  const { data: dacsData, isLoading: dacsLoading, error: dacsError, refetch: refetchDacs } = useDACs()
  const { data: appealsData, isLoading: appealsLoading, error: appealsError, refetch: refetchAppeals } = useAppeals()

  const dacs = dacsData?.data || []
  const appeals = appealsData?.data || []

  const dacCount = dacs.length
  const appealsCount = appeals.length

  if (dacsLoading || appealsLoading) {
    return <LoadingSpinner message="Chargement du tableau de bord..." />
  }

  if (dacsError && appealsError) {
    return <QueryError message="Impossible de charger les donnees du tableau de bord." onRetry={() => { refetchDacs(); refetchAppeals() }} />
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de l'activite de regulation</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">DAC en attente</span>
            <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{dacCount}</p>
          <p className="text-xs text-red-600 mt-1 font-medium">{dacCount > 0 ? `${dacCount} dossier(s) soumis` : 'Aucun dossier'}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Recours actifs</span>
            <span className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{appealsCount}</p>
          <p className="text-xs text-orange-600 mt-1 font-medium">{appealsCount > 0 ? `${appealsCount} recours en cours` : 'Aucun recours'}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Delai moyen controle</span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">--</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Donnees indisponibles</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Taux resolution recours</span>
            <span className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">--</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Donnees indisponibles</p>
        </div>
      </div>

      {/* Urgent Alerts */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <h2 className="text-base font-semibold text-red-900">Alertes urgentes</h2>
        </div>
        <div className="space-y-2">
          {urgentItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-red-100">
              <p className="text-sm text-gray-800">{item.message}</p>
              <PriorityBadge priority={item.priority} />
            </div>
          ))}
        </div>
      </div>

      {/* DAC Pending Control */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">DAC en attente de controle</h2>
          <p className="text-xs text-gray-500 mt-0.5">Dossiers d'appel a concurrence soumis pour controle a priori</p>
        </div>
        <div className="overflow-x-auto">
          {dacs.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Objet</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dacs.slice(0, 5).map((dac: Record<string, string>) => (
                  <tr key={dac.id || dac.ref} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-red-900">{dac.reference || dac.ref || dac.id}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{dac.objet || dac.object || dac.title || '-'}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{dac.type || dac.procurementType || '-'}</span>
                    </td>
                    <td className="px-5 py-3"><StatusBadge statut={dac.status || dac.statut || '-'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-gray-500">Aucun DAC en attente de controle</div>
          )}
        </div>
      </div>

      {/* Active Appeals */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Recours actifs</h2>
          <p className="text-xs text-gray-500 mt-0.5">Recours en cours de traitement</p>
        </div>
        <div className="overflow-x-auto">
          {appeals.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Numero</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Requerant</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Objet</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appeals.slice(0, 5).map((appeal: Record<string, string>) => (
                  <tr key={appeal.id || appeal.num} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-red-900">{appeal.reference || appeal.num || appeal.id}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{appeal.requerant || appeal.applicant || '-'}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{appeal.objet || appeal.object || appeal.subject || '-'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        (appeal.type || '') === 'ARMP' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {appeal.type || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-3"><StatusBadge statut={appeal.status || appeal.statut || '-'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-gray-500">Aucun recours actif</div>
          )}
        </div>
      </div>
    </div>
  )
}
