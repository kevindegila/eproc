import { useState } from 'react'
import { useAppeals, useCreateAppeal, LoadingSpinner, QueryError } from '@eproc/api-client'

const statusConfig: Record<string, { bg: string; text: string }> = {
  'En cours d\'examen': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Tranche': { bg: 'bg-green-100', text: 'text-green-700' },
  'Rejete': { bg: 'bg-red-100', text: 'text-red-700' },
}

export default function RecoursPage() {
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    appelReference: '',
    type: '',
    objet: '',
    motif: '',
  })

  const { data: appealsData, isLoading, error, refetch } = useAppeals()
  const createAppeal = useCreateAppeal()

  const recoursExistants = (appealsData?.data || []) as Record<string, string>[]

  const handleSubmit = async () => {
    if (!formData.appelReference || !formData.objet || !formData.motif) return
    try {
      await createAppeal.mutateAsync(formData)
      setShowForm(false)
      setFormData({ appelReference: '', type: '', objet: '', motif: '' })
    } catch {
      // Error handled by mutation state
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Chargement des recours..." />
  }

  if (error) {
    return <QueryError message="Impossible de charger les recours." onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recours</h1>
          <p className="mt-1 text-sm text-gray-500">
            Deposez et suivez vos recours contre les decisions relatives aux marches publics.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
        >
          {showForm ? 'Annuler' : 'Deposer un recours'}
        </button>
      </div>

      {/* New appeal form */}
      {showForm && (
        <div className="rounded-xl border border-teal-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Nouveau recours</h2>
          <p className="mt-1 text-sm text-gray-500">
            Remplissez le formulaire ci-dessous pour deposer un recours. Tous les champs sont obligatoires.
          </p>
          {createAppeal.isError && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">Une erreur est survenue lors du depot du recours. Veuillez reessayer.</p>
            </div>
          )}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Reference de l'appel concerne</label>
              <input
                type="text"
                placeholder="Ex: AOO-2026-0048"
                value={formData.appelReference}
                onChange={(e) => setFormData({ ...formData, appelReference: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type de recours</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Selectionnez un type</option>
                <option>Contestation du rejet d'une offre</option>
                <option>Contestation de l'attribution</option>
                <option>Contestation des criteres d'evaluation</option>
                <option>Irregularite dans la procedure</option>
                <option>Autre</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Objet du recours</label>
              <input
                type="text"
                placeholder="Decrivez brievement l'objet de votre recours"
                value={formData.objet}
                onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Motif detaille</label>
              <textarea
                rows={4}
                placeholder="Exposez les motifs de votre recours de maniere detaillee, en citant les references legales si necessaire..."
                value={formData.motif}
                onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Pieces justificatives</label>
              <div className="mt-1.5 flex items-center gap-3">
                <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Ajouter des fichiers
                </button>
                <span className="text-xs text-gray-500">PDF, JPEG - 10 Mo max par fichier</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={createAppeal.isPending}
              className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 shadow-sm transition-colors disabled:opacity-50"
            >
              {createAppeal.isPending ? 'Depot en cours...' : 'Deposer le recours'}
            </button>
          </div>
        </div>
      )}

      {/* Existing appeals */}
      <div className="space-y-4">
        {recoursExistants.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-sm text-gray-500">Aucun recours depose pour le moment.</p>
          </div>
        ) : (
          recoursExistants.map((recours) => {
            const id = String(recours.id || recours.reference)
            const statut = String(recours.status || recours.statut || 'En cours d\'examen')
            const status = statusConfig[statut] || statusConfig['En cours d\'examen']
            const isExpanded = expandedId === id
            return (
              <div key={id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : id)}
                  className="flex w-full items-start gap-4 p-5 text-left hover:bg-gray-50 transition-colors rounded-xl"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-mono font-semibold text-teal-600">{String(recours.reference || recours.ref || id)}</span>
                      <span className="text-xs text-gray-400">Appel : {String(recours.appelReference || recours.dacReference || '-')}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}>
                        {statut}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">{String(recours.objet || recours.object || recours.subject || '-')}</h3>
                    <p className="mt-1 text-xs text-gray-500">Depose le {String(recours.dateDepot || recours.createdAt || recours.date || '-')}</p>
                  </div>
                  <svg
                    className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Motif</p>
                      <p className="mt-1 text-sm text-gray-700">{String(recours.motif || recours.reason || '-')}</p>
                    </div>
                    {recours.reponse || recours.decision ? (
                      <div className={`rounded-lg p-4 ${
                        statut === 'Tranche' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <p className={`text-xs font-medium uppercase tracking-wider ${
                          statut === 'Tranche' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          Decision
                        </p>
                        <p className={`mt-1 text-sm ${
                          statut === 'Tranche' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {String(recours.reponse || recours.decision)}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                        <p className="text-sm text-amber-800">
                          Votre recours est en cours d'examen par la Commission de Reglement des Differends.
                          Vous serez notifie de la decision.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
