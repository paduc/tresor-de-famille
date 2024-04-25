import * as React from 'react'
import { Position, Handle } from 'reactflow'
import type { NodeProps } from 'reactflow'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { PersonId } from '../../../../domain/PersonId.js'
import { useContextualMenu } from '../ContextualMenu.js'
import { getInitials } from '../getInitials.js'

export function PersonNode({
  id,
  data,
  isConnectable,
  selected,
  dragging,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps<{
  label: string
  profilePicUrl: string
  isOriginPerson?: true
}>) {
  const { open: openContextMenu } = useContextualMenu()

  return (
    <div className='text-center relative' key={`personNode_${id}`}>
      <Handle id='parents' type='target' style={{ opacity: 0, top: 5 }} position={Position.Top} isConnectable={false} />
      <Handle id='children' type='source' style={{ opacity: 0, bottom: 5 }} position={Position.Bottom} isConnectable={false} />
      <Handle id='person-left' type='target' style={{ opacity: 0, left: 5 }} position={Position.Left} isConnectable={false} />
      <Handle
        id='person-right'
        type='source'
        style={{ opacity: 0, right: 5 }}
        position={Position.Right}
        isConnectable={false}
      />

      <div
        className='relative z-10 group'
        onClick={() => {
          if (data.isOriginPerson) openContextMenu(id as PersonId)
        }}>
        {data.profilePicUrl ? (
          <img
            src={data.profilePicUrl}
            className={`inline-block group-hover:opacity-75 rounded-full h-36 w-36 ${
              selected || data.isOriginPerson ? 'ring-indigo-500 ring-4' : 'ring-white ring-2'
            } shadow-sm`}
          />
        ) : (
          <span
            className={`inline-flex h-36 w-36 items-center justify-center rounded-full bg-gray-500 ${
              selected || data.isOriginPerson ? 'ring-indigo-500 ring-4' : 'ring-white ring-2'
            } shadow-sm`}>
            <span className='text-5xl font-medium leading-none text-white'>{getInitials(data.label)}</span>
          </span>
        )}
        {data.isOriginPerson ? (
          <div className='absolute visible md:invisible group-hover:visible top-0 right-0 h-8 w-8 rounded-full bg-gray-100 ring-2  ring-indigo-500 group-hover:animate-bounce'>
            <div className='text-indigo-700 text-xs text-center'>
              <EllipsisHorizontalIcon className='h-8 w-8' />
            </div>
          </div>
        ) : null}
        <div className='absolute w-full top-full -mt-1 pointer-events-none z-10'>
          <span
            className={`inline-flex items-center rounded-lg bg-white/70 px-3 py-1    ring-1 ring-inset ${
              selected || data.isOriginPerson ? 'text-indigo-700 ring-indigo-500' : 'ring-gray-500/10 text-gray-600'
            } `}>
            {data.label}
          </span>
        </div>
      </div>
    </div>
  )
}
