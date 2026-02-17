import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAppeal, LoadingSpinner, QueryError } from '@eproc/api-client'

const fallbackTimeline = [
  { date: '05/02/2026 09:30', action: 'Recours depose', acteur: 'Systeme' },
  { date: '05/02/2026 14:00', action: 'Recours enregistre - accuse de reception envoye', acteur: 'Secretariat ARMP' },
  { date: '06/02/2026 10:00', action: 'Dossier assigne au rapporteur', acteur: 'President CRD' },
  { date: '07/02/2026 11:30', action: 'Demande de memoire en defense envoyee a l\'AC', acteur: 'Rapporteur' },
  { date: '09/02/2026 16:00', action: 'Memoire en defense recu', acteur: 'Autorite contractante' },
  { date: '10/02/2026 09:00', action: 'Audience fixee', acteur: 'President CRD' },
]

const fallbackDocuments = [
  { name: 'Requete initiale', auteur: 'Requerant', date: '05/02/2026', type: 'Requerant' },
  { name: 'Pieces justificatives', auteur: 'Requerant', date: '05/02/2026', type: 'Requerant' },
  { name: 'Memoire en defense', auteur: 'Autorite contractante', date: '09/02/2026', type: 'AC' },
  { name: 'PV d\'evaluation des offres', auteur: 'Autorite contractante', date: '09/02/2026', type: 'AC' },
  { name: 'Rapport du rapporteur', auteur: 'Rapporteur', date: '10/02/2026', type: 'Rapporteur' },
]

export default function RecoursDetailPage() {
  const { id } = useParams()
  const { data: appeal, isLoading, error, refetch } = useAppeal(id || '')
  const [decisionText, setDecisionText] = useState('')
  const [decisionType, setDecisionType] = useState('')

  if (isLoading) {
    return <LoadingSpinner message="Chargement du recours..." />
  }

  if (error) {
    return <QueryError message="Impossible de charger les details du recours." onRetry={refetch} />
  }

  const appealRef = appeal?.reference || appeal?.num || id
  const appealType = appeal?.type || 'Recours devant l\'ARMP'
  const appealRequerant = appeal?.requerant || appeal?.applicant || '-'
  const appealAc = appeal?.contractingAuthority || appeal?.ac || '-'
  const appealObjet = appeal?.objet || appeal?.object || appeal?.subject || 'Recours'
  const appealMarche = appeal?.relatedContract || appeal?.marche || '-'
  const appealMontant = appeal?.montant || appeal?.amount || '-'
  const appealDate = appeal?.date || appeal?.createdAt || '-'
  const appealRapporteur = appeal?.rapporteur || appeal?.reporter || '-'
  const appealMotifs = appeal?.motifs || appeal?.grounds || ''
  const appealStatus = appeal?.status || appeal?.statut || 'En instruction'

  const timeline = appeal?.timeline || fallbackTimeline
  const documents = appeal?.documents || fallbackDocuments

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/recours" className="hover:text-red-900">Recours</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{appealRef}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recours {appealRef}</h1>
          <p className="text-sm text-gray-500 mt-1">{appealObjet}</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
          {appealStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appeal info */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Informations du recours</h2>
            </div>
            <div className="p-5">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Numero</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{appealRef}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{appealType}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Requerant</dt>
                  <dd className="mt-1 text-sm text-gray-900">{appealRequerant}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Autorite contractante</dt>
                  <dd className="mt-1 text-sm text-gray-900">{appealAc}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Marche concerne</dt>
                  <dd className="mt-1 text-sm text-gray-900">{appealMarche}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Montant du marche</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{appealMontant}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date de depot</dt>
                  <dd className="mt-1 text-sm text-gray-900">{appealDate}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rapporteur</dt>
                  <dd className="mt-1 text-sm text-gray-900">{appealRapporteur}</dd>
                </div>
              </dl>
              {appealMotifs && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Motifs du recours</dt>
                  <dd className="text-sm text-gray-700 leading-relaxed">{appealMotifs}</dd>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Documents du dossier</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {(documents as { name: string; auteur: string; date: string; type: string }[]).map((doc, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      doc.type === 'Requerant' ? 'bg-orange-50' : doc.type === 'AC' ? 'bg-blue-50' : 'bg-green-50'
                    }`}>
                      <svg className={`w-4 h-4 ${
                        doc.type === 'Requerant' ? 'text-orange-700' : doc.type === 'AC' ? 'text-blue-700' : 'text-green-700'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.auteur} - {doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      doc.type === 'Requerant' ? 'bg-orange-100 text-orange-700' : doc.type === 'AC' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>{doc.type}</span>
                    <button className="text-xs font-medium text-red-900 hover:underline">Consulter</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hearing scheduling */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Audience</h2>
            </div>
            <div className="p-5">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-purple-900">
                      {appeal?.hearingDate
                        ? `Audience prevue le ${appeal.hearingDate}`
                        : 'Date d\'audience a confirmer'}
                    </p>
                    <p className="text-xs text-purple-700 mt-0.5">Salle du Comite de Reglement des Differends - ARMP</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="py-2.5 text-sm font-medium text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Reporter l'audience
                </button>
                <button className="py-2.5 text-sm font-medium text-center bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition-colors">
                  Confirmer la tenue
                </button>
              </div>
            </div>
          </div>

          {/* Decision form */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Decision du CRD</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sens de la decision</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setDecisionType('fonde')}
                    className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      decisionType === 'fonde'
                        ? 'bg-green-700 text-white border-green-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'
                    }`}
                  >
                    Recours fonde
                  </button>
                  <button
                    onClick={() => setDecisionType('partiellement')}
                    className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      decisionType === 'partiellement'
                        ? 'bg-yellow-600 text-white border-yellow-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-yellow-50'
                    }`}
                  >
                    Partiellement fonde
                  </button>
                  <button
                    onClick={() => setDecisionType('rejete')}
                    className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      decisionType === 'rejete'
                        ? 'bg-red-700 text-white border-red-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50'
                    }`}
                  >
                    Recours rejete
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="decision-text" className="block text-sm font-medium text-gray-700 mb-1">
                  Motivation de la decision
                </label>
                <textarea
                  id="decision-text"
                  rows={6}
                  value={decisionText}
                  onChange={(e) => setDecisionText(e.target.value)}
                  placeholder="Rediger la motivation de la decision du CRD..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-900/30 focus:border-red-900"
                />
              </div>

              <button
                className="w-full py-3 bg-red-900 text-white rounded-lg text-sm font-semibold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!decisionType}
              >
                Enregistrer et signer la decision
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Chronologie</h3>
            <div className="space-y-4">
              {(timeline as { date: string; action: string; acteur: string }[]).map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-900 mt-1" />
                    {i < (timeline as unknown[]).length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                  </div>
                  <div className="pb-2">
                    <p className="text-xs text-gray-400">{event.date}</p>
                    <p className="text-sm text-gray-800 mt-0.5">{event.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{event.acteur}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deadlines */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Delais reglementaires</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Delai d'instruction</span>
                <span className="text-xs font-semibold text-orange-600">{appeal?.instructionDeadline || '-- jours restants'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '65%' }} />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">Delai de decision</span>
                <span className="text-xs font-semibold text-green-600">{appeal?.decisionDeadline || '-- jours restants'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '30%' }} />
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Parties</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Requerant</p>
                <p className="text-sm font-medium text-gray-900">{appealRequerant}</p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500">Autorite contractante</p>
                <p className="text-sm font-medium text-gray-900">{appealAc}</p>
              </div>
              {appeal?.contestedAwardee && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-500">Attributaire conteste</p>
                  <p className="text-sm font-medium text-gray-900">{appeal.contestedAwardee}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
