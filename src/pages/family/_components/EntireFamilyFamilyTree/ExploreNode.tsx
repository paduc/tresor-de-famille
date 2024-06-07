import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow'

export function ExploreNode({
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
      <Handle id='top-source' type='source' style={{ opacity: 0, top: 0 }} position={Position.Top} isConnectable={false} />
      <Handle
        id='bottom-target'
        type='target'
        style={{ opacity: 0, top: 0 }}
        position={Position.Bottom}
        isConnectable={false}
      />
      <div className='h-3 w-3 opacity-0' />
    </>
  )
}
