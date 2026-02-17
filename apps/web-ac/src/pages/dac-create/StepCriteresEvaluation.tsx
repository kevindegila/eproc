import type { QualificationCriterion, EvaluationCriterion } from './types'

interface Props {
  qualificationCriteria: QualificationCriterion[]
  setQualificationCriteria: React.Dispatch<React.SetStateAction<QualificationCriterion[]>>
  evaluationCriteria: EvaluationCriterion[]
  setEvaluationCriteria: React.Dispatch<React.SetStateAction<EvaluationCriterion[]>>
  minimumTechnicalScore: number
  setMinimumTechnicalScore: React.Dispatch<React.SetStateAction<number>>
}

export default function StepCriteresEvaluation({
  qualificationCriteria,
  setQualificationCriteria,
  evaluationCriteria,
  setEvaluationCriteria,
  minimumTechnicalScore,
  setMinimumTechnicalScore,
}: Props) {
  const totalWeight = evaluationCriteria.reduce((sum, c) => sum + c.weight, 0)
  const isWeightValid = totalWeight === 100

  const addQualification = () => {
    setQualificationCriteria((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', description: '', isRequired: true },
    ])
  }

  const removeQualification = (id: string) => {
    setQualificationCriteria((prev) => prev.filter((c) => c.id !== id))
  }

  const updateQualification = (id: string, field: keyof QualificationCriterion, value: string) => {
    setQualificationCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    )
  }

  const addEvaluation = () => {
    setEvaluationCriteria((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', weight: 0 },
    ])
  }

  const removeEvaluation = (id: string) => {
    setEvaluationCriteria((prev) => prev.filter((c) => c.id !== id))
  }

  const updateEvaluation = (id: string, field: keyof EvaluationCriterion, value: string | number) => {
    setEvaluationCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Etape 2 : Criteres d'evaluation</h2>

      {/* Qualification criteria */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
          Criteres de qualification
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Criteres eliminatoires (pass/fail) que les soumissionnaires doivent remplir.
        </p>
        <div className="space-y-3">
          {qualificationCriteria.map((criterion) => (
            <div key={criterion.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={criterion.name}
                    onChange={(e) => updateQualification(criterion.id, 'name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom du critere (ex: Capacite financiere)"
                  />
                  <input
                    type="text"
                    value={criterion.description}
                    onChange={(e) => updateQualification(criterion.id, 'description', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Description / exigence (ex: CA min 500M FCFA sur 3 ans)"
                  />
                </div>
                <button
                  onClick={() => removeQualification(criterion.id)}
                  className="mt-1 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addQualification}
          className="mt-3 px-4 py-2 text-sm font-medium text-[#1e3a5f] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          + Ajouter un critere
        </button>
      </div>

      {/* Evaluation criteria */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
          Criteres d'evaluation des offres
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Criteres de notation des offres. Le total des poids doit etre egal a 100.
        </p>
        <div className="space-y-3">
          {evaluationCriteria.map((criterion) => (
            <div key={criterion.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="text"
                value={criterion.name}
                onChange={(e) => updateEvaluation(criterion.id, 'name', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom du critere (ex: Offre technique)"
              />
              <input
                type="number"
                value={criterion.weight || ''}
                onChange={(e) => updateEvaluation(criterion.id, 'weight', Number(e.target.value) || 0)}
                className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min={0}
                max={100}
              />
              <span className="text-sm text-gray-500 w-12">points</span>
              <button
                onClick={() => removeEvaluation(criterion.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={addEvaluation}
            className="px-4 py-2 text-sm font-medium text-[#1e3a5f] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            + Ajouter un critere
          </button>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
            isWeightValid
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-orange-50 text-orange-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isWeightValid ? 'bg-emerald-500' : 'bg-orange-500'}`} />
            Total : {totalWeight} / 100
          </div>
        </div>
      </div>

      {/* Minimum technical score */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
          Note technique minimale
        </h3>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm text-gray-700">Score minimum requis</span>
          <input
            type="number"
            value={minimumTechnicalScore || ''}
            onChange={(e) => setMinimumTechnicalScore(Number(e.target.value) || 0)}
            className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="70"
            min={0}
            max={100}
          />
          <span className="text-sm text-gray-500">/ 100</span>
        </div>
      </div>
    </div>
  )
}
