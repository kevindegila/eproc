import { useState } from 'react'
import type {
  WorkflowFlowEdge,
  WorkflowFlowNode,
  WorkflowEdgeData,
  GuardExpression,
} from '../../types'
import { GUARD_OPERATORS } from '../../types'

interface TransitionEditorPanelProps {
  edge: WorkflowFlowEdge
  nodes: WorkflowFlowNode[]
  onUpdate: (data: Partial<WorkflowEdgeData>) => void
  onDelete: () => void
  onClose: () => void
}

function GuardEditor({
  guards,
  onChange,
}: {
  guards: GuardExpression[]
  onChange: (guards: GuardExpression[]) => void
}) {
  const addGuard = () => {
    onChange([...guards, { field: '', operator: 'eq', value: '' }])
  }

  const updateGuard = (index: number, patch: Partial<GuardExpression>) => {
    const updated = guards.map((g, i) => (i === index ? { ...g, ...patch } : g))
    onChange(updated)
  }

  const removeGuard = (index: number) => {
    onChange(guards.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {guards.map((guard, i) => (
        <div key={i} className="p-2 bg-gray-50 rounded-lg border border-gray-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-gray-400 uppercase">
              Condition {i + 1}
            </span>
            <button
              onClick={() => removeGuard(i)}
              className="text-gray-400 hover:text-red-500 text-xs"
            >
              &times;
            </button>
          </div>
          <input
            type="text"
            value={guard.field}
            onChange={(e) => updateGuard(i, { field: e.target.value })}
            placeholder="champ (ex: montant)"
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <select
            value={guard.operator}
            onChange={(e) =>
              updateGuard(i, { operator: e.target.value as GuardExpression['operator'] })
            }
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          >
            {GUARD_OPERATORS.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={String(guard.value ?? '')}
            onChange={(e) => updateGuard(i, { value: e.target.value })}
            placeholder="valeur"
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      ))}
      <button
        onClick={addGuard}
        className="w-full px-2 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        + Ajouter une condition
      </button>
    </div>
  )
}

export default function TransitionEditorPanel({
  edge,
  nodes,
  onUpdate,
  onDelete,
  onClose,
}: TransitionEditorPanelProps) {
  const { data } = edge
  const sourceNode = nodes.find((n) => n.id === edge.source)
  const targetNode = nodes.find((n) => n.id === edge.target)

  const guards: GuardExpression[] = data?.guardExpression
    ? Array.isArray(data.guardExpression)
      ? data.guardExpression
      : [data.guardExpression]
    : []

  const [showGuards, setShowGuards] = useState(guards.length > 0)

  const handleGuardsChange = (newGuards: GuardExpression[]) => {
    if (newGuards.length === 0) {
      onUpdate({ guardExpression: undefined })
    } else if (newGuards.length === 1) {
      onUpdate({ guardExpression: newGuards[0] })
    } else {
      onUpdate({ guardExpression: newGuards })
    }
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Transition</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          &times;
        </button>
      </div>

      {/* Route info */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span className="font-medium text-gray-700">{sourceNode?.data.label ?? '?'}</span>
          <span>&rarr;</span>
          <span className="font-medium text-gray-700">{targetNode?.data.label ?? '?'}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Action */}
        <fieldset>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Action (code)
          </label>
          <input
            type="text"
            value={data?.action ?? ''}
            onChange={(e) =>
              onUpdate({ action: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })
            }
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            placeholder="VALIDER, REJETER..."
          />
        </fieldset>

        {/* Label */}
        <fieldset>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Libellé
          </label>
          <input
            type="text"
            value={data?.label ?? ''}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            placeholder="Description de la transition"
          />
        </fieldset>

        {/* Mandatory */}
        <fieldset>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data?.isMandatory ?? false}
              onChange={(e) => onUpdate({ isMandatory: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-700">Transition obligatoire</span>
          </label>
        </fieldset>

        {/* Requirements */}
        <fieldset>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Exigences
          </label>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data?.requiresComment ?? false}
                onChange={(e) => onUpdate({ requiresComment: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700">Commentaire requis</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data?.requiresSignature ?? false}
                onChange={(e) => onUpdate({ requiresSignature: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700">Signature requise</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data?.requiresAttachment ?? false}
                onChange={(e) => onUpdate({ requiresAttachment: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700">Pièce jointe requise</span>
            </label>
          </div>
        </fieldset>

        {/* Guard expressions */}
        <fieldset>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-gray-500">
              Conditions (guards)
            </label>
            <button
              onClick={() => setShowGuards(!showGuards)}
              className="text-[10px] text-blue-600 hover:text-blue-800"
            >
              {showGuards ? 'Masquer' : 'Afficher'}
            </button>
          </div>
          {showGuards && (
            <GuardEditor guards={guards} onChange={handleGuardsChange} />
          )}
        </fieldset>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <button
          onClick={onDelete}
          className="w-full px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          Supprimer cette transition
        </button>
      </div>
    </div>
  )
}
