import type { Node, Edge } from '@xyflow/react'

// ─── Node Types ──────────────────────────────────────────
export type WorkflowNodeType = 'START' | 'ACTION' | 'DECISION' | 'LOOP' | 'SYSTEM' | 'END'

export interface GuardExpression {
  field: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains' | 'regex'
  value: unknown
}

export interface WorkflowNodeData {
  code: string
  label: string
  nodeType: WorkflowNodeType
  isMandatory: boolean
  isLocked?: boolean
  assigneeRole?: string
  slaHours?: number
  triggers?: Record<string, unknown>
  config?: Record<string, unknown>
  articleRef?: string
}

// ─── Editor Mode ────────────────────────────────────────
export type EditorMode = 'template' | 'override' | 'standalone'

export type WorkflowFlowNode = Node<WorkflowNodeData, 'workflowNode'>

// ─── Edge / Transition ───────────────────────────────────
export interface WorkflowEdgeData {
  action: string
  label: string
  guardExpression?: GuardExpression | GuardExpression[]
  isMandatory: boolean
  requiresComment: boolean
  requiresSignature: boolean
  requiresAttachment: boolean
}

export type WorkflowFlowEdge = Edge<WorkflowEdgeData>

// ─── Validation ──────────────────────────────────────────
export interface ValidationError {
  id: string
  type: 'error' | 'warning'
  message: string
  nodeId?: string
  edgeId?: string
}

// ─── Simulation ──────────────────────────────────────────
export interface SimulationState {
  isActive: boolean
  currentNodeId: string | null
  visitedNodeIds: string[]
  visitedEdgeIds: string[]
  history: SimulationStep[]
}

export interface SimulationStep {
  fromNodeId: string
  toNodeId: string
  edgeId: string
  action: string
  timestamp: number
}

// ─── Editor State ────────────────────────────────────────
export interface EditorSelection {
  type: 'node' | 'edge' | null
  id: string | null
}

// ─── Available roles ─────────────────────────────────────
export const AVAILABLE_ROLES = [
  { value: 'ADMIN_SYSTEM', label: 'Administrateur système' },
  { value: 'DGCMP', label: 'DGCMP' },
  { value: 'AGENT_DGCMP', label: 'Agent DGCMP' },
  { value: 'PPM', label: 'PPM' },
  { value: 'AGENT_PPM', label: 'Agent PPM' },
  { value: 'DNCMP', label: 'DNCMP' },
  { value: 'MEMBRE_COMMISSION', label: 'Membre de commission' },
  { value: 'OPERATEUR_ECONOMIQUE', label: 'Opérateur économique' },
  { value: 'ARMP', label: 'ARMP' },
  { value: 'AGENT_ARMP', label: 'Agent ARMP' },
  { value: 'PUBLIC', label: 'Public' },
] as const

export const NODE_TYPE_META: Record<WorkflowNodeType, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  description: string
}> = {
  START: {
    label: 'Début',
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#059669',
    icon: '▶',
    description: 'Point de départ du workflow',
  },
  ACTION: {
    label: 'Action',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#2563eb',
    icon: '⚡',
    description: 'Étape nécessitant une action humaine',
  },
  DECISION: {
    label: 'Décision',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#d97706',
    icon: '◇',
    description: 'Point de branchement conditionnel',
  },
  LOOP: {
    label: 'Boucle',
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#ea580c',
    icon: '↻',
    description: 'Nœud de retour (révision, correction)',
  },
  SYSTEM: {
    label: 'Système',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#7c3aed',
    icon: '⚙',
    description: 'Action automatique du système',
  },
  END: {
    label: 'Fin',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#dc2626',
    icon: '■',
    description: 'Point de terminaison du workflow',
  },
}

export const GUARD_OPERATORS = [
  { value: 'eq', label: '= (égal)' },
  { value: 'neq', label: '≠ (différent)' },
  { value: 'gt', label: '> (supérieur)' },
  { value: 'gte', label: '≥ (supérieur ou égal)' },
  { value: 'lt', label: '< (inférieur)' },
  { value: 'lte', label: '≤ (inférieur ou égal)' },
  { value: 'in', label: '∈ (dans la liste)' },
  { value: 'not_in', label: '∉ (pas dans la liste)' },
  { value: 'contains', label: '⊃ (contient)' },
  { value: 'regex', label: '~ (expression régulière)' },
] as const
