import { usePaymentRequests, LoadingSpinner, QueryError } from '@eproc/api-client'

const statusConfig: Record<string, { bg: string; text: string }> = {
  'PAYE': { bg: 'bg-green-100', text: 'text-green-700' },
  'EN_ATTENTE': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'EN_RETARD': { bg: 'bg-red-100', text: 'text-red-700' },
  'PENALITE': { bg: 'bg-red-100', text: 'text-red-700' },
  'APPROUVE': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'REJETE': { bg: 'bg-red-100', text: 'text-red-700' },
}

const defaultStatus = { bg: 'bg-gray-100', text: 'text-gray-700' }

export default function PaiementsPage() {
  const { data, isLoading, error, refetch } = usePaymentRequests()

  const paiements = data?.data ?? []

  const totalPaye = paiements
    .filter((p: Record<string, unknown>) => p.status === 'PAYE')
    .length
  const enAttente = paiements
    .filter((p: Record<string, unknown>) => p.status === 'EN_ATTENTE')
    .length

  if (isLoading) {
    return <LoadingSpinner message="Chargement des paiements..." />
  }

  if (error) {
    return <QueryError message="Erreur lors du chargement des paiements." onRetry={() => refetch()} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
        <p className="mt-1 text-sm text-gray-500">
          Suivi des factures, paiements recus et penalites.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Paiements recus</p>
              <p className="mt-1 text-xl font-bold text-green-600">{totalPaye}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5">
              <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">En attente</p>
              <p className="mt-1 text-xl font-bold text-amber-600">{enAttente}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total demandes</p>
              <p className="mt-1 text-xl font-bold text-blue-600">{paiements.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Historique des paiements</h2>
        </div>
        {paiements.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            <p className="mt-4 text-sm text-gray-500">Aucun paiement pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Contrat</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Objet</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paiements.map((p: Record<string, unknown>) => {
                  const statusKey = (p.status as string) || 'EN_ATTENTE'
                  const status = statusConfig[statusKey] || defaultStatus
                  const reference = (p.reference as string) || `PAY-${(p.id as string).slice(0, 8)}`
                  const contrat = (p.contractReference as string) || (p.contractId as string) || ''
                  const objet = (p.objet as string) || (p.description as string) || ''
                  const montant = (p.montant as string) || (p.amount as string) || ''
                  const dateCreated = p.createdAt || p.dateFacture

                  return (
                    <tr key={p.id as string} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-mono font-semibold text-teal-600">
                        {reference}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-mono text-gray-600">
                        {contrat}
                      </td>
                      <td className="max-w-xs px-4 py-3.5 text-sm text-gray-900 line-clamp-1">
                        {objet}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm font-semibold text-gray-900">
                        {montant}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-500">
                        {dateCreated ? new Date(dateCreated as string).toLocaleDateString('fr-FR') : '---'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}>
                          {statusKey.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
