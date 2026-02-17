import type { WorkflowFlowNode, WorkflowFlowEdge, ValidationError } from '../types'

export function validateWorkflow(
  nodes: WorkflowFlowNode[],
  edges: WorkflowFlowEdge[],
): ValidationError[] {
  const errors: ValidationError[] = []
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  // 1. Must have exactly one START
  const startNodes = nodes.filter((n) => n.data.nodeType === 'START')
  if (startNodes.length === 0) {
    errors.push({
      id: 'no-start',
      type: 'error',
      message: 'Le workflow doit contenir un nœud de Début',
    })
  } else if (startNodes.length > 1) {
    errors.push({
      id: 'multi-start',
      type: 'error',
      message: 'Le workflow ne peut contenir qu\'un seul nœud de Début',
    })
  }

  // 2. Must have at least one END
  const endNodes = nodes.filter((n) => n.data.nodeType === 'END')
  if (endNodes.length === 0) {
    errors.push({
      id: 'no-end',
      type: 'error',
      message: 'Le workflow doit contenir au moins un nœud de Fin',
    })
  }

  // 3. No transitions from END nodes
  for (const edge of edges) {
    const sourceNode = nodeMap.get(edge.source)
    if (sourceNode?.data.nodeType === 'END') {
      errors.push({
        id: `end-outgoing-${edge.id}`,
        type: 'error',
        message: `Le nœud de fin "${sourceNode.data.label}" ne peut pas avoir de transition sortante`,
        nodeId: edge.source,
        edgeId: edge.id,
      })
    }
  }

  // 4. START must have at least one outgoing transition
  for (const start of startNodes) {
    const outgoing = edges.filter((e) => e.source === start.id)
    if (outgoing.length === 0) {
      errors.push({
        id: `start-no-outgoing-${start.id}`,
        type: 'error',
        message: 'Le nœud de Début doit avoir au moins une transition sortante',
        nodeId: start.id,
      })
    }
  }

  // 5. Orphan nodes (no incoming AND no outgoing edges, except START)
  for (const node of nodes) {
    if (node.data.nodeType === 'START') continue
    const hasIncoming = edges.some((e) => e.target === node.id)
    const hasOutgoing = edges.some((e) => e.source === node.id)
    if (!hasIncoming && !hasOutgoing) {
      errors.push({
        id: `orphan-${node.id}`,
        type: 'error',
        message: `Le nœud "${node.data.label}" est isolé (aucune transition)`,
        nodeId: node.id,
      })
    } else if (!hasIncoming && node.data.nodeType !== 'START') {
      errors.push({
        id: `no-incoming-${node.id}`,
        type: 'warning',
        message: `Le nœud "${node.data.label}" n'a pas de transition entrante`,
        nodeId: node.id,
      })
    }
  }

  // 6. END nodes should not have outgoing transitions (already covered above)
  //    but END nodes with no incoming is an orphan END
  for (const endNode of endNodes) {
    const hasIncoming = edges.some((e) => e.target === endNode.id)
    if (!hasIncoming) {
      errors.push({
        id: `end-orphan-${endNode.id}`,
        type: 'error',
        message: `Le nœud de fin "${endNode.data.label}" est orphelin (aucune transition entrante)`,
        nodeId: endNode.id,
      })
    }
  }

  // 7. Circular paths without a LOOP node
  const loopNodeIds = new Set(
    nodes.filter((n) => n.data.nodeType === 'LOOP').map((n) => n.id),
  )
  for (const edge of edges) {
    const targetNode = nodeMap.get(edge.target)
    const sourceNode = nodeMap.get(edge.source)
    if (!targetNode || !sourceNode) continue

    // If this edge goes "backwards" (to a node earlier in the flow)
    // and doesn't pass through a LOOP node, warn
    if (
      edge.target === edge.source &&
      !loopNodeIds.has(edge.source) &&
      !loopNodeIds.has(edge.target)
    ) {
      errors.push({
        id: `self-loop-${edge.id}`,
        type: 'warning',
        message: `Transition circulaire sur "${sourceNode.data.label}" sans nœud Boucle`,
        edgeId: edge.id,
      })
    }
  }

  // 8. Duplicate node codes
  const codeCounts = new Map<string, number>()
  for (const node of nodes) {
    codeCounts.set(node.data.code, (codeCounts.get(node.data.code) ?? 0) + 1)
  }
  for (const [code, count] of codeCounts) {
    if (count > 1) {
      errors.push({
        id: `dup-code-${code}`,
        type: 'error',
        message: `Le code "${code}" est utilisé par ${count} nœuds (doit être unique)`,
      })
    }
  }

  // 9. Empty action on edges
  for (const edge of edges) {
    if (!edge.data?.action?.trim()) {
      errors.push({
        id: `no-action-${edge.id}`,
        type: 'warning',
        message: `La transition de "${nodeMap.get(edge.source)?.data.label}" vers "${nodeMap.get(edge.target)?.data.label}" n'a pas d'action définie`,
        edgeId: edge.id,
      })
    }
  }

  return errors
}
