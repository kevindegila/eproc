import * as yaml from 'js-yaml'
import type { WorkflowFlowNode, WorkflowFlowEdge, GuardExpression } from '../types'

interface YamlNode {
  code: string
  label: string
  type: string
  mandatory?: boolean
  assignee_role?: string
  sla_hours?: number
  position_x?: number
  position_y?: number
  triggers?: Record<string, unknown>
  config?: Record<string, unknown>
}

interface YamlTransition {
  from: string
  to: string
  action: string
  label: string
  guard?: GuardExpression | GuardExpression[]
  mandatory?: boolean
  requires_comment?: boolean
  requires_signature?: boolean
  requires_attachment?: boolean
}

export function exportToYaml(nodes: WorkflowFlowNode[], edges: WorkflowFlowEdge[]): string {
  const codeMap = new Map<string, string>()
  for (const node of nodes) {
    codeMap.set(node.id, node.data.code)
  }

  const yamlNodes: YamlNode[] = nodes.map((node) => {
    const n: YamlNode = {
      code: node.data.code,
      label: node.data.label,
      type: node.data.nodeType,
    }
    if (node.data.isMandatory) n.mandatory = true
    if (node.data.assigneeRole) n.assignee_role = node.data.assigneeRole
    if (node.data.slaHours) n.sla_hours = node.data.slaHours
    if (node.position) {
      n.position_x = Math.round(node.position.x)
      n.position_y = Math.round(node.position.y)
    }
    if (node.data.triggers && Object.keys(node.data.triggers).length > 0) {
      n.triggers = node.data.triggers
    }
    if (node.data.config && Object.keys(node.data.config).length > 0) {
      n.config = node.data.config
    }
    return n
  })

  const yamlTransitions: YamlTransition[] = edges.map((edge) => {
    const t: YamlTransition = {
      from: codeMap.get(edge.source) ?? edge.source,
      to: codeMap.get(edge.target) ?? edge.target,
      action: edge.data?.action ?? 'ACTION',
      label: edge.data?.label ?? edge.label ?? '',
    }
    if (edge.data?.guardExpression) t.guard = edge.data.guardExpression
    if (edge.data?.isMandatory) t.mandatory = true
    if (edge.data?.requiresComment) t.requires_comment = true
    if (edge.data?.requiresSignature) t.requires_signature = true
    if (edge.data?.requiresAttachment) t.requires_attachment = true
    return t
  })

  return yaml.dump(
    { nodes: yamlNodes, transitions: yamlTransitions },
    { lineWidth: 120, noRefs: true, sortKeys: false },
  )
}

export function importFromYaml(yamlContent: string): {
  nodes: WorkflowFlowNode[]
  edges: WorkflowFlowEdge[]
} {
  const parsed = yaml.load(yamlContent) as {
    nodes: YamlNode[]
    transitions: YamlTransition[]
  }

  if (!parsed?.nodes || !parsed?.transitions) {
    throw new Error('YAML invalide : les clés "nodes" et "transitions" sont requises')
  }

  const codeToId = new Map<string, string>()

  const nodes: WorkflowFlowNode[] = parsed.nodes.map((n, i) => {
    const id = `node-${n.code.toLowerCase()}-${Date.now()}-${i}`
    codeToId.set(n.code, id)
    return {
      id,
      type: 'workflowNode',
      position: {
        x: n.position_x ?? i * 200,
        y: n.position_y ?? 200,
      },
      data: {
        code: n.code,
        label: n.label,
        nodeType: n.type as WorkflowFlowNode['data']['nodeType'],
        isMandatory: n.mandatory ?? false,
        assigneeRole: n.assignee_role,
        slaHours: n.sla_hours,
        triggers: n.triggers,
        config: n.config,
      },
    }
  })

  const edges: WorkflowFlowEdge[] = parsed.transitions.map((t, i) => ({
    id: `edge-${i}-${Date.now()}`,
    source: codeToId.get(t.from) ?? t.from,
    target: codeToId.get(t.to) ?? t.to,
    type: 'workflowEdge',
    data: {
      action: t.action,
      label: t.label,
      guardExpression: t.guard,
      isMandatory: t.mandatory ?? false,
      requiresComment: t.requires_comment ?? false,
      requiresSignature: t.requires_signature ?? false,
      requiresAttachment: t.requires_attachment ?? false,
    },
  }))

  return { nodes, edges }
}
