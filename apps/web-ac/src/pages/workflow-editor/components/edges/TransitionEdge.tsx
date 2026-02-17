import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react'
import type { WorkflowEdgeData, GuardExpression } from '../../types'

// ─── Semantic edge coloring ─────────────────────────────
const ACTION_COLORS: Record<string, { stroke: string; bg: string; text: string }> = {}

const COLOR_MAP: Array<{ keywords: string[]; stroke: string; bg: string; text: string }> = [
  {
    keywords: ['VALIDER', 'APPROUVER', 'RECEVABLE', 'AUCUN_RECOURS', 'CORRIGER'],
    stroke: '#059669', bg: 'bg-green-50', text: 'text-green-700',
  },
  {
    keywords: ['REJETER', 'IRRECEVABLE', 'DECLARER_INFRUCTUEUX', 'REJETER_DEFINITIF'],
    stroke: '#dc2626', bg: 'bg-red-50', text: 'text-red-700',
  },
  {
    keywords: ['RESOUMETTRE', 'REVISER', 'REPONDRE', 'RECOURS_ACCEPTE'],
    stroke: '#d97706', bg: 'bg-amber-50', text: 'text-amber-700',
  },
  {
    keywords: ['SOUMETTRE', 'DEMARRER', 'EVALUER', 'TRANSMETTRE', 'DEPOSER'],
    stroke: '#2563eb', bg: 'bg-blue-50', text: 'text-blue-700',
  },
]

for (const entry of COLOR_MAP) {
  for (const kw of entry.keywords) {
    ACTION_COLORS[kw] = { stroke: entry.stroke, bg: entry.bg, text: entry.text }
  }
}

const DEFAULT_COLOR = { stroke: '#64748b', bg: 'bg-gray-100', text: 'text-gray-500' }

function getEdgeColor(action: string | undefined) {
  if (!action) return DEFAULT_COLOR
  const upper = action.trim().toUpperCase()
  return ACTION_COLORS[upper] ?? DEFAULT_COLOR
}

// ─── Guard expression formatting ────────────────────────
const OPERATOR_SYMBOLS: Record<string, string> = {
  eq: '=', neq: '\u2260', gt: '>', gte: '\u2265', lt: '<', lte: '\u2264',
  in: '\u2208', not_in: '\u2209', contains: '\u2283', regex: '~',
}

function formatGuard(guard: GuardExpression): string {
  const op = OPERATOR_SYMBOLS[guard.operator] ?? guard.operator
  const val = Array.isArray(guard.value)
    ? `[${(guard.value as unknown[]).join(', ')}]`
    : String(guard.value)
  return `${guard.field} ${op} ${val}`
}

function formatGuards(guards: GuardExpression | GuardExpression[] | undefined): string | null {
  if (!guards) return null
  if (Array.isArray(guards)) {
    if (guards.length === 0) return null
    return guards.map(formatGuard).join(' & ')
  }
  return formatGuard(guards)
}

// ─── Edge component ─────────────────────────────────────
export default function TransitionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps & { data?: WorkflowEdgeData }) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  })

  const actionLabel = data?.action?.trim()
  const color = getEdgeColor(actionLabel)
  const guardText = formatGuards(data?.guardExpression)

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? '#2563eb' : color.stroke,
          strokeWidth: selected ? 2 : 1.5,
          strokeDasharray: data?.isMandatory ? undefined : '5 3',
        }}
      />
      {actionLabel && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-auto"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            <span
              className={`
                inline-block px-1.5 py-0.5 rounded text-[9px] font-medium cursor-pointer
                transition-all whitespace-nowrap
                ${selected
                  ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                  : `${color.bg} ${color.text} hover:opacity-80`
                }
              `}
            >
              {actionLabel}
            </span>
            {guardText && (
              <div
                className="text-[8px] text-gray-400 italic text-center mt-0.5 whitespace-nowrap"
              >
                {guardText}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
