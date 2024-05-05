import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow'

export function CoupleNode({
  id,
  data,
  isConnectable,
  selected,
  dragging,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps<{}>) {
  return (
    <>
      <Handle id='couple-left' type='target' style={{ opacity: 0, left: 3 }} position={Position.Left} isConnectable={false} />
      <Handle
        id='couple-right'
        type='source'
        style={{ opacity: 0, right: 3 }}
        position={Position.Right}
        isConnectable={false}
      />
      <Handle id='children' type='source' style={{ opacity: 0, bottom: 3 }} position={Position.Bottom} isConnectable={false} />
      <div className='h-3 w-3 rounded-full bg-gray-50 border border-grey-700' />
    </>
  )
}
