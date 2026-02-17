import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { WorkflowNodeData } from '../../types'
import { NODE_TYPE_META } from '../../types'

function WorkflowNodeComponent({ data, selected }: NodeProps & { data: WorkflowNodeData }) {
  const meta = NODE_TYPE_META[data.nodeType]
  const isMandatory = data.isMandatory
  const isLocked = data.isLocked
  const isCircle = data.nodeType === 'START' || data.nodeType === 'END'

  return (
    <div className="relative">
      {/* Lock indicator */}
      {isLocked && !isCircle && (
        <div
          className="absolute -top-1 -left-1 z-10 w-4 h-4 rounded-full bg-gray-600 text-white flex items-center justify-center text-[8px] leading-none border-2 border-white"
          title="Noeud verrouillé (contrôle)"
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      )}

      {/* Node body */}
      <div
        className={`
          relative flex flex-col items-center justify-center text-center transition-all px-3 py-2
          ${isCircle ? 'w-16 h-16 rounded-full' : 'min-w-[100px] max-w-[140px] rounded-md'}
          ${isMandatory ? 'border-2 border-solid' : 'border border-dashed'}
          ${selected ? 'ring-2 ring-offset-1 ring-blue-500' : ''}
          ${isLocked ? 'opacity-75' : ''}
        `}
        style={{
          backgroundColor: meta.bgColor,
          borderColor: meta.borderColor,
        }}
      >
        {/* Target handle (left) */}
        {data.nodeType !== 'START' && (
          <Handle
            type="target"
            position={Position.Left}
            className="!w-2 !h-2 !border-2 !border-white !bg-gray-400"
          />
        )}

        {/* Icon */}
        <span className="text-sm leading-none" style={{ color: meta.color }}>
          {meta.icon}
        </span>

        {/* Label */}
        <span
          className="text-[10px] font-medium leading-tight mt-0.5 line-clamp-2"
          style={{ color: meta.color }}
        >
          {data.label}
        </span>

        {/* Role - compact */}
        {data.assigneeRole && !isCircle && (
          <span className="text-[8px] text-gray-400 mt-0.5 truncate max-w-full">
            {data.assigneeRole}
          </span>
        )}

        {/* SLA inline */}
        {data.slaHours != null && !isCircle && (
          <span className="text-[8px] text-amber-600 font-semibold mt-0.5">
            {data.slaHours}h
          </span>
        )}

        {/* Source handle (right) */}
        {data.nodeType !== 'END' && (
          <Handle
            type="source"
            position={Position.Right}
            className="!w-2 !h-2 !border-2 !border-white !bg-gray-400"
          />
        )}
      </div>

      {/* Mandatory indicator - subtle dot */}
      {isMandatory && !isCircle && (
        <div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
          style={{ backgroundColor: meta.color }}
          title="Obligatoire"
        />
      )}
    </div>
  )
}

export default memo(WorkflowNodeComponent)
