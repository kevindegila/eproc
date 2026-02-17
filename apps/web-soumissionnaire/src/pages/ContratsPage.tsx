import { useContracts, LoadingSpinner, QueryError } from '@eproc/api-client'

const statusConfig: Record<string, { bg: string; text: string }> = {
  'EN_COURS': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'ACTIF': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'TERMINE': { bg: 'bg-green-100', text: 'text-green-700' },
  'SUSPENDU': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'RESILIE': { bg: 'bg-red-100', text: 'text-red-700' },
}

const defaultStatus = { bg: 'bg-gray-100', text: 'text-gray-700' }

export default function ContratsPage() {
  const { data, isLoading, error, refetch } = useContracts()

  const contrats = data?.data ?? []

  const activeCount = contrats.filter((c: Record<string, unknown>) =>
    c.status === 'EN_COURS' || c.status === 'ACTIF'
  ).length
  const terminatedCount = contrats.filter((c: Record<string, unknown>) =>
    c.status === 'TERMINE'
  ).length

  if (isLoading) {
    return <LoadingSpinner message="Chargement de vos contrats..." />
  }

  if (error) {
    return <QueryError message="Erreur lors du chargement de vos contrats." onRetry={() => refetch()} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes contrats</h1>
        <p className="mt-1 text-sm text-gray-500">
          Suivez l'execution et l'avancement de vos contrats en cours.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Contrats actifs</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Contrats termines</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{terminatedCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total contrats</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{contrats.length}</p>
        </div>
      </div>

      {/* Contracts list */}
      {contrats.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <p className="mt-4 text-sm text-gray-500">Aucun contrat pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contrats.map((contrat: Record<string, unknown>) => {
            const statusKey = (contrat.status as string) || 'EN_COURS'
            const status = statusConfig[statusKey] || defaultStatus
            const reference = (contrat.reference as string) || `CTR-${(contrat.id as string).slice(0, 8)}`
            const objet = (contrat.objet as string) || (contrat.title as string) || ''
            const autorite = (contrat.autoriteContractante as string) || (contrat.organizationName as string) || ''
            const montant = (contrat.montant as string) || (contrat.amount as string) || ''
            const dateSignature = contrat.signedAt || contrat.dateSignature || contrat.createdAt
            const dateFin = contrat.endDate || contrat.dateFin
            const progression = (contrat.progression as number) ?? (contrat.progress as number) ?? 0

            return (
              <div key={contrat.id as string} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-mono font-semibold text-teal-600">{reference}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}>
                        {statusKey.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-gray-900">{objet}</h3>
                    {autorite && <p className="mt-1 text-sm text-gray-500">{autorite}</p>}
                  </div>
                  {montant && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{montant}</p>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span>Progression</span>
                    <span className="font-semibold text-gray-700">{progression}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        progression === 100 ? 'bg-green-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${progression}%` }}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-gray-500">
                  {dateSignature && (
                    <div className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      Signe le {new Date(dateSignature as string).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  {dateFin && (
                    <div className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Echeance : {new Date(dateFin as string).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
