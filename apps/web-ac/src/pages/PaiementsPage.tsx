import { usePaymentRequests, LoadingSpinner, QueryError } from '@eproc/api-client'

const statutColors: Record<string, string> = {
  'pending': 'bg-amber-100 text-amber-700',
  'En instance': 'bg-amber-100 text-amber-700',
  'validated': 'bg-blue-100 text-blue-700',
  'Valide': 'bg-blue-100 text-blue-700',
  'ordered': 'bg-purple-100 text-purple-700',
  'Ordonnance': 'bg-purple-100 text-purple-700',
  'paid': 'bg-emerald-100 text-emerald-700',
  'Paye': 'bg-emerald-100 text-emerald-700',
  'rejected': 'bg-red-100 text-red-700',
  'Rejete': 'bg-red-100 text-red-700',
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    pending: 'En instance',
    validated: 'Valide',
    ordered: 'Ordonnance',
    paid: 'Paye',
    rejected: 'Rejete',
  }
  return map[status] || status
}

export default function PaiementsPage() {
  const { data, isLoading, isError, refetch } = usePaymentRequests()

  const paiements = data?.data ?? []
  const meta = data?.meta

  // Compute summary stats from API data
  const totalEnInstance = paiements.filter(
    (p: Record<string, unknown>) => p.status === 'pending' || p.statut === 'En instance'
  ).length
  const totalValide = paiements.filter(
    (p: Record<string, unknown>) =>
      p.status === 'validated' || p.status === 'ordered' ||
      p.statut === 'Valide' || p.statut === 'Ordonnance'
  ).length
  const totalPaye = paiements.filter(
    (p: Record<string, unknown>) => p.status === 'paid' || p.statut === 'Paye'
  ).length

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
            <p className="text-sm text-gray-500 mt-1">
              Suivi des demandes de paiement et decaissements
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
            <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
            <p className="text-sm text-gray-500 mt-1">
              Suivi des demandes de paiement et decaissements
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
          <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
          <p className="text-sm text-gray-500 mt-1">
            Suivi des demandes de paiement et decaissements
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-amber-600">{totalEnInstance}</p>
          <p className="text-sm text-gray-500">En instance de validation</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-blue-600">{totalValide}</p>
          <p className="text-sm text-gray-500">Valides / Ordonnaces</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-emerald-600">{totalPaye}</p>
          <p className="text-sm text-gray-500">Payes</p>
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
                  Contrat
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Objet
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Demande
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paiements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                    Aucune demande de paiement trouvee
                  </td>
                </tr>
              ) : (
                paiements.map((paiement: Record<string, unknown>) => {
                  const status = String(paiement.status || paiement.statut || 'pending')
                  const reference = String(paiement.reference || paiement.id || '')
                  const contrat = String(paiement.contractReference || paiement.contrat || '')
                  const objet = String(paiement.subject || paiement.objet || '')
                  const type = String(paiement.type || '')
                  const montant = paiement.amount || paiement.montant
                  const montantStr = montant
                    ? typeof montant === 'number'
                      ? `${(montant as number).toLocaleString('fr-FR')} FCFA`
                      : String(montant)
                    : '\u2014'
                  const dateDemande = paiement.requestDate || paiement.dateDemande || '\u2014'
                  return (
                    <tr key={String(paiement.id)} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">
                        {reference}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{contrat}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {objet}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{type}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {montantStr}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statutColors[status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {formatStatus(status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{String(dateDemande)}</td>
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            Affichage de <span className="font-medium">1</span> a{' '}
            <span className="font-medium">{paiements.length}</span> sur{' '}
            <span className="font-medium">{meta?.total ?? paiements.length}</span> resultats
          </p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50">
              Precedent
            </button>
            <button className="px-3 py-1.5 text-sm border border-blue-500 rounded-lg bg-blue-500 text-white">
              1
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
