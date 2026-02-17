import { useParams, Link } from 'react-router-dom'
import { useForecastPlan, LoadingSpinner, QueryError } from '@eproc/api-client'

interface MarketEntryData {
  id: string
  lineNumber: number
  referenceCode: string | null
  description: string
  marketType: string
  method: string
  estimatedAmount: number
  fundingSource: string | null
  launchAuthDate: string | null
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount) + ' FCFA'
}

export default function PlanDetailPublicPage() {
  const { planId } = useParams<{ planId: string }>()
  const { data: plan, isLoading, isError, refetch } = useForecastPlan(planId || '')

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <LoadingSpinner message="Chargement du plan..." />
      </div>
    )
  }

  if (isError || !plan) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/plans" className="text-sm text-green-700 hover:text-green-900 mb-4 inline-flex items-center gap-1">
          &larr; Retour aux plans
        </Link>
        <QueryError onRetry={refetch} />
      </div>
    )
  }

  const entries: MarketEntryData[] = plan.entries || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/plans" className="text-sm text-green-700 hover:text-green-900 mb-4 inline-flex items-center gap-1">
        &larr; Retour aux plans
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 mt-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{plan.reference}</h1>
            {plan.organizationName && (
              <p className="text-sm text-green-700 font-medium mt-1">{plan.organizationName}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">{plan.title}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-sm text-gray-600">
                Exercice: <span className="font-medium">{plan.fiscalYear}</span>
              </span>
              <span className="text-sm text-gray-600">
                Version: <span className="font-medium">V{plan.version || 1}</span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Montant Total</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{formatAmount(plan.totalAmount || 0)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Entrees</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{entries.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Statut</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
              Publie
            </span>
          </div>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-12">N</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3 min-w-[250px]">Description</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3 text-right">Montant (FCFA)</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Date lancement DAO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                    Aucune entree dans ce plan
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{entry.lineNumber}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{entry.referenceCode || '\u2014'}</td>
                    <td className="px-4 py-3 text-gray-900">{entry.description}</td>
                    <td className="px-4 py-3 text-gray-700">{entry.marketType}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        {entry.method || '\u2014'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 text-right font-medium">
                      {new Intl.NumberFormat('fr-FR').format(entry.estimatedAmount)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{entry.fundingSource || '\u2014'}</td>
                    <td className="px-4 py-3 text-gray-700">{entry.launchAuthDate || '\u2014'}</td>
                  </tr>
                ))
              )}
            </tbody>
            {entries.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                    Total ({entries.length} entrees)
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                    {new Intl.NumberFormat('fr-FR').format(
                      entries.reduce((s, e) => s + (e.estimatedAmount || 0), 0),
                    )}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
