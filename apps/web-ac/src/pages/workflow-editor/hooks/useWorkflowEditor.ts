import { useState, useCallback, useRef } from 'react'
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react'
import type {
  WorkflowFlowNode,
  WorkflowFlowEdge,
  WorkflowNodeType,
  EditorSelection,
  SimulationState,
  EditorMode,
} from '../types'

const INITIAL_START: WorkflowFlowNode = {
  id: 'node-start-init',
  type: 'workflowNode',
  position: { x: 60, y: 200 },
  data: {
    code: 'START',
    label: 'Début',
    nodeType: 'START',
    isMandatory: true,
  },
}

const INITIAL_END: WorkflowFlowNode = {
  id: 'node-end-init',
  type: 'workflowNode',
  position: { x: 600, y: 200 },
  data: {
    code: 'END',
    label: 'Fin',
    nodeType: 'END',
    isMandatory: true,
  },
}

export function useWorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowFlowNode>([
    INITIAL_START,
    INITIAL_END,
  ])
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowFlowEdge>([])
  const [selection, setSelection] = useState<EditorSelection>({ type: null, id: null })
  const [simulation, setSimulation] = useState<SimulationState>({
    isActive: false,
    currentNodeId: null,
    visitedNodeIds: [],
    visitedEdgeIds: [],
    history: [],
  })
  const [editorMode, setEditorMode] = useState<EditorMode>('standalone')
  const idCounter = useRef(0)

  const nextId = useCallback((prefix: string) => {
    idCounter.current += 1
    return `${prefix}-${Date.now()}-${idCounter.current}`
  }, [])

  // ─── Node Operations ─────────────────────────────────
  const handleNodesChange = useCallback(
    (changes: NodeChange<WorkflowFlowNode>[]) => {
      // Block deletion of mandatory or locked nodes
      const filtered = changes.filter((change) => {
        if (change.type === 'remove') {
          const node = nodes.find((n) => n.id === change.id)
          if (node?.data.isMandatory) return false
          if (editorMode === 'override' && node?.data.isLocked) return false
        }
        return true
      })
      onNodesChange(filtered)
    },
    [nodes, onNodesChange, editorMode],
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<WorkflowFlowEdge>[]) => {
      onEdgesChange(changes)
    },
    [onEdgesChange],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      // Prevent connections FROM END nodes
      const sourceNode = nodes.find((n) => n.id === connection.source)
      if (sourceNode?.data.nodeType === 'END') return

      const newEdge: WorkflowFlowEdge = {
        id: nextId('edge'),
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: 'workflowEdge',
        data: {
          action: '',
          label: 'Nouvelle transition',
          isMandatory: false,
          requiresComment: false,
          requiresSignature: false,
          requiresAttachment: false,
        },
      }
      setEdges((eds) => addEdge(newEdge, eds))

      // Auto-select new edge for editing
      setSelection({ type: 'edge', id: newEdge.id })
    },
    [nodes, nextId, setEdges],
  )

  const addNode = useCallback(
    (nodeType: WorkflowNodeType, position: { x: number; y: number }) => {
      const codeBase = nodeType === 'ACTION'
        ? 'NOUVELLE_ACTION'
        : nodeType === 'DECISION'
          ? 'NOUVELLE_DECISION'
          : `NOUVEAU_${nodeType}`

      const existing = nodes.filter((n) =>
        n.data.code.startsWith(codeBase),
      ).length

      const code = existing > 0 ? `${codeBase}_${existing + 1}` : codeBase

      const labels: Record<WorkflowNodeType, string> = {
        START: 'Début',
        ACTION: 'Nouvelle action',
        DECISION: 'Nouvelle décision',
        LOOP: 'Nouvelle boucle',
        SYSTEM: 'Action système',
        END: 'Fin',
      }

      const newNode: WorkflowFlowNode = {
        id: nextId('node'),
        type: 'workflowNode',
        position,
        data: {
          code,
          label: labels[nodeType],
          nodeType,
          isMandatory: false,
        },
      }

      setNodes((nds) => [...nds, newNode])
      setSelection({ type: 'node', id: newNode.id })
    },
    [nodes, nextId, setNodes],
  )

  const deleteNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (node?.data.isMandatory) return
      if (editorMode === 'override' && node?.data.isLocked) return

      setNodes((nds) => nds.filter((n) => n.id !== nodeId))
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
      if (selection.id === nodeId) {
        setSelection({ type: null, id: null })
      }
    },
    [nodes, selection.id, setNodes, setEdges, editorMode],
  )

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId))
      if (selection.id === edgeId) {
        setSelection({ type: null, id: null })
      }
    },
    [selection.id, setEdges],
  )

  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<WorkflowFlowNode['data']>) => {
      // In override mode, reject updates to locked nodes (allow position changes only)
      if (editorMode === 'override') {
        const node = nodes.find((n) => n.id === nodeId)
        if (node?.data.isLocked) return
      }

      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
        ),
      )
    },
    [setNodes, editorMode, nodes],
  )

  const updateEdgeData = useCallback(
    (edgeId: string, data: Partial<WorkflowFlowEdge['data']>) => {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeId
            ? { ...e, data: { ...e.data, ...data } as WorkflowFlowEdge['data'] }
            : e,
        ),
      )
    },
    [setEdges],
  )

  // ─── Selection ────────────────────────────────────────
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: WorkflowFlowNode) => {
      if (simulation.isActive) return
      setSelection({ type: 'node', id: node.id })
    },
    [simulation.isActive],
  )

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: WorkflowFlowEdge) => {
      if (simulation.isActive) return
      setSelection({ type: 'edge', id: edge.id })
    },
    [simulation.isActive],
  )

  const clearSelection = useCallback(() => {
    setSelection({ type: null, id: null })
  }, [])

  // ─── Simulation ───────────────────────────────────────
  const startSimulation = useCallback(() => {
    const startNode = nodes.find((n) => n.data.nodeType === 'START')
    if (!startNode) return
    setSimulation({
      isActive: true,
      currentNodeId: startNode.id,
      visitedNodeIds: [startNode.id],
      visitedEdgeIds: [],
      history: [],
    })
    setSelection({ type: null, id: null })
  }, [nodes])

  const simulateTransition = useCallback(
    (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId)
      if (!edge) return

      setSimulation((prev) => ({
        ...prev,
        currentNodeId: edge.target,
        visitedNodeIds: [...prev.visitedNodeIds, edge.target],
        visitedEdgeIds: [...prev.visitedEdgeIds, edgeId],
        history: [
          ...prev.history,
          {
            fromNodeId: edge.source,
            toNodeId: edge.target,
            edgeId,
            action: edge.data?.action ?? '',
            timestamp: Date.now(),
          },
        ],
      }))
    },
    [edges],
  )

  const stopSimulation = useCallback(() => {
    setSimulation({
      isActive: false,
      currentNodeId: null,
      visitedNodeIds: [],
      visitedEdgeIds: [],
      history: [],
    })
  }, [])

  // ─── Bulk Load ────────────────────────────────────────
  const loadWorkflow = useCallback(
    (newNodes: WorkflowFlowNode[], newEdges: WorkflowFlowEdge[]) => {
      setNodes(newNodes)
      setEdges(newEdges)
      setSelection({ type: null, id: null })
    },
    [setNodes, setEdges],
  )

  // ─── Selected data accessors ──────────────────────────
  const selectedNode = selection.type === 'node'
    ? nodes.find((n) => n.id === selection.id) ?? null
    : null

  const selectedEdge = selection.type === 'edge'
    ? edges.find((e) => e.id === selection.id) ?? null
    : null

  return {
    nodes,
    edges,
    selection,
    selectedNode,
    selectedEdge,
    simulation,
    editorMode,
    setEditorMode,
    handleNodesChange,
    handleEdgesChange,
    onConnect,
    addNode,
    deleteNode,
    deleteEdge,
    updateNodeData,
    updateEdgeData,
    onNodeClick,
    onEdgeClick,
    clearSelection,
    startSimulation,
    simulateTransition,
    stopSimulation,
    loadWorkflow,
  }
}
