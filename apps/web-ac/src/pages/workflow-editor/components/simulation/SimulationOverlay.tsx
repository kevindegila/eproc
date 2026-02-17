import type { SimulationState, WorkflowFlowNode, WorkflowFlowEdge } from '../../types'

interface SimulationOverlayProps {
  simulation: SimulationState
  nodes: WorkflowFlowNode[]
  edges: WorkflowFlowEdge[]
  onTransition: (edgeId: string) => void
  onStop: () => void
}

export default function SimulationOverlay({
  simulation,
  nodes,
  edges,
  onTransition,
  onStop,
}: SimulationOverlayProps) {
  if (!simulation.isActive) return null

  const currentNode = nodes.find((n) => n.id === simulation.currentNodeId)
  const availableEdges = edges.filter((e) => e.source === simulation.currentNodeId)
  const isEnd = currentNode?.data.nodeType === 'END'

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40">
      {/* Semi-transparent bar */}
      <div className="bg-purple-900/95 backdrop-blur-sm text-white">
        {/* Status bar */}
        <div className="px-4 py-2 border-b border-purple-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-400" />
            </span>
            <span className="text-xs font-medium">Mode simulation</span>
            <span className="text-[10px] text-purple-300">
              {simulation.history.length} transition{simulation.history.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={onStop}
            className="px-3 py-1 text-[11px] font-medium bg-purple-700 hover:bg-purple-600 rounded transition-colors"
          >
            Quitter
          </button>
        </div>

        {/* Current state */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] text-purple-300 uppercase tracking-wide">
              Noeud actuel
            </span>
            <span className="text-sm font-semibold">
              {currentNode?.data.label ?? 'Inconnu'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-purple-700 rounded text-purple-200">
              {currentNode?.data.nodeType}
            </span>
          </div>

          {isEnd ? (
            <div className="text-center py-2">
              <span className="text-sm text-green-300 font-medium">
                Workflow terminé
              </span>
              <p className="text-[10px] text-purple-300 mt-1">
                Le workflow a atteint un noeud de fin.
              </p>
            </div>
          ) : availableEdges.length === 0 ? (
            <div className="text-center py-2">
              <span className="text-sm text-amber-300 font-medium">
                Aucune transition disponible
              </span>
              <p className="text-[10px] text-purple-300 mt-1">
                Ce noeud est un cul-de-sac.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] text-purple-300 self-center mr-1">
                Transitions :
              </span>
              {availableEdges.map((edge) => {
                const targetNode = nodes.find((n) => n.id === edge.target)
                return (
                  <button
                    key={edge.id}
                    onClick={() => onTransition(edge.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
                  >
                    <span className="text-xs font-medium">
                      {edge.data?.action || 'Action'}
                    </span>
                    <span className="text-[10px] text-purple-300">
                      &rarr; {targetNode?.data.label ?? '?'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* History timeline */}
        {simulation.history.length > 0 && (
          <div className="px-4 py-2 border-t border-purple-700/50">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] text-purple-400 flex-shrink-0">Historique :</span>
              {simulation.history.map((step, i) => {
                const fromNode = nodes.find((n) => n.id === step.fromNodeId)
                return (
                  <div key={i} className="flex items-center gap-1 flex-shrink-0">
                    {i > 0 && <span className="text-purple-500 text-[10px]">&rarr;</span>}
                    <span className="text-[10px] text-purple-300">
                      {fromNode?.data.label}
                    </span>
                    <span className="text-[10px] px-1 py-0.5 bg-purple-800 rounded text-purple-200">
                      {step.action || '?'}
                    </span>
                  </div>
                )
              })}
              <span className="text-[10px] text-purple-300">&rarr;</span>
              <span className="text-[10px] text-white font-medium">
                {currentNode?.data.label}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
