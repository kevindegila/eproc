import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateDAC, useSubmitDAC, useUploadDocument } from '@eproc/api-client'
import type { QualificationCriterion, EvaluationCriterion, StagedDocument, DocumentCategory } from './dac-create/types'
import { DEFAULT_REQUIRED_DOCUMENTS } from './dac-create/types'
import StepInformationsGenerales from './dac-create/StepInformationsGenerales'
import StepCriteresEvaluation from './dac-create/StepCriteresEvaluation'
import StepDocuments from './dac-create/StepDocuments'
import StepRecapitulatif from './dac-create/StepRecapitulatif'

const steps = [
  { number: 1, label: 'Informations generales' },
  { number: 2, label: "Evaluation" },
  { number: 3, label: 'Documents' },
  { number: 4, label: 'Recapitulatif' },
]

export default function DACCreatePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  const createDAC = useCreateDAC()
  const submitDAC = useSubmitDAC()
  const uploadDocument = useUploadDocument()

  // Step 1 state
  const [formData, setFormData] = useState({
    subject: '',
    marketType: '',
    procurementMethod: '',
    estimatedAmount: '',
    fundingSource: '',
    ppmReference: '',
    executionDelay: '',
  })

  // Step 2 state — criteria
  const [qualificationCriteria, setQualificationCriteria] = useState<QualificationCriterion[]>([
    { id: crypto.randomUUID(), name: 'Capacite financiere', description: '', isRequired: true },
    { id: crypto.randomUUID(), name: 'Experience technique', description: '', isRequired: true },
  ])
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriterion[]>([
    { id: crypto.randomUUID(), name: 'Offre technique', weight: 70 },
    { id: crypto.randomUUID(), name: 'Offre financiere', weight: 30 },
  ])
  const [minimumTechnicalScore, setMinimumTechnicalScore] = useState(70)

  // Step 3 state — documents
  const [stagedDocuments, setStagedDocuments] = useState<StagedDocument[]>([])
  const [requiredDocuments, setRequiredDocuments] = useState<DocumentCategory[]>([...DEFAULT_REQUIRED_DOCUMENTS])

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [savingDraft, setSavingDraft] = useState(false)

  const goNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const goPrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const buildPayload = () => {
    const criteria = {
      qualification: qualificationCriteria.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        isRequired: c.isRequired,
      })),
      evaluation: evaluationCriteria.map((c) => ({
        id: c.id,
        name: c.name,
        weight: c.weight,
      })),
      minimumTechnicalScore,
    }
    return {
      subject: formData.subject,
      marketType: formData.marketType,
      procurementMethod: formData.procurementMethod,
      estimatedAmount: formData.estimatedAmount ? Number(formData.estimatedAmount) : undefined,
      fundingSource: formData.fundingSource,
      ppmReference: formData.ppmReference,
      executionDelay: formData.executionDelay ? Number(formData.executionDelay) : undefined,
      criteria,
    }
  }

  const handleSaveDraft = async () => {
    setSubmitError(null)
    setSavingDraft(true)
    try {
      await createDAC.mutateAsync(buildPayload())
      navigate('/dac')
    } catch {
      setSubmitError('Une erreur est survenue lors de l\'enregistrement du brouillon.')
    } finally {
      setSavingDraft(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    try {
      const dac = await createDAC.mutateAsync(buildPayload())

      // Upload staged documents sequentially
      const dacId = (dac as { id: string }).id
      for (const doc of stagedDocuments) {
        setStagedDocuments((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, status: 'uploading' as const } : d)),
        )
        try {
          await uploadDocument.mutateAsync({
            dacId,
            file: doc.file,
            category: doc.category,
          })
          setStagedDocuments((prev) =>
            prev.map((d) => (d.id === doc.id ? { ...d, status: 'uploaded' as const } : d)),
          )
        } catch {
          setStagedDocuments((prev) =>
            prev.map((d) => (d.id === doc.id ? { ...d, status: 'error' as const } : d)),
          )
        }
      }

      // Soumettre pour validation DNCMP
      await submitDAC.mutateAsync(dacId)

      navigate('/dac')
    } catch {
      setSubmitError('Une erreur est survenue lors de la creation du dossier. Veuillez reessayer.')
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouveau dossier d'appel a concurrence</h1>
        <p className="text-sm text-gray-500 mt-1">
          Creez un nouveau dossier en suivant les etapes ci-dessous
        </p>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    currentStep === step.number
                      ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                      : currentStep > step.number
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-gray-400 border-gray-300'
                  }`}
                >
                  {currentStep > step.number ? '\u2713' : step.number}
                </div>
                <span
                  className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {currentStep === 1 && (
          <StepInformationsGenerales formData={formData} updateField={updateField} />
        )}
        {currentStep === 2 && (
          <StepCriteresEvaluation
            qualificationCriteria={qualificationCriteria}
            setQualificationCriteria={setQualificationCriteria}
            evaluationCriteria={evaluationCriteria}
            setEvaluationCriteria={setEvaluationCriteria}
            minimumTechnicalScore={minimumTechnicalScore}
            setMinimumTechnicalScore={setMinimumTechnicalScore}
          />
        )}
        {currentStep === 3 && (
          <StepDocuments
            stagedDocuments={stagedDocuments}
            setStagedDocuments={setStagedDocuments}
            requiredDocuments={requiredDocuments}
            setRequiredDocuments={setRequiredDocuments}
          />
        )}
        {currentStep === 4 && (
          <StepRecapitulatif
            formData={formData}
            qualificationCriteria={qualificationCriteria}
            evaluationCriteria={evaluationCriteria}
            minimumTechnicalScore={minimumTechnicalScore}
            stagedDocuments={stagedDocuments}
            requiredDocuments={requiredDocuments}
          />
        )}

        {/* Error message */}
        {(createDAC.isError || submitError) && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {submitError || 'Une erreur est survenue lors de la creation du dossier. Veuillez reessayer.'}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => (currentStep === 1 ? navigate('/dac') : goPrev())}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {currentStep === 1 ? 'Annuler' : 'Precedent'}
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={savingDraft || !formData.subject || !formData.marketType || !formData.procurementMethod}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {savingDraft ? 'Enregistrement...' : 'Enregistrer le brouillon'}
            </button>
            {currentStep < 4 ? (
              <button
                onClick={goNext}
                className="px-6 py-2.5 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#2a4d7a] transition-colors"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={createDAC.isPending}
                className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {createDAC.isPending ? 'Envoi en cours...' : 'Soumettre pour validation'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
