import { useRef, useState } from 'react'
import type { StagedDocument, DocumentCategory } from './types'

interface Props {
  stagedDocuments: StagedDocument[]
  setStagedDocuments: React.Dispatch<React.SetStateAction<StagedDocument[]>>
  requiredDocuments: DocumentCategory[]
  setRequiredDocuments: React.Dispatch<React.SetStateAction<DocumentCategory[]>>
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export default function StepDocuments({
  stagedDocuments,
  setStagedDocuments,
  requiredDocuments,
  setRequiredDocuments,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const categoryFileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)
  const [isAddingCustom, setIsAddingCustom] = useState(false)
  const [newCustomLabel, setNewCustomLabel] = useState('')

  // Build category labels from the requiredDocuments list
  const categoryLabels: Record<string, string> = { AUTRE: 'Autre document' }
  requiredDocuments.forEach((d) => { categoryLabels[d.code] = d.label })

  // Categories available in the dropdown = all required + AUTRE
  const dropdownCategories = [
    ...requiredDocuments.map((d) => d.code),
    'AUTRE',
  ]

  const addFiles = (files: FileList | File[], category = 'AUTRE') => {
    const newDocs: StagedDocument[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      category,
      status: 'pending',
    }))
    setStagedDocuments((prev) => [...prev, ...newDocs])
  }

  const removeDocument = (id: string) => {
    setStagedDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  const updateCategory = (id: string, category: string) => {
    setStagedDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, category } : d)),
    )
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  const handleChecklistClick = (categoryCode: string) => {
    setPendingCategory(categoryCode)
    categoryFileInputRef.current?.click()
  }

  const handleCategoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && pendingCategory) {
      addFiles(e.target.files, pendingCategory)
      e.target.value = ''
    }
    setPendingCategory(null)
  }

  const handleAddCustomCategory = () => {
    const label = newCustomLabel.trim()
    if (!label) return
    const code = 'CUSTOM_' + label.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 30)
    if (requiredDocuments.some((d) => d.code === code || d.label === label)) return
    setRequiredDocuments((prev) => [...prev, { code, label }])
    setNewCustomLabel('')
    setIsAddingCustom(false)
  }

  const removeRequiredDocument = (code: string) => {
    setRequiredDocuments((prev) => prev.filter((d) => d.code !== code))
    // Reassign staged files of this category to AUTRE
    setStagedDocuments((prev) =>
      prev.map((d) => (d.category === code ? { ...d, category: 'AUTRE' } : d)),
    )
  }

  const coveredCategories = new Set(stagedDocuments.map((d) => d.category))

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Etape 3 : Documents</h2>

      {/* Hidden file input for category-specific upload */}
      <input
        ref={categoryFileInputRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        onChange={handleCategoryFileChange}
      />

      <div className="space-y-6">
        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <div className="text-4xl text-gray-400 mb-3">{'\uD83D\uDCC4'}</div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Glissez-deposez vos fichiers ici
          </p>
          <p className="text-xs text-gray-500 mb-4">ou</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-sm font-medium text-[#1e3a5f] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Parcourir les fichiers
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                addFiles(e.target.files)
                e.target.value = ''
              }
            }}
          />
          <p className="text-xs text-gray-400 mt-3">PDF, DOC, DOCX, XLS, XLSX - Max 50 Mo par fichier</p>
        </div>

        {/* Staged documents list */}
        {stagedDocuments.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
              Fichiers selectionnes ({stagedDocuments.length})
            </h3>
            <div className="space-y-2">
              {stagedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-lg text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{doc.file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(doc.file.size)}</p>
                  </div>
                  <select
                    value={doc.category}
                    onChange={(e) => updateCategory(doc.id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {dropdownCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents checklist — fully editable */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Documents attendus
            </h3>
            <span className="text-xs text-gray-400">{requiredDocuments.length} type{requiredDocuments.length > 1 ? 's' : ''}</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Cliquez sur une ligne pour ajouter un fichier. Supprimez les types non pertinents avec la croix.
          </p>
          <div className="space-y-2">
            {requiredDocuments.map((entry) => {
              const isCovered = coveredCategories.has(entry.code)
              const isLoading = pendingCategory === entry.code
              return (
                <div
                  key={entry.code}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all group ${
                    isCovered
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                    onClick={() => handleChecklistClick(entry.code)}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center text-xs transition-colors ${
                      isCovered
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-gray-300 text-transparent group-hover:border-blue-400'
                    }`}>
                      {'\u2713'}
                    </div>
                    <span className={`text-sm truncate ${isCovered ? 'text-emerald-900 font-medium' : 'text-gray-700'}`}>
                      {entry.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                    {isLoading ? (
                      <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : isCovered ? (
                      <span
                        className="text-xs text-emerald-600 font-medium cursor-pointer hover:underline"
                        onClick={() => handleChecklistClick(entry.code)}
                      >Ajoute</span>
                    ) : (
                      <span
                        className="text-xs text-gray-400 group-hover:text-blue-600 font-medium flex items-center gap-1 cursor-pointer"
                        onClick={() => handleChecklistClick(entry.code)}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Ajouter
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeRequiredDocument(entry.code)
                      }}
                      className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
                      title="Retirer ce type de document"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Add custom document type */}
            {isAddingCustom ? (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <input
                  type="text"
                  autoFocus
                  value={newCustomLabel}
                  onChange={(e) => setNewCustomLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCustomCategory()
                    if (e.key === 'Escape') { setIsAddingCustom(false); setNewCustomLabel('') }
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du type de document (ex: Attestation fiscale)"
                />
                <button
                  onClick={handleAddCustomCategory}
                  disabled={!newCustomLabel.trim()}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#2a4d7a] transition-colors disabled:opacity-40"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => { setIsAddingCustom(false); setNewCustomLabel('') }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCustom(true)}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Ajouter un autre type de document
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
