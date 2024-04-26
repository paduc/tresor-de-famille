import React from 'react'
import ReactFlow, { Background, Handle, NodeProps, Position, useEdgesState, useNodesState } from 'reactflow'
import { PersonId } from '../../../../domain/PersonId.js'
import { PersonInTree, RelationshipInTree } from '../TreeTypes.js'
import { entireFamilyOfPersonMapper } from './entireFamilyOfPersonMapper.js'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { useContextualMenu } from '../ContextualMenu.js'
import { getInitials } from '../getInitials.js'

type EntireFamilyFamilyTreeProps = {
  persons: PersonInTree[]
  relationships: RelationshipInTree[]
  originPersonId: PersonId | undefined
  children?: React.ReactNode
}

const nodeTypes = {
  person: PersonNode,
  couple: CoupleNode,
}

export function EntireFamilyFamilyTree({ persons, relationships, originPersonId, children }: EntireFamilyFamilyTreeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  /**
   * Map the persons and relationships to nodes and edges
   */
  React.useEffect(() => {
    console.log('EntireFamilyFamilyTree: useEffect', { persons, relationships, originPersonId })
    if (!originPersonId) return

    const { nodes, edges } = entireFamilyOfPersonMapper({ persons, relationships, originPerson: originPersonId })

    setNodes(Array.from(nodes.values()))
    setEdges(Array.from(edges.values()))
  }, [persons, relationships, originPersonId])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      maxZoom={1}>
      <Background />
      {children}
    </ReactFlow>
  )
}

function CoupleNode({
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

function PersonNode({
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
  const { profilePicUrl, isOriginPerson, label } = data
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
          if (isOriginPerson || selected) openContextMenu(id as PersonId)
        }}>
        {profilePicUrl ? (
          <img
            src={profilePicUrl}
            className={`inline-block group-hover:opacity-75 rounded-full h-36 w-36 ${
              selected || isOriginPerson ? 'ring-indigo-500 ring-4' : 'ring-white ring-2'
            } shadow-sm`}
          />
        ) : (
          <span
            className={`inline-flex h-36 w-36 items-center justify-center rounded-full bg-gray-500 ${
              selected || isOriginPerson ? 'ring-indigo-500 ring-4' : 'ring-white ring-2'
            } shadow-sm`}>
            <span className='text-5xl font-medium leading-none text-white'>{getInitials(label)}</span>
          </span>
        )}
        {isOriginPerson || selected ? (
          <div className='absolute visible md:invisible group-hover:visible top-0 right-0 h-8 w-8 rounded-full bg-gray-100 ring-2  ring-indigo-500 group-hover:animate-bounce'>
            <div className='text-indigo-700 text-xs text-center'>
              <EllipsisHorizontalIcon className='h-8 w-8' />
            </div>
          </div>
        ) : null}
        <div className='absolute w-full top-full -mt-1 pointer-events-none z-10'>
          <span
            className={`inline-flex items-center rounded-lg bg-white/70 px-3 py-1    ring-1 ring-inset ${
              selected || isOriginPerson ? 'text-indigo-700 ring-indigo-500' : 'ring-gray-500/10 text-gray-600'
            } `}>
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}
