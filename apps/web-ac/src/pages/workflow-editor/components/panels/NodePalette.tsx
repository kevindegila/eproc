import { type DragEvent, useCallback } from 'react'
import { NODE_TYPE_META, type WorkflowNodeType } from '../../types'

const DRAGGABLE_TYPES: WorkflowNodeType[] = ['ACTION', 'DECISION', 'LOOP', 'SYSTEM']

interface NodePaletteProps {
  disabled?: boolean
}

export default function NodePalette({ disabled }: NodePaletteProps) {
  const onDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>, nodeType: WorkflowNodeType) => {
      event.dataTransfer.setData('application/workflow-node-type', nodeType)
      event.dataTransfer.effectAllowed = 'move'
    },
    [],
  )

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">Palette</h3>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Glissez un noeud sur le canevas
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {DRAGGABLE_TYPES.map((nodeType) => {
          const meta = NODE_TYPE_META[nodeType]
          return (
            <div
              key={nodeType}
              draggable={!disabled}
              onDragStart={(e) => onDragStart(e, nodeType)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 border-dashed
                transition-all select-none
                ${disabled
                  ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50'
                  : 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-solid border-gray-200 bg-white'
                }
              `}
              style={
                disabled
                  ? undefined
                  : { '--hover-border': meta.borderColor } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                if (!disabled) {
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = meta.borderColor
                  ;(e.currentTarget as HTMLDivElement).style.backgroundColor = meta.bgColor
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = ''
                  ;(e.currentTarget as HTMLDivElement).style.backgroundColor = ''
                }
              }}
            >
              <span
                className="w-8 h-8 rounded-md flex items-center justify-center text-base"
                style={{ backgroundColor: meta.bgColor, color: meta.color }}
              >
                {meta.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-700">{meta.label}</div>
                <div className="text-[10px] text-gray-400 truncate">{meta.description}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 py-3 border-t border-gray-100">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span className="inline-block w-6 border-t-2 border-solid border-gray-400" />
            Obligatoire
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span className="inline-block w-6 border-t-2 border-dashed border-gray-400" />
            Optionnel
          </div>
        </div>
      </div>
    </div>
  )
}
