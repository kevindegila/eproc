import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useDAC, LoadingSpinner, QueryError } from '@eproc/api-client'

const conformityChecklist = [
  { id: 1, label: 'Plan de passation des marches approuve', checked: true },
  { id: 2, label: 'Avis general de passation publie', checked: true },
  { id: 3, label: 'Cahier des charges conforme au modele type', checked: false },
  { id: 4, label: 'Criteres d\'evaluation clairement definis', checked: true },
  { id: 5, label: 'Seuils de passation respectes', checked: true },
  { id: 6, label: 'Delais de publicite conformes', checked: false },
  { id: 7, label: 'Composition de la commission conforme', checked: true },
  { id: 8, label: 'Financement disponible et certifie', checked: true },
  { id: 9, label: 'Specifications techniques non discriminatoires', checked: true },
  { id: 10, label: 'Pieces administratives requises presentes', checked: true },
]

export default function ControleDetailPage() {
  const { id } = useParams()
  const { data: dac, isLoading, error, refetch } = useDAC(id || '')
  const [decision, setDecision] = useState('')
  const [comments, setComments] = useState('')
  const [checklist, setChecklist] = useState(conformityChecklist)

  const toggleCheck = (itemId: number) => {
    setChecklist(prev => prev.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ))
  }

  if (isLoading) {
    return <LoadingSpinner message="Chargement du dossier..." />
  }

  if (error) {
    return <QueryError message="Impossible de charger le dossier d'appel a concurrence." onRetry={refetch} />
  }

  const dacRef = dac?.reference || dac?.ref || id
  const dacObjet = dac?.objet || dac?.object || dac?.title || 'Dossier d\'appel a concurrence'
  const dacAc = dac?.contractingAuthority || dac?.ac || '-'
  const dacType = dac?.type || dac?.procurementType || '-'
  const dacMontant = dac?.montant || dac?.amount || dac?.estimatedAmount || '-'
  const dacStatus = dac?.status || dac?.statut || 'En examen'
  const dacSource = dac?.fundingSource || dac?.source || '-'
  const dacDate = dac?.submissionDate || dac?.createdAt || '-'
  const dacPrmp = dac?.responsiblePerson || dac?.prmp || '-'

  const documents = dac?.documents || [
    { name: 'Cahier des charges', type: 'PDF', taille: '2,4 Mo', date: '2026-02-09' },
    { name: 'Avis d\'appel a concurrence', type: 'PDF', taille: '156 Ko', date: '2026-02-09' },
    { name: 'PV Commission d\'ouverture', type: 'PDF', taille: '890 Ko', date: '2026-02-08' },
    { name: 'Plan de passation', type: 'PDF', taille: '1,1 Mo', date: '2026-02-07' },
    { name: 'Certification de credit', type: 'PDF', taille: '245 Ko', date: '2026-02-06' },
  ]

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/controle" className="hover:text-red-900">Controle a priori</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{dacRef}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examen du DAC {dacRef}</h1>
          <p className="text-sm text-gray-500 mt-1">Controle de conformite du dossier d'appel a concurrence</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
          {dacStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: DAC info + documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* DAC Information */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Informations du DAC</h2>
            </div>
            <div className="p-5">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{dacRef}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Autorite contractante</dt>
                  <dd className="mt-1 text-sm text-gray-900">{dacAc}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Objet</dt>
                  <dd className="mt-1 text-sm text-gray-900">{dacObjet}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type de marche</dt>
                  <dd className="mt-1 text-sm text-gray-900">{dacType}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Montant estime</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{dacMontant}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Source de financement</dt>
                  <dd className="mt-1 text-sm text-gray-900">{dacSource}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date de soumission</dt>
                  <dd className="mt-1 text-sm text-gray-900">{dacDate}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Personne responsable</dt>
                  <dd className="mt-1 text-sm text-gray-900">{dacPrmp}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Documents joints</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {(documents as { name: string; type: string; taille?: string; date: string }[]).map((doc) => (
                <div key={doc.name} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type} {doc.taille ? `- ${doc.taille}` : ''} - {doc.date}</p>
                    </div>
                  </div>
                  <button className="text-xs font-medium text-red-900 hover:underline">Telecharger</button>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Form */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Decision</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avis du controleur</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDecision('approuver')}
                    className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      decision === 'approuver'
                        ? 'bg-green-700 text-white border-green-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'
                    }`}
                  >
                    Bon a lancer (Approuver)
                  </button>
                  <button
                    onClick={() => setDecision('rejeter')}
                    className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      decision === 'rejeter'
                        ? 'bg-red-700 text-white border-red-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50'
                    }`}
                  >
                    Rejeter
                  </button>
                  <button
                    onClick={() => setDecision('observation')}
                    className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      decision === 'observation'
                        ? 'bg-yellow-600 text-white border-yellow-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-yellow-50'
                    }`}
                  >
                    Observations
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaires et observations
                </label>
                <textarea
                  id="comments"
                  rows={5}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Saisir les observations detaillees..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-900/30 focus:border-red-900"
                />
              </div>

              {/* Electronic signature */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Signature electronique requise</span>
                </div>
                <button
                  className="w-full py-3 bg-red-900 text-white rounded-lg text-sm font-semibold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!decision}
                >
                  Signer et soumettre la decision
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Conformity checklist */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Points de conformite</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {checklist.filter(c => c.checked).length}/{checklist.length} conformes
              </p>
            </div>
            <div className="p-4 space-y-2">
              {checklist.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleCheck(item.id)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-red-900 focus:ring-red-900"
                  />
                  <span className={`text-sm ${item.checked ? 'text-gray-700' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Compliance progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Taux de conformite</h3>
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Progression</span>
                <span className="text-xs font-semibold text-gray-900">
                  {Math.round((checklist.filter(c => c.checked).length / checklist.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-900 h-2 rounded-full transition-all"
                  style={{ width: `${(checklist.filter(c => c.checked).length / checklist.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Historique</h3>
            <div className="space-y-3">
              {[
                { date: '09/02/2026', action: 'DAC recu pour controle' },
                { date: '09/02/2026', action: 'Assigne au controleur' },
                { date: '10/02/2026', action: 'Examen en cours' },
              ].map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-red-900 mt-1.5" />
                    {i < 2 && <div className="w-px flex-1 bg-gray-200" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs text-gray-500">{event.date}</p>
                    <p className="text-sm text-gray-700">{event.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
