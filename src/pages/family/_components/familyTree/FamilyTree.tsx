import React from 'react'
import ReactFlow, { Background, ReactFlowProps } from 'reactflow'
import { CoupleNode } from './CoupleNode'
import { PersonNode } from './PersonNode'

type FamilyTreeProps = ReactFlowProps & { children?: React.ReactNode }

const nodeTypes = {
  person: PersonNode,
  couple: CoupleNode,
}

export function FamilyTree(props: FamilyTreeProps) {
  return (
    <ReactFlow {...props} nodeTypes={nodeTypes} fitView maxZoom={1}>
      <Background />
      {props.children}
    </ReactFlow>
  )
}
