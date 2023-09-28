import * as React from 'react'
import ReactFlow, {
  Node,
  addEdge,
  Background,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  Position,
  NodeProps,
  Handle,
  ReactFlowInstance,
  ReactFlowProvider,
} from 'reactflow'

import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../_components/layout/AppLayout'
import { UUID } from '../../domain'
import { useCallback, useRef, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { getUuid } from '../../libs/getUuid'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

type DonutProps = {
  containerSize: number
  position: 'top' | 'left' | 'right' | 'bottom'
  hovered?: 'top' | 'left' | 'right' | 'bottom' | false
  className?: string
  style?: React.CSSProperties
  svgStyle?: React.CSSProperties
  label?: string
  onClick?: () => unknown
}

const DonutSection = ({ containerSize, position, className, style, svgStyle, hovered, label, onClick }: DonutProps) => {
  const isActive = hovered === position
  const [isHovered, setHovered] = useState<boolean>(false)

  // Calculate the center of the container
  const cx = containerSize / 2
  const cy = containerSize / 2

  let sliceStartAngle = 0
  let sliceStopAngle = 0
  let textLeft = 0
  let textTop = 0
  switch (position) {
    case 'top':
      sliceStartAngle = 227
      sliceStopAngle = 313
      textLeft = cx - 35
      textTop = cy - 72
      break
    case 'left':
      sliceStartAngle = 137
      sliceStopAngle = 223
      textLeft = cx - 120
      textTop = cy
      break
    case 'right':
      sliceStartAngle = 317
      sliceStopAngle = 43
      textLeft = cx + 60
      textTop = cy - 10
      break
    case 'bottom':
      sliceStartAngle = 47
      sliceStopAngle = 133
      textLeft = cx - 35
      textTop = cy + 58
      break
  }

  // Convert angles to radians
  const startAngle = (Math.PI * sliceStartAngle) / 180
  const stopAngle = (Math.PI * sliceStopAngle) / 180

  // Calculate the starting and stopping coordinates for the inner and outer arcs
  const xOuterStart = cx + OuterDonutRadius * Math.cos(startAngle)
  const yOuterStart = cy + OuterDonutRadius * Math.sin(startAngle)
  const xOuterStop = cx + OuterDonutRadius * Math.cos(stopAngle)
  const yOuterStop = cy + OuterDonutRadius * Math.sin(stopAngle)

  const xInnerStart = cx + InnerDonutRadius * Math.cos(startAngle)
  const yInnerStart = cy + InnerDonutRadius * Math.sin(startAngle)
  const xInnerStop = cx + InnerDonutRadius * Math.cos(stopAngle)
  const yInnerStop = cy + InnerDonutRadius * Math.sin(stopAngle)

  // Create the SVG path using the calculated coordinates
  const pathData = `
        M ${xOuterStart},${yOuterStart}
        A ${OuterDonutRadius},${OuterDonutRadius} 0 ${stopAngle - startAngle > Math.PI ? 1 : 0},1 ${xOuterStop},${yOuterStop}
        L ${xInnerStop},${yInnerStop}
        A ${InnerDonutRadius},${InnerDonutRadius} 0 ${stopAngle - startAngle > Math.PI ? 1 : 0},0 ${xInnerStart},${yInnerStart}
        Z
    `

  // Construct the SVG element
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        top: BubbleR - containerSize / 2,
        left: BubbleR - containerSize / 2,
        ...style,
      }}>
      <svg
        style={svgStyle}
        width={`${containerSize}px`}
        height={`${containerSize}px`}
        viewBox={`0 0 ${containerSize} ${containerSize}`}>
        <path
          className='pointer-events-auto'
          onMouseOver={() => setHovered(true)}
          onMouseOut={() => setHovered(false)}
          d={`${pathData.trim()}`}
          fill={`${isActive || isHovered ? '#FF0000' : '#D3D3D3'}`}
        />
      </svg>
      {!!label && (isActive || isHovered) && (
        <div className='absolute' style={{ fontSize: 8, top: textTop, left: textLeft }} onClick={onClick}>
          {label}
        </div>
      )}
    </div>
  )
}

const BubbleR = 28
const InnerDonutRadius = BubbleR + 3
const OuterDonutRadius = 60

const PersonNode = ({
  id,
  data,
  isConnectable,
  selected,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps<{
  label: string
  profilePicUrl: string
  hovered: 'top' | 'bottom' | 'left' | 'right' | false
}>) => {
  const containerSize = 200

  // console.log('PersonNode render', id, data)

  return (
    <div className='text-center relative' key={`personNode_${id}`}>
      {/* <Handle type='target' position={targetPosition} isConnectable={isConnectable} /> */}
      {(data.hovered || selected) && (
        <>
          {/* Bottom */}
          <DonutSection
            position='bottom'
            label='Ajouter un enfant'
            onClick={() => alert('rajouter un enfant')}
            containerSize={containerSize}
            hovered={data.hovered}
          />
          {/* Left */}
          <DonutSection
            containerSize={containerSize}
            label='Ajouter un ami'
            onClick={() => alert('rajouter un ami')}
            position='left'
            hovered={data.hovered}
          />
          {/* Top */}
          <DonutSection
            containerSize={containerSize}
            label='Ajouter un parent'
            onClick={() => alert('rajouter un parent')}
            position='top'
            hovered={data.hovered}
          />
          {/* Right */}
          <DonutSection
            containerSize={containerSize}
            label='Ajouter un compagnon / époux'
            onClick={() => alert('rajouter un époux')}
            position='right'
            hovered={data.hovered}
          />
        </>
      )}

      <img
        src={data.profilePicUrl}
        className={`inline-block rounded-full h-14 w-14 ring-2 ${selected ? 'ring-red-500' : 'ring-white'} shadow-sm`}
      />
      {/* {<div>{data?.label}</div>} */}
      {/* <Handle type='source' position={sourcePosition} isConnectable={isConnectable} /> */}
    </div>
  )
}

const nodeTypes = {
  person: PersonNode,
}

type Person = {
  profilePicUrl: string | null
  name: string
  personId: UUID
}

export type FamilyPageProps = {
  persons: Person[]
  defaultSelectedPersonId: UUID
}

export const FamilyPage = withBrowserBundle(({ persons, defaultSelectedPersonId }: FamilyPageProps) => {
  const dragRef = useRef<Node | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)

  const selectedPerson = persons.find((person) => person.personId === defaultSelectedPersonId)!

  const selectedPersonNode: Node = {
    id: selectedPerson.personId,
    type: 'person',
    data: { label: selectedPerson.name, profilePicUrl: selectedPerson.profilePicUrl, hovered: false },
    position: { x: 0, y: 0 },
    selectable: true,
    draggable: false,
  }

  const otherPersons = persons.filter((person) => person !== selectedPerson)

  const otherPersonCount = otherPersons.length
  const distance = otherPersonCount > 1 ? Math.max(100, Math.ceil(((otherPersonCount - 1) * 60) / Math.PI)) : 100

  const [nodes, setNodes, onNodesChange] = useNodesState([
    selectedPersonNode,
    // ...otherPersons.map<Node>(({ profilePicUrl, name, personId }, index) => {
    //   const angle = otherPersonCount > 1 ? (Math.PI / (otherPersonCount - 1)) * (index + 0) : 0
    //   return {
    //     id: personId,
    //     type: 'person',
    //     data: { label: index + 1, profilePicUrl },
    //     position: { x: Math.round(distance * Math.cos(angle)), y: Math.round(distance * Math.sin(angle)) },
    //     selectable: true,
    //   }
    // }),
  ])

  const [origX, setOrigX] = useState<number | undefined>()
  const [origY, setOrigY] = useState<number | undefined>()

  const onNodeDragStart = useCallback((e: React.MouseEvent, node: Node) => {
    dragRef.current = node
    setOrigX(node.position.x)
    setOrigY(node.position.y)
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === defaultSelectedPersonId) {
          node.data = { ...node.data, hovered: false }
        }
        return node
      })
    )
  }, [])

  const onNodeDrag = useCallback((evt: React.MouseEvent, draggedNode: Node) => {
    // calculate the center point of the node from position and dimensions
    const centerX = draggedNode.position.x + draggedNode.width! / 2
    const centerY = draggedNode.position.y + draggedNode.height! / 2

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === defaultSelectedPersonId) {
          const targetCenterX = node.position.x + node.width! / 2
          const targetCenterY = node.position.y + node.height! / 2
          if (
            centerX > targetCenterX + OuterDonutRadius + BubbleR ||
            centerX < targetCenterX - OuterDonutRadius - BubbleR ||
            centerY > targetCenterY + OuterDonutRadius + BubbleR ||
            centerY < targetCenterY - OuterDonutRadius - BubbleR
          ) {
            node.data = { ...node.data, hovered: false }
          } else {
            if (centerX > targetCenterX - 30 && centerX < targetCenterX + 30) {
              if (centerY > targetCenterY) {
                node.data = { ...node.data, hovered: 'bottom' }
              } else {
                node.data = { ...node.data, hovered: 'top' }
              }
            } else {
              if (centerX > targetCenterX) {
                node.data = { ...node.data, hovered: 'right' }
              } else {
                node.data = { ...node.data, hovered: 'left' }
              }
            }
          }
        }
        return node
      })
    )

    // Find on which pad it is hovering
  }, [])

  const onNodeDragStop = useCallback(
    (evt: React.MouseEvent, draggedNode: Node) => {
      // on drag stop, either create a relationship or not
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === defaultSelectedPersonId) {
            node.data = { ...node.data, hovered: false }
          }

          if (node.id === draggedNode.id) {
            node.position = { x: origX!, y: origY! }
          }
          return node
        })
      )

      dragRef.current = null
    },
    [origX, origY]
  )

  // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onDragOver: React.DragEventHandler = useCallback(
    (event) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'

      if (!reactFlowWrapper.current) {
        console.error('wrapper not current')
        return
      }

      if (!reactFlowInstance) {
        console.error('reactFlowInstance not ok')
        return
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const centerX = position.x
      const centerY = position.y

      setNodes((nodes) => {
        // console.log('onDragOver setNodes')
        return nodes.map((node) => {
          // console.log('setNodes looking at ', node.id, defaultSelectedPersonId)
          if (node.id === defaultSelectedPersonId) {
            const targetCenterX = node.position.x + node.width! / 2
            const targetCenterY = node.position.y + node.height! / 2
            if (
              centerX > targetCenterX + OuterDonutRadius + BubbleR ||
              centerX < targetCenterX - OuterDonutRadius - BubbleR ||
              centerY > targetCenterY + OuterDonutRadius + BubbleR ||
              centerY < targetCenterY - OuterDonutRadius - BubbleR
            ) {
              node.data = { ...node.data, hovered: false }
            } else {
              if (centerX > targetCenterX - 30 && centerX < targetCenterX + 30) {
                if (centerY > targetCenterY) {
                  node.data = { ...node.data, hovered: 'bottom' }
                } else {
                  node.data = { ...node.data, hovered: 'top' }
                }
              } else {
                if (centerX > targetCenterX) {
                  node.data = { ...node.data, hovered: 'right' }
                } else {
                  node.data = { ...node.data, hovered: 'left' }
                }
              }
            }
          }

          return node
        })
      })
    },
    [reactFlowInstance]
  )

  const cleanUp = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (!!node.data.hovered) {
          node.data = { ...node.data, hovered: false }
        }
        return node
      })
    )
  }, [])

  const onDrop: React.DragEventHandler = useCallback(
    (event) => {
      event.preventDefault()

      const newNodeDataEncoded = event.dataTransfer.getData('application/reactflow')

      // check if the dropped element is valid
      if (typeof newNodeDataEncoded === 'undefined' || !newNodeDataEncoded) {
        return
      }

      try {
        const newNodeData: Person = JSON.parse(newNodeDataEncoded)
        const { personId, name, profilePicUrl } = newNodeData

        setNodes((nodes) => {
          const targettedNode = nodes.find((node) => !!node.data.hovered)

          if (targettedNode && targettedNode.data.hovered !== false) {
            const { hovered } = targettedNode.data
            const newNode = {
              id: personId,
              type: 'person',
              position: {
                x: ['top', 'bottom'].includes(hovered) ? 0 : hovered === 'left' ? -100 : 100,
                y: ['right', 'left'].includes(hovered) ? 0 : hovered === 'top' ? -100 : 100,
              }, // TODO
              data: { label: name, profilePicUrl, hovered: false },
            }

            // targettedNode.data = { ...targettedNode.data, hovered: false }

            const newNodes = [...nodes, newNode]
            // console.log('onDrop newNodes', newNodes)

            return newNodes
          }

          return nodes
        })

        // Barbaric fix to have the hovered nodes pass to unhovered
        setTimeout(cleanUp, 100)
      } catch (error) {
        console.error('could not parse the newNodeData', error)
      }
    },
    [reactFlowInstance]
  )

  return (
    <AppLayout>
      <UnattachedPersonList persons={persons} nodes={nodes} />
      <ReactFlowProvider>
        <div className='w-full h-screen relative' ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            // edges={edges}
            onNodesChange={onNodesChange}
            // onEdgesChange={onEdgesChange}
            // onConnect={onConnect}
            onInit={setReactFlowInstance}
            // onNodeDrag={onNodeDrag}
            // onNodeDragStart={onNodeDragStart}
            // onNodeDragStop={onNodeDragStop}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView>
            <Background />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </AppLayout>
  )
})

type UnattachedPersonListProps = {
  persons: Person[]
  nodes: Node[]
}

function UnattachedPersonList({ persons, nodes }: UnattachedPersonListProps) {
  const onDragStart = (event: React.DragEvent, person: Person) => {
    // console.log('DragStart')
    event.dataTransfer.setData('application/reactflow', JSON.stringify(person))
    event.dataTransfer.effectAllowed = 'move'
  }

  const nodeIdSet = new Set(nodes.map((node) => node.id))
  const otherPersons = persons.filter((person) => !nodeIdSet.has(person.personId))
  console.log({ persons, nodes })
  return (
    <div className='h-28 bg-gray-800/10 pl-3 fixed bottom-0 z-50 w-full overflow-x-scroll flex gap-2 items-center'>
      {/* <div
        className={`flex items-center justify-center cursor-pointer rounded-full h-14 w-14 shadow-sm  bg-indigo-600/60 hover:bg-indigo-600`}
        onClick={(e) => {
          const name = prompt('Quel est le nom de cette nouvelle personne ?')

          if (name) {
            setNewPersons((newPersons) => [...newPersons, { personId: getUuid(), name, profilePicUrl: '' }])
          }
        }}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth='1.5'
          stroke='currentColor'
          aria-hidden='true'
          className='h-6 w-6 text-white'>
          <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
        </svg>
      </div>

      {newPersons.map(({ name, personId }) => (
        <div
          className='cursor-pointer flex items-center justify-center rounded-full h-14 w-14 ring-2 shadow-sm overflow-hidden'
          key={`newPerson${personId}`}>
          {name}
        </div>
      ))} */}
      {otherPersons.map(({ profilePicUrl, personId, name }) => (
        <img
          key={`unrelated_${personId}`}
          src={
            profilePicUrl ||
            'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'
          }
          className={`cursor-pointer inline-block rounded-full h-20 w-20 ring-2 shadow-sm`}
          draggable
          onDragStart={(event) => onDragStart(event, { personId, profilePicUrl, name })}
        />
      ))}
    </div>
  )
}
