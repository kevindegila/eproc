import type { WorkflowFlowNode, WorkflowNodeData, WorkflowNodeType, EditorMode } from '../../types'
import { AVAILABLE_ROLES, NODE_TYPE_META } from '../../types'

interface NodeEditorPanelProps {
  node: WorkflowFlowNode
  editorMode?: EditorMode
  onUpdate: (data: Partial<WorkflowNodeData>) => void
  onDelete: () => void
  onClose: () => void
}

export default function NodeEditorPanel({
  node,
  editorMode = 'standalone',
  onUpdate,
  onDelete,
  onClose,
}: NodeEditorPanelProps) {
  const { data } = node
  const meta = NODE_TYPE_META[data.nodeType]
  const isStartOrEnd = data.nodeType === 'START' || data.nodeType === 'END'
  const isLockedInOverride = editorMode === 'override' && data.isLocked

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded flex items-center justify-center text-sm"
            style={{ backgroundColor: meta.bgColor, color: meta.color }}
          >
            {meta.icon}
          </span>
          <h3 className="text-sm font-semibold text-gray-800">
            {meta.label}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          &times;
        </button>
      </div>

      {/* Locked banner */}
      {isLockedInOverride && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 flex-shrink-0">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-[11px] text-gray-500 font-medium">
            Ce noeud est verrouillé (contrôle)
          </span>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Code */}
        <fieldset disabled={isLockedInOverride}>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Code technique
          </label>
          <input
            type="text"
            value={data.code}
            onChange={(e) => onUpdate({ code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })}
            className={`w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${isLockedInOverride ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
            placeholder="CODE_UNIQUE"
          />
        </fieldset>

        {/* Label */}
        <fieldset disabled={isLockedInOverride}>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Libellé
          </label>
          <input
            type="text"
            value={data.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className={`w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${isLockedInOverride ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
            placeholder="Nom de l'étape"
          />
        </fieldset>

        {/* Mandatory toggle */}
        <fieldset disabled={isLockedInOverride}>
          <label className={`flex items-center gap-2 ${isLockedInOverride ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={data.isMandatory}
              onChange={(e) => onUpdate({ isMandatory: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-700">Obligatoire (non supprimable)</span>
          </label>
        </fieldset>

        {/* Role selector - not for START/END */}
        {!isStartOrEnd && (
          <fieldset disabled={isLockedInOverride}>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Rôle assigné
            </label>
            <select
              value={data.assigneeRole ?? ''}
              onChange={(e) => onUpdate({ assigneeRole: e.target.value || undefined })}
              className={`w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white ${isLockedInOverride ? '!bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
            >
              <option value="">Aucun rôle</option>
              {AVAILABLE_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </fieldset>
        )}

        {/* SLA Hours - not for START/END */}
        {!isStartOrEnd && (
          <fieldset disabled={isLockedInOverride}>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Délai SLA (heures)
            </label>
            <input
              type="number"
              min={0}
              value={data.slaHours ?? ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value, 10) : undefined
                onUpdate({ slaHours: val })
              }}
              className={`w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${isLockedInOverride ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
              placeholder="Ex: 48"
            />
          </fieldset>
        )}

        {/* Article reference */}
        <fieldset disabled={isLockedInOverride}>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Référence article
          </label>
          <input
            type="text"
            value={data.articleRef ?? ''}
            onChange={(e) => onUpdate({ articleRef: e.target.value || undefined })}
            className={`w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${isLockedInOverride ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
            placeholder="Art. 42 du Décret"
          />
        </fieldset>

        {/* Triggers - not for START/END */}
        {!isStartOrEnd && (
          <fieldset disabled={isLockedInOverride}>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Déclencheurs
            </label>
            <div className="space-y-1.5">
              <label className={`flex items-center gap-2 ${isLockedInOverride ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={!!data.triggers?.notification}
                  onChange={(e) =>
                    onUpdate({
                      triggers: { ...data.triggers, notification: e.target.checked || undefined },
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-700">Notification</span>
              </label>
              <label className={`flex items-center gap-2 ${isLockedInOverride ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={!!data.triggers?.cascade_workflow}
                  onChange={(e) =>
                    onUpdate({
                      triggers: {
                        ...data.triggers,
                        cascade_workflow: e.target.checked || undefined,
                      },
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-700">Cascade workflow</span>
              </label>
            </div>
          </fieldset>
        )}

        {/* Description / Config */}
        {!isStartOrEnd && (
          <fieldset disabled={isLockedInOverride}>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={(data.config?.description as string) ?? ''}
              onChange={(e) =>
                onUpdate({
                  config: { ...data.config, description: e.target.value || undefined },
                })
              }
              className={`w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none ${isLockedInOverride ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
              placeholder="Description de cette étape..."
            />
          </fieldset>
        )}
      </div>

      {/* Footer */}
      {!data.isMandatory && !isLockedInOverride && (
        <div className="px-4 py-3 border-t border-gray-100">
          <button
            onClick={onDelete}
            className="w-full px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Supprimer ce noeud
          </button>
        </div>
      )}
    </div>
  )
}
