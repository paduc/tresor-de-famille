import React from 'react'
import ReactFlow, { Background, Panel, ReactFlowProvider, useEdgesState, useNodesState, useViewport } from 'reactflow'
import { PersonId } from '../../../../domain/PersonId.js'
import { PersonInTree, RelationshipInTree } from '../TreeTypes.js'
import { entireFamilyOfPersonMapper } from './entireFamilyOfPersonMapper.js'
import { CoupleNode } from './CoupleNode.js'
import { PersonNode } from './PersonNode.js'

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

    const { nodes, edges } = entireFamilyOfPersonMapper({ persons, relationships, originPersonId: originPersonId })

    setNodes(Array.from(nodes.values()))
    setEdges(Array.from(edges.values()))
  }, [persons, relationships, originPersonId])

  return (
    <ReactFlowProvider>
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
        {/* <Panel position='bottom-center'>
          <ViewportDisplay />
        </Panel> */}
      </ReactFlow>
    </ReactFlowProvider>
  )
}

function ViewportDisplay() {
  const { x, y, zoom } = useViewport()

  return (
    <div>
      <p>
        The viewport is currently at ({x}, {y}) and zoomed to {zoom}.
      </p>
    </div>
  )
}
