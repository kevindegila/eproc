import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useCreateSubmission, useAuth } from '@eproc/api-client'

interface FileItem {
  name: string
  size: string
  type: string
}

const steps = [
  {
    number: 1,
    title: 'Pieces administratives',
    description: 'Documents juridiques et administratifs requis',
  },
  {
    number: 2,
    title: 'Offre technique',
    description: 'Documents techniques de votre proposition',
  },
  {
    number: 3,
    title: 'Offre financiere',
    description: 'Proposition financiere detaillee',
  },
  {
    number: 4,
    title: 'Chiffrement et signature',
    description: 'Securisation et signature electronique',
  },
  {
    number: 5,
    title: 'Confirmation et depot',
    description: 'Verification finale et soumission',
  },
]

const adminDocuments = [
  'Attestation fiscale en cours de validite',
  'Attestation CNSS en cours de validite',
  'Registre de commerce (RCCM)',
  'Attestation de non faillite',
  'Caution de soumission',
  'Declaration sur l\'honneur',
]

const technicalDocuments = [
  'Memoire technique detaille',
  'Planning d\'execution des travaux',
  'Liste du personnel cle propose',
  'CV du personnel cle',
  'Liste du materiel et equipements',
  'References de marches similaires',
]

const financialDocuments = [
  'Bordereau des prix unitaires (BPU)',
  'Detail quantitatif et estimatif (DQE)',
  'Sous-detail des prix',
  'Decomposition du montant global et forfaitaire',
]

export default function SoumettreOffrePage() {
  const { dacId } = useParams<{ dacId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const createSubmission = useCreateSubmission()
  const [currentStep, setCurrentStep] = useState(1)
  const [adminFiles, setAdminFiles] = useState<FileItem[]>([])
  const [techFiles, setTechFiles] = useState<FileItem[]>([])
  const [financeFiles, setFinanceFiles] = useState<FileItem[]>([])
  const [signed, setSigned] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const userFullName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur'
    : 'Utilisateur'

  const handleFileAdd = (setter: React.Dispatch<React.SetStateAction<FileItem[]>>) => {
    // Simulated file add
    const newFile: FileItem = {
      name: `Document_${Date.now()}.pdf`,
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} Mo`,
      type: 'PDF',
    }
    setter((prev) => [...prev, newFile])
  }

  const handleFileRemove = (setter: React.Dispatch<React.SetStateAction<FileItem[]>>, index: number) => {
    setter((prev) => prev.filter((_, i) => i !== index))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return adminFiles.length > 0
      case 2: return techFiles.length > 0
      case 3: return financeFiles.length > 0
      case 4: return signed
      case 5: return true
      default: return false
    }
  }

  const handleSubmitOffer = async () => {
    setSubmitError('')
    try {
      await createSubmission.mutateAsync({
        dacId: dacId || '',
        status: 'SOUMISE',
        adminDocumentsCount: adminFiles.length,
        techDocumentsCount: techFiles.length,
        financeDocumentsCount: financeFiles.length,
        signed: true,
      })
      setSubmitted(true)
    } catch {
      setSubmitError('Erreur lors de la soumission. Veuillez reessayer.')
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Offre soumise avec succes</h1>
        <p className="mt-2 max-w-md text-center text-sm text-gray-500">
          Votre offre a ete chiffree, signee et deposee electroniquement.
          Vous recevrez un accuse de reception par email.
        </p>
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <span className="text-gray-500">Reference DAC :</span>
            <span className="font-mono text-gray-700">{dacId}</span>
            <span className="text-gray-500">Statut :</span>
            <span className="font-medium text-green-600">Deposee</span>
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <Link
            to="/mes-offres"
            className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
          >
            Voir mes offres
          </Link>
          <Link
            to="/appels"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Retour aux appels
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/appels" className="hover:text-teal-600 transition-colors">Appels</Link>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <Link to={`/appels/${dacId}`} className="hover:text-teal-600 transition-colors">
          {dacId}
        </Link>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="font-medium text-gray-900">Soumettre une offre</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Soumettre une offre</h1>
        <p className="mt-1 text-sm text-gray-500">
          Completez les etapes ci-dessous pour soumettre votre offre. Tous les documents doivent etre au format PDF ou JPEG.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => {
                    if (step.number < currentStep) setCurrentStep(step.number)
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    step.number < currentStep
                      ? 'bg-teal-600 text-white cursor-pointer'
                      : step.number === currentStep
                      ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step.number < currentStep ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </button>
                <span className={`mt-2 hidden text-xs font-medium lg:block ${
                  step.number <= currentStep ? 'text-teal-700' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`mx-2 h-0.5 w-8 lg:w-16 xl:w-24 ${
                  step.number < currentStep ? 'bg-teal-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Etape {currentStep} : {steps[currentStep - 1].title}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{steps[currentStep - 1].description}</p>
        </div>

        <div className="p-6">
          {/* Step 1: Administrative documents */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Documents requis</p>
                    <p className="mt-1 text-xs text-amber-700">
                      Formats acceptes : PDF, JPEG. Taille maximale par fichier : 10 Mo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Liste des pieces administratives requises :</h3>
                <ul className="space-y-1.5">
                  {adminDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>

              <FileUploadZone
                files={adminFiles}
                onAdd={() => handleFileAdd(setAdminFiles)}
                onRemove={(idx) => handleFileRemove(setAdminFiles, idx)}
              />
            </div>
          )}

          {/* Step 2: Technical offer */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Offre technique</p>
                    <p className="mt-1 text-xs text-blue-700">
                      Formats acceptes : PDF, JPEG. Joignez tous les documents techniques requis dans le DAC.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Documents techniques a fournir :</h3>
                <ul className="space-y-1.5">
                  {technicalDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>

              <FileUploadZone
                files={techFiles}
                onAdd={() => handleFileAdd(setTechFiles)}
                onRemove={(idx) => handleFileRemove(setTechFiles, idx)}
              />
            </div>
          )}

          {/* Step 3: Financial offer */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-800">Offre financiere</p>
                    <p className="mt-1 text-xs text-green-700">
                      Formats acceptes : PDF, JPEG. Les montants doivent etre en FCFA.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Documents financiers a fournir :</h3>
                <ul className="space-y-1.5">
                  {financialDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>

              <FileUploadZone
                files={financeFiles}
                onAdd={() => handleFileAdd(setFinanceFiles)}
                onRemove={(idx) => handleFileRemove(setFinanceFiles, idx)}
              />
            </div>
          )}

          {/* Step 4: Encryption & Signature */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 shrink-0 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-purple-800">Securisation de l'offre</p>
                    <p className="mt-1 text-xs text-purple-700">
                      Vos documents seront chiffres pour garantir la confidentialite de votre offre jusqu'a l'ouverture des plis.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                  <h3 className="text-sm font-semibold text-gray-900">Recapitulatif des documents</h3>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pieces administratives</span>
                      <span className="font-medium text-gray-900">{adminFiles.length} fichier(s)</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Offre technique</span>
                      <span className="font-medium text-gray-900">{techFiles.length} fichier(s)</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Offre financiere</span>
                      <span className="font-medium text-gray-900">{financeFiles.length} fichier(s)</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Signature electronique</h3>
                  <p className="text-sm text-gray-600">
                    En signant electroniquement, vous certifiez que toutes les informations fournies sont exactes
                    et que vous etes habilite a soumettre cette offre au nom de votre entreprise.
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signed}
                      onChange={(e) => setSigned(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">
                      Je certifie l'exactitude des informations et documents fournis et je signe
                      electroniquement cette offre au nom de <span className="font-semibold">{userFullName}</span>.
                    </span>
                  </label>
                </div>

                {signed && (
                  <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 p-4">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-800">Offre signee et chiffree</p>
                      <p className="text-xs text-green-600">Vos documents sont prets pour le depot.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 shrink-0 text-teal-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-teal-800">Verification finale</p>
                    <p className="mt-1 text-xs text-teal-700">
                      Verifiez les informations ci-dessous avant de deposer definitivement votre offre.
                    </p>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              <div className="rounded-lg border border-gray-200 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Recapitulatif de l'offre</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Reference DAC</p>
                    <p className="mt-1 text-sm font-mono font-semibold text-gray-900">{dacId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Soumissionnaire</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{userFullName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Pieces administratives</p>
                    <p className="mt-1 text-sm text-gray-700">{adminFiles.length} document(s) joint(s)</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Offre technique</p>
                    <p className="mt-1 text-sm text-gray-700">{techFiles.length} document(s) joint(s)</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Offre financiere</p>
                    <p className="mt-1 text-sm text-gray-700">{financeFiles.length} document(s) joint(s)</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Signature</p>
                    <p className="mt-1 text-sm font-medium text-green-600">Signee electroniquement</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800">Attention</p>
                    <p className="mt-1 text-xs text-red-700">
                      Une fois deposee, votre offre ne pourra plus etre modifiee. Assurez-vous que tous les
                      documents sont corrects avant de confirmer le depot.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              currentStep === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Etape precedente
          </button>

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                canProceed()
                  ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Etape suivante
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmitOffer}
              disabled={createSubmission.isPending}
              className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700 shadow-sm transition-colors disabled:opacity-50"
            >
              {createSubmission.isPending ? 'Depot en cours...' : 'Confirmer et deposer l\'offre'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---- File Upload Zone Component ---- */

function FileUploadZone({
  files,
  onAdd,
  onRemove,
}: {
  files: FileItem[]
  onAdd: () => void
  onRemove: (idx: number) => void
}) {
  return (
    <div className="space-y-4">
      {/* Upload area */}
      <button
        onClick={onAdd}
        className="flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
          <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">Cliquez pour ajouter des fichiers</p>
          <p className="mt-1 text-xs text-gray-500">Formats acceptes : PDF, JPEG - Taille max : 10 Mo par fichier</p>
        </div>
      </button>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-red-50">
                <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{file.type} - {file.size}</p>
              </div>
              <button
                onClick={() => onRemove(idx)}
                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
