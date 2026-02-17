import { useState, useRef } from 'react'
import type { ValidationError, EditorMode } from '../../types'

interface EditorToolbarProps {
  validationErrors: ValidationError[]
  simulationActive: boolean
  workflowName?: string | null
  editorMode?: EditorMode
  organisationName?: string | null
  onBack?: () => void
  onExportYaml: () => void
  onImportYaml: (yaml: string) => void
  onAutoLayout: () => void
  onStartSimulation: () => void
  onStopSimulation: () => void
  onSave: () => void
}

export default function EditorToolbar({
  validationErrors,
  simulationActive,
  workflowName,
  editorMode = 'standalone',
  organisationName,
  onBack,
  onExportYaml,
  onImportYaml,
  onAutoLayout,
  onStartSimulation,
  onStopSimulation,
  onSave,
}: EditorToolbarProps) {
  const [showErrors, setShowErrors] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const errorCount = validationErrors.filter((e) => e.type === 'error').length
  const warningCount = validationErrors.filter((e) => e.type === 'warning').length

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target?.result as string
      if (content) {
        onImportYaml(content)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const saveLabel =
    editorMode === 'template' ? 'Publier template' : 'Enregistrer'

  return (
    <div className="relative">
      <div className="h-12 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span>&larr;</span>
              <span>Catalogue</span>
            </button>
          )}
          <h2 className="text-sm font-bold text-gray-800">
            {workflowName ?? 'Éditeur de workflow'}
          </h2>

          {/* Mode badge */}
          {editorMode === 'template' && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-100 text-purple-700">
              Template
            </span>
          )}
          {editorMode === 'override' && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-700">
              Override{organisationName ? ` — ${organisationName}` : ''}
            </span>
          )}

          {/* Validation badge */}
          <button
            onClick={() => setShowErrors(!showErrors)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors
              ${errorCount > 0
                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                : warningCount > 0
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }
            `}
          >
            {errorCount > 0 ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {errorCount} erreur{errorCount > 1 ? 's' : ''}
                {warningCount > 0 && `, ${warningCount} avert.`}
              </>
            ) : warningCount > 0 ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {warningCount} avertissement{warningCount > 1 ? 's' : ''}
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Valide
              </>
            )}
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {simulationActive ? (
            <button
              onClick={onStopSimulation}
              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              Arrêter simulation
            </button>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".yaml,.yml"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={handleImportClick}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Importer YAML
              </button>
              <button
                onClick={onExportYaml}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Exporter YAML
              </button>
              <button
                onClick={onAutoLayout}
                className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                Réorganiser
              </button>
              <button
                onClick={onStartSimulation}
                className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                Simuler
              </button>
              <button
                onClick={onSave}
                disabled={errorCount > 0}
                className={`
                  px-4 py-1.5 text-xs font-medium rounded-lg transition-colors
                  ${errorCount > 0
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-white bg-[#1e3a5f] hover:bg-[#162d4a]'
                  }
                `}
              >
                {saveLabel}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Validation errors dropdown */}
      {showErrors && validationErrors.length > 0 && (
        <div className="absolute top-12 left-4 z-50 w-96 max-h-64 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">
              Problèmes de validation
            </span>
            <button
              onClick={() => setShowErrors(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              &times;
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {validationErrors.map((err) => (
              <div key={err.id} className="px-3 py-2 flex items-start gap-2">
                <span
                  className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    err.type === 'error' ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                />
                <span className="text-xs text-gray-600">{err.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
