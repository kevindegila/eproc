import { useExecutions, LoadingSpinner, QueryError } from '@eproc/api-client'

const statutColors: Record<string, string> = {
  'in_progress': 'bg-blue-100 text-blue-700',
  'En cours': 'bg-blue-100 text-blue-700',
  'suspended': 'bg-red-100 text-red-700',
  'Suspendu': 'bg-red-100 text-red-700',
  'completed': 'bg-gray-100 text-gray-700',
  'Termine': 'bg-gray-100 text-gray-700',
  'provisional_reception': 'bg-amber-100 text-amber-700',
  'Reception provisoire': 'bg-amber-100 text-amber-700',
  'final_reception': 'bg-emerald-100 text-emerald-700',
  'Reception definitive': 'bg-emerald-100 text-emerald-700',
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    in_progress: 'En cours',
    suspended: 'Suspendu',
    completed: 'Termine',
    provisional_reception: 'Reception provisoire',
    final_reception: 'Reception definitive',
  }
  return map[status] || status
}

function progressBarColor(avancement: number): string {
  if (avancement >= 75) return 'bg-emerald-500'
  if (avancement >= 50) return 'bg-blue-500'
  if (avancement >= 25) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function ExecutionPage() {
  const { data, isLoading, isError, refetch } = useExecutions()

  const marches = data?.data ?? []

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suivi d'execution</h1>
            <p className="text-sm text-gray-500 mt-1">
              Suivi de l'avancement physique et financier des marches
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
            <h1 className="text-2xl font-bold text-gray-900">Suivi d'execution</h1>
            <p className="text-sm text-gray-500 mt-1">
              Suivi de l'avancement physique et financier des marches
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
          <h1 className="text-2xl font-bold text-gray-900">Suivi d'execution</h1>
          <p className="text-sm text-gray-500 mt-1">
            Suivi de l'avancement physique et financier des marches
          </p>
        </div>
      </div>

      {/* Execution cards */}
      <div className="space-y-4">
        {marches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-sm text-gray-500">Aucun marche en execution trouve</p>
          </div>
        ) : (
          marches.map((marche: Record<string, unknown>) => {
            const status = String(marche.status || marche.statut || 'in_progress')
            const reference = String(marche.reference || marche.contractReference || marche.id || '')
            const objet = String(marche.subject || marche.objet || '')
            const titulaire = String(marche.contractor || marche.titulaire || '')
            const avancement = Number(marche.progress || marche.avancement || 0)
            const montantContrat = marche.contractAmount || marche.montantContrat
            const montantContratStr = montantContrat
              ? typeof montantContrat === 'number'
                ? `${(montantContrat as number).toLocaleString('fr-FR')} FCFA`
                : String(montantContrat)
              : '\u2014'
            const montantPaye = marche.paidAmount || marche.montantPaye
            const montantPayeStr = montantPaye
              ? typeof montantPaye === 'number'
                ? `${(montantPaye as number).toLocaleString('fr-FR')} FCFA`
                : String(montantPaye)
              : '\u2014'
            const dateDebut = marche.startDate || marche.dateDebutPrevue || '\u2014'
            const dateFin = marche.endDate || marche.dateFinPrevue || '\u2014'

            return (
              <div
                key={String(marche.id)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-bold text-gray-900">{reference}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statutColors[status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {formatStatus(status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{objet}</p>
                    <p className="text-xs text-gray-500 mt-1">Titulaire : {titulaire}</p>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Details
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">Avancement physique</span>
                    <span className="text-xs font-bold text-gray-700">{avancement}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${progressBarColor(avancement)}`}
                      style={{ width: `${avancement}%` }}
                    />
                  </div>
                </div>

                {/* Financial and timeline info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Montant contrat</p>
                    <p className="text-sm font-medium text-gray-900">{montantContratStr}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Montant paye</p>
                    <p className="text-sm font-medium text-gray-900">{montantPayeStr}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Debut prevu</p>
                    <p className="text-sm font-medium text-gray-900">{String(dateDebut)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fin prevue</p>
                    <p className="text-sm font-medium text-gray-900">{String(dateFin)}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
