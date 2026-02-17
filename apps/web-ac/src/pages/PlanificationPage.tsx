import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForecastPlans, useUploadPPM, useAuth, LoadingSpinner, QueryError } from '@eproc/api-client'

const statutColors: Record<string, string> = {
  'BROUILLON': 'bg-gray-100 text-gray-700',
  'draft': 'bg-gray-100 text-gray-700',
  'SOUMIS': 'bg-blue-100 text-blue-700',
  'submitted': 'bg-blue-100 text-blue-700',
  'VALIDE': 'bg-emerald-100 text-emerald-700',
  'validated': 'bg-emerald-100 text-emerald-700',
  'PUBLIE': 'bg-green-100 text-green-800',
  'published': 'bg-green-100 text-green-800',
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    BROUILLON: 'Brouillon',
    draft: 'Brouillon',
    SOUMIS: 'Soumis',
    submitted: 'Soumis',
    VALIDE: 'Valide',
    validated: 'Valide',
    PUBLIE: 'Publie',
    published: 'Publie',
  }
  return map[status] || status
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount) + ' FCFA'
}

export default function PlanificationPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data, isLoading, isError, refetch } = useForecastPlans()
  const uploadMutation = useUploadPPM()

  const [showModal, setShowModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear())
  const [dragOver, setDragOver] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const plans = data?.data ?? []
  const meta = data?.meta

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    setUploadError(null)
    // Try to detect fiscal year from filename
    const match = file.name.match(/(\d{4})/)
    if (match) {
      setFiscalYear(parseInt(match[1], 10))
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.xlsx')) {
      handleFileSelect(file)
    } else {
      setUploadError('Seuls les fichiers .xlsx sont acceptes')
    }
  }, [handleFileSelect])

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploadError(null)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('fiscalYear', String(fiscalYear))
    if (user?.organization?.name) {
      formData.append('organizationName', user.organization.name)
    }

    try {
      const result = await uploadMutation.mutateAsync(formData)
      setShowModal(false)
      setSelectedFile(null)
      if (result?.id) {
        navigate(`/planification/${result.id}`)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setUploadError(msg || 'Erreur lors de l\'import du fichier')
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plans previsionnels de passation</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerez les plans previsionnels de passation des marches publics
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
            <h1 className="text-2xl font-bold text-gray-900">Plans previsionnels de passation</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerez les plans previsionnels de passation des marches publics
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
          <h1 className="text-2xl font-bold text-gray-900">Plans previsionnels de passation</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerez les plans previsionnels de passation des marches publics
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#1e3a5f] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2a4d7a] transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Importer un PPM
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Exercice</label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Statut</label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous</option>
              <option value="brouillon">Brouillon</option>
              <option value="soumis">Soumis</option>
              <option value="valide">Valide</option>
              <option value="publie">Publie</option>
            </select>
          </div>
        </div>
      </div>

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
                  Exercice
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Montant Total
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nombre de lignes
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    Aucun plan previsionnel trouve. Cliquez sur "Importer un PPM" pour commencer.
                  </td>
                </tr>
              ) : (
                plans.map((plan: Record<string, unknown>) => {
                  const status = String(plan.status || 'BROUILLON')
                  const reference = String(plan.reference || '')
                  const exercice = String(plan.fiscalYear || '')
                  const version = Number(plan.version || 1)
                  const totalAmount = Number(plan.totalAmount || 0)
                  const entryCount = (plan._count as Record<string, number>)?.entries ?? 0
                  return (
                    <tr
                      key={String(plan.id)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/planification/${plan.id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{reference}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{exercice}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">V{version}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statutColors[status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {formatStatus(status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatAmount(totalAmount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{entryCount}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/planification/${plan.id}`) }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Voir
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            Affichage de <span className="font-medium">1</span> a{' '}
            <span className="font-medium">{plans.length}</span> sur{' '}
            <span className="font-medium">{meta?.total ?? plans.length}</span> resultats
          </p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50">
              Precedent
            </button>
            <button className="px-3 py-1.5 text-sm border border-blue-500 rounded-lg bg-blue-500 text-white">
              1
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Importer un PPM</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Dropzone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
              {selectedFile ? (
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / 1024).toFixed(1)} Ko
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                    className="text-xs text-red-500 hover:text-red-700 mt-2"
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    Glissez-deposez votre fichier PPM ici
                  </p>
                  <p className="text-xs text-gray-400 mt-1">ou cliquez pour parcourir (format .xlsx)</p>
                </div>
              )}
            </div>

            {/* Fiscal Year */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exercice budgetaire
              </label>
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(parseInt(e.target.value, 10))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
              </select>
            </div>

            {/* Error */}
            {uploadError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{uploadError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#2a4d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Import en cours...
                  </>
                ) : (
                  'Importer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
