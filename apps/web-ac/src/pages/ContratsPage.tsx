import { useState } from 'react'
import { useContracts, LoadingSpinner, QueryError } from '@eproc/api-client'

const statutConfig: Record<string, { bg: string; text: string }> = {
  'preparing': { bg: 'bg-gray-100', text: 'text-gray-700' },
  'En preparation': { bg: 'bg-gray-100', text: 'text-gray-700' },
  'visa_pending': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'Visa DNCMP': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'signed': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Signe': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'notified': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Notifie': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'in_execution': { bg: 'bg-green-100', text: 'text-green-800' },
  'En execution': { bg: 'bg-green-100', text: 'text-green-800' },
  'terminated': { bg: 'bg-red-100', text: 'text-red-700' },
  'Resilie': { bg: 'bg-red-100', text: 'text-red-700' },
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    preparing: 'En preparation',
    visa_pending: 'Visa DNCMP',
    signed: 'Signe',
    notified: 'Notifie',
    in_execution: 'En execution',
    terminated: 'Resilie',
  }
  return map[status] || status
}

const workflowSteps = [
  'Preparation',
  'Visa DNCMP',
  'Signature',
  'Notification',
  'Execution',
]

function getWorkflowIndex(statut: string): number {
  const map: Record<string, number> = {
    'preparing': 0,
    'En preparation': 0,
    'visa_pending': 1,
    'Visa DNCMP': 1,
    'signed': 2,
    'Signe': 2,
    'notified': 3,
    'Notifie': 3,
    'in_execution': 4,
    'En execution': 4,
    'terminated': -1,
    'Resilie': -1,
  }
  return map[statut] ?? 0
}

export default function ContratsPage() {
  const { data, isLoading, isError, refetch } = useContracts()
  const [selectedContrat, setSelectedContrat] = useState<Record<string, unknown> | null>(null)

  const contrats = data?.data ?? []

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des contrats</h1>
            <p className="text-sm text-gray-500 mt-1">
              Suivi du cycle de vie des contrats de marches publics
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des contrats</h1>
            <p className="text-sm text-gray-500 mt-1">
              Suivi du cycle de vie des contrats de marches publics
            </p>
          </div>
        </div>
        <QueryError onRetry={refetch} />
      </div>
    )
  }

  const selectedStatus = selectedContrat ? String(selectedContrat.status || selectedContrat.statut || '') : ''
  const isTerminated = selectedStatus === 'terminated' || selectedStatus === 'Resilie'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des contrats</h1>
          <p className="text-sm text-gray-500 mt-1">
            Suivi du cycle de vie des contrats de marches publics
          </p>
        </div>
      </div>

      {/* Workflow visualization for selected contract */}
      {selectedContrat && !isTerminated && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">
              Processus contractuel : {String(selectedContrat.reference || selectedContrat.id || '')}
            </h2>
            <button
              onClick={() => setSelectedContrat(null)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Fermer
            </button>
          </div>
          <div className="flex items-center justify-between">
            {workflowSteps.map((step, index) => {
              const stepIndex = getWorkflowIndex(selectedStatus)
              const isCompleted = index < stepIndex
              const isCurrent = index === stepIndex
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-[#1e3a5f] text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? '\u2713' : index + 1}
                    </div>
                    <span
                      className={`text-xs mt-2 ${
                        isCompleted || isCurrent ? 'text-gray-900 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

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
                  Titulaire
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Signature
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contrats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    Aucun contrat trouve
                  </td>
                </tr>
              ) : (
                contrats.map((contrat: Record<string, unknown>) => {
                  const status = String(contrat.status || contrat.statut || 'preparing')
                  const config = statutConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                  const reference = String(contrat.reference || contrat.id || '')
                  const objet = String(contrat.subject || contrat.objet || '')
                  const titulaire = String(contrat.contractor || contrat.titulaire || '\u2014')
                  const montant = contrat.amount || contrat.montant
                  const montantStr = montant
                    ? typeof montant === 'number'
                      ? `${(montant as number).toLocaleString('fr-FR')} FCFA`
                      : String(montant)
                    : '\u2014'
                  const dateSignature = contrat.signatureDate || contrat.dateSignature || null
                  return (
                    <tr key={String(contrat.id)} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">
                        {reference}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {objet}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{titulaire}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {montantStr}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
                        >
                          {formatStatus(status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {dateSignature ? String(dateSignature) : '\u2014'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setSelectedContrat(contrat)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Suivi
                          </button>
                          <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">
                            Details
                          </button>
                        </div>
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
