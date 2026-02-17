import type { QualificationCriterion, EvaluationCriterion, StagedDocument, DocumentCategory } from './types'

interface Props {
  formData: Record<string, string>
  qualificationCriteria: QualificationCriterion[]
  evaluationCriteria: EvaluationCriterion[]
  minimumTechnicalScore: number
  stagedDocuments: StagedDocument[]
  requiredDocuments: DocumentCategory[]
}

export default function StepRecapitulatif({
  formData,
  qualificationCriteria,
  evaluationCriteria,
  minimumTechnicalScore,
  stagedDocuments,
  requiredDocuments,
}: Props) {
  const methodLabels: Record<string, string> = {
    aoo: "Appel d'offres ouvert",
    aor: "Appel d'offres restreint",
    dc: 'Demande de cotation',
    gre: 'Marche de gre a gre',
  }
  const typeLabels: Record<string, string> = {
    fournitures: 'Fournitures',
    travaux: 'Travaux',
    services: 'Services courants',
    pi: 'Prestations intellectuelles',
  }
  const fundingLabels: Record<string, string> = {
    bn: 'Budget national',
    pti: 'Programme de transfert / investissement',
    ext: 'Financement exterieur',
  }

  const allCategoryLabels: Record<string, string> = { AUTRE: 'Autre document' }
  requiredDocuments.forEach((d) => { allCategoryLabels[d.code] = d.label })

  const totalWeight = evaluationCriteria.reduce((sum, c) => sum + c.weight, 0)
  const isWeightValid = totalWeight === 100
  const hasDocuments = stagedDocuments.length > 0

  const alerts: string[] = []
  if (!isWeightValid) alerts.push(`Le total des poids d'evaluation est de ${totalWeight}/100 (doit etre 100)`)
  if (!hasDocuments) alerts.push('Aucun document n\'a ete ajoute')

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Etape 4 : Recapitulatif</h2>

      <div className="space-y-6">
        {/* General info summary */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Informations generales</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Objet</span>
              <span className="text-sm text-gray-900 text-right max-w-md">
                {formData.subject || 'Non renseigne'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Type de marche</span>
              <span className="text-sm text-gray-900">
                {typeLabels[formData.marketType] || 'Non renseigne'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Mode de passation</span>
              <span className="text-sm text-gray-900">
                {methodLabels[formData.procurementMethod] || 'Non renseigne'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Montant estime</span>
              <span className="text-sm text-gray-900">
                {formData.estimatedAmount
                  ? `${Number(formData.estimatedAmount).toLocaleString('fr-FR')} FCFA`
                  : 'Non renseigne'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Source de financement</span>
              <span className="text-sm text-gray-900">
                {fundingLabels[formData.fundingSource] || 'Non renseigne'}
              </span>
            </div>
          </div>
        </div>

        {/* Qualification criteria summary */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Criteres de qualification</h3>
          </div>
          <div className="p-4">
            {qualificationCriteria.length > 0 ? (
              <div className="space-y-2">
                {qualificationCriteria.map((c) => (
                  <div key={c.id} className="flex justify-between">
                    <span className="text-sm text-gray-900">{c.name || 'Sans nom'}</span>
                    <span className="text-xs text-gray-500">{c.description || '—'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Aucun critere de qualification defini.</p>
            )}
          </div>
        </div>

        {/* Evaluation criteria summary */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Criteres d'evaluation</h3>
          </div>
          <div className="p-4 space-y-3">
            {evaluationCriteria.length > 0 ? (
              <>
                {evaluationCriteria.map((c) => (
                  <div key={c.id} className="flex justify-between">
                    <span className="text-sm text-gray-500">{c.name || 'Sans nom'}</span>
                    <span className="text-sm text-gray-900">{c.weight} points</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Total</span>
                  <span className={`text-sm font-medium ${isWeightValid ? 'text-emerald-600' : 'text-orange-600'}`}>
                    {totalWeight} / 100
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">Aucun critere d'evaluation defini.</p>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Note technique minimale</span>
              <span className="text-sm text-gray-900">{minimumTechnicalScore} / 100</span>
            </div>
          </div>
        </div>

        {/* Documents summary */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Documents joints</h3>
          </div>
          <div className="p-4">
            {hasDocuments ? (
              <div className="space-y-2">
                {stagedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 truncate">{doc.file.name}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {allCategoryLabels[doc.category] || doc.category}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Aucun document n'a encore ete televerse.</p>
            )}
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="text-amber-500 text-lg">{'\u26A0'}</span>
              <div>
                <p className="text-sm font-medium text-amber-800">Attention</p>
                <ul className="text-xs text-amber-700 mt-1 list-disc list-inside space-y-1">
                  {alerts.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-amber-500 text-lg">{'\u26A0'}</span>
            <div>
              <p className="text-sm font-medium text-amber-800">
                Verifiez toutes les informations avant de soumettre
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Une fois soumis, le dossier sera envoye pour validation par la DNCMP.
                Vous ne pourrez plus le modifier sans demande de retrait.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
