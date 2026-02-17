import { useCallback, useRef, useMemo, useEffect, useState, type DragEvent } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type ReactFlowInstance,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { WorkflowNodeType, WorkflowFlowNode, WorkflowFlowEdge, EditorMode } from './types'
import { NODE_TYPE_META } from './types'
import { useWorkflowEditor } from './hooks/useWorkflowEditor'
import { validateWorkflow } from './utils/validation'
import { exportToYaml, importFromYaml } from './utils/yaml-export'
import { applyDagreLayout } from './utils/auto-layout'
import { WORKFLOWS } from './data/workflow-catalog'

import WorkflowNode from './components/nodes/WorkflowNode'
import TransitionEdge from './components/edges/TransitionEdge'
import NodePalette from './components/panels/NodePalette'
import NodeEditorPanel from './components/panels/NodeEditorPanel'
import TransitionEditorPanel from './components/panels/TransitionEditorPanel'
import EditorToolbar from './components/toolbar/EditorToolbar'
import SimulationOverlay from './components/simulation/SimulationOverlay'

const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode as unknown as NodeTypes['workflowNode'],
}

const edgeTypes: EdgeTypes = {
  workflowEdge: TransitionEdge as unknown as EdgeTypes['workflowEdge'],
}

export default function WorkflowEditor() {
  const { workflowId } = useParams<{ workflowId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [workflowName, setWorkflowName] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [organisationName, setOrganisationName] = useState<string | null>(null)

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useRef<ReactFlowInstance<WorkflowFlowNode, WorkflowFlowEdge> | null>(null)

  const {
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
  } = useWorkflowEditor()

  // ─── Detect editor mode from URL params or loaded data ──
  useEffect(() => {
    const mode = searchParams.get('mode') as EditorMode | null
    if (mode && (mode === 'template' || mode === 'override')) {
      setEditorMode(mode)
    }
    const orgName = searchParams.get('organisationName')
    if (orgName) {
      setOrganisationName(orgName)
    }
  }, [searchParams, setEditorMode])

  // ─── Load workflow from YAML when routed with workflowId ──
  useEffect(() => {
    if (!workflowId) return
    const meta = WORKFLOWS.find((w) => w.id === workflowId)
    if (meta) {
      setWorkflowName(meta.name)
    }
    fetch(`/workflows/${workflowId}.yaml`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((yamlContent) => {
        const { nodes: newNodes, edges: newEdges } = importFromYaml(yamlContent)
        const layoutNodes = applyDagreLayout(newNodes, newEdges)
        loadWorkflow(layoutNodes, newEdges)
        setLoadError(null)
      })
      .catch((err) => {
        setLoadError(`Impossible de charger le workflow : ${err.message}`)
      })
  }, [workflowId, loadWorkflow])

  // Validation (memoized)
  const validationErrors = useMemo(
    () => validateWorkflow(nodes, edges),
    [nodes, edges],
  )

  // ─── Drag & Drop from palette ────────────────────────────
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const nodeType = event.dataTransfer.getData('application/workflow-node-type') as WorkflowNodeType
      if (!nodeType) return

      const bounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!bounds || !reactFlowInstance.current) return

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      })

      addNode(nodeType, position)
    },
    [addNode],
  )

  // ─── Auto-layout ────────────────────────────────────────
  const handleAutoLayout = useCallback(() => {
    const layoutNodes = applyDagreLayout(nodes, edges)
    loadWorkflow(layoutNodes, edges)
    setTimeout(() => reactFlowInstance.current?.fitView(), 50)
  }, [nodes, edges, loadWorkflow])

  // ─── YAML Export ──────────────────────────────────────────
  const handleExportYaml = useCallback(() => {
    const yamlContent = exportToYaml(nodes, edges)
    const blob = new Blob([yamlContent], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'workflow.yaml'
    a.click()
    URL.revokeObjectURL(url)
  }, [nodes, edges])

  // ─── YAML Import ──────────────────────────────────────────
  const handleImportYaml = useCallback(
    (yamlContent: string) => {
      try {
        const { nodes: newNodes, edges: newEdges } = importFromYaml(yamlContent)
        loadWorkflow(newNodes, newEdges)
      } catch (err) {
        alert(
          `Erreur d'import YAML : ${err instanceof Error ? err.message : 'Format invalide'}`,
        )
      }
    },
    [loadWorkflow],
  )

  // ─── Save (placeholder - would call API) ──────────────────
  const handleSave = useCallback(() => {
    const yamlContent = exportToYaml(nodes, edges)
    // TODO: Call workflow definition API
    console.info('[WorkflowEditor] Save payload:', yamlContent)
    alert('Workflow enregistré (console)')
  }, [nodes, edges])

  // ─── Simulation node/edge styling ─────────────────────────
  const styledNodes = useMemo(() => {
    if (!simulation.isActive) return nodes
    return nodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        opacity: simulation.visitedNodeIds.includes(node.id) ? 1 : 0.3,
        ...(node.id === simulation.currentNodeId
          ? { filter: 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.6))' }
          : {}),
      },
    }))
  }, [nodes, simulation])

  const styledEdges = useMemo(() => {
    if (!simulation.isActive) return edges
    return edges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        opacity: simulation.visitedEdgeIds.includes(edge.id) ? 1 : 0.2,
        stroke: simulation.visitedEdgeIds.includes(edge.id)
          ? '#9333ea'
          : undefined,
        strokeWidth: simulation.visitedEdgeIds.includes(edge.id) ? 2.5 : undefined,
      },
    }))
  }, [edges, simulation])

  // ─── MiniMap node color ───────────────────────────────────
  const miniMapNodeColor = useCallback((node: WorkflowFlowNode) => {
    const meta = NODE_TYPE_META[node.data?.nodeType as WorkflowNodeType]
    return meta?.color ?? '#94a3b8'
  }, [])

  // ─── Panel click deselect ─────────────────────────────────
  const onPaneClick = useCallback(() => {
    if (!simulation.isActive) {
      clearSelection()
    }
  }, [simulation.isActive, clearSelection])

  return (
    <div className="flex flex-col -m-6 h-[calc(100%+48px)]">
      {/* Load error banner */}
      {loadError && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-xs text-red-700">
          {loadError}
        </div>
      )}

      {/* Toolbar */}
      <EditorToolbar
        validationErrors={validationErrors}
        simulationActive={simulation.isActive}
        workflowName={workflowName}
        editorMode={editorMode}
        organisationName={organisationName}
        onBack={workflowId ? () => navigate('/workflow-editor') : undefined}
        onExportYaml={handleExportYaml}
        onImportYaml={handleImportYaml}
        onAutoLayout={handleAutoLayout}
        onStartSimulation={startSimulation}
        onStopSimulation={stopSimulation}
        onSave={handleSave}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left palette */}
        <NodePalette disabled={simulation.isActive} />

        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={styledNodes}
            edges={styledEdges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={simulation.isActive ? undefined : onConnect}
            onNodeClick={onNodeClick as never}
            onEdgeClick={onEdgeClick as never}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onInit={(instance) => {
              reactFlowInstance.current = instance as unknown as typeof reactFlowInstance.current
            }}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            deleteKeyCode={simulation.isActive ? null : 'Delete'}
            selectionKeyCode={simulation.isActive ? null : 'Shift'}
            multiSelectionKeyCode={simulation.isActive ? null : 'Meta'}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{ type: 'workflowEdge' }}
          >
            <Background gap={16} size={1} color="#f1f5f9" />
            <Controls
              showInteractive={false}
              className="!bg-white !shadow-md !rounded-lg !border !border-gray-200"
            />
            <MiniMap
              nodeColor={miniMapNodeColor as never}
              maskColor="rgba(0, 0, 0, 0.08)"
              className="!bg-white !shadow-md !rounded-lg !border !border-gray-200"
              pannable
              zoomable
            />
          </ReactFlow>

          {/* Simulation overlay */}
          <SimulationOverlay
            simulation={simulation}
            nodes={nodes}
            edges={edges}
            onTransition={simulateTransition}
            onStop={stopSimulation}
          />
        </div>

        {/* Right panel - Node editor */}
        {selectedNode && !simulation.isActive && (
          <NodeEditorPanel
            node={selectedNode}
            editorMode={editorMode}
            onUpdate={(data) => updateNodeData(selectedNode.id, data)}
            onDelete={() => deleteNode(selectedNode.id)}
            onClose={clearSelection}
          />
        )}

        {/* Right panel - Edge editor */}
        {selectedEdge && !simulation.isActive && (
          <TransitionEditorPanel
            edge={selectedEdge}
            nodes={nodes}
            onUpdate={(data) => updateEdgeData(selectedEdge.id, data)}
            onDelete={() => deleteEdge(selectedEdge.id)}
            onClose={clearSelection}
          />
        )}
      </div>
    </div>
  )
}
