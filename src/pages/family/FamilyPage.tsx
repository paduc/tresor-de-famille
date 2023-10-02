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
  Panel,
} from 'reactflow'

import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../_components/layout/AppLayout'
import { UUID } from '../../domain'
import { useCallback, useRef, useState } from 'react'
import { ExclamationTriangleIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { getUuid } from '../../libs/getUuid'
import { PersonAutocomplete, PersonAutocompleteProps } from '../_components/PersonAutocomplete'
import { Transition, Dialog } from '@headlessui/react'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

type Person = {
  profilePicUrl: string | null
  name: string
  personId: UUID
}

type NewRelationshipAction = 'addChild' | 'addParent' | 'addFriend' | 'addSpouse'
type PendingNodeRelationshipAction = {
  personId: UUID
  relationshipAction: NewRelationshipAction
}

const NodeListenerContext = React.createContext<((nodeId: string, relationshipAction: NewRelationshipAction) => void) | null>(
  null
)

const BubbleR = 28
const InnerDonutRadius = BubbleR + 3
const OuterDonutRadius = 60
const ContainerSize = 200

type DonutProps = {
  position: DonutPosition
  hovered?: DonutPosition | false
  className?: string
  style?: React.CSSProperties
  svgStyle?: React.CSSProperties
  label?: string
  onClick?: (position: DonutPosition) => unknown
}

const DonutSection = ({ position, className, style, svgStyle, hovered, label, onClick }: DonutProps) => {
  const isActive = hovered === position
  const [isHovered, setHovered] = useState<boolean>(false)

  // Calculate the center of the container
  const cx = ContainerSize / 2
  const cy = ContainerSize / 2

  const circleR = 3
  const circlePadding = 10
  const circleDistance = BubbleR / 2 + circleR / 2 + 10 + circlePadding

  let sliceStartAngle = 0
  let sliceStopAngle = 0
  let textLeft = 0
  let textTop = 0
  let circleLeft = 0
  let circleTop = 0
  switch (position) {
    case 'top':
      sliceStartAngle = 227
      sliceStopAngle = 313
      textLeft = cx - 35
      textTop = cy - 72
      circleLeft = cx
      circleTop = cy - circleDistance
      break
    case 'left':
      sliceStartAngle = 137
      sliceStopAngle = 223
      textLeft = cx - 120
      textTop = cy
      circleLeft = cx - circleDistance
      circleTop = cy
      break
    case 'right':
      sliceStartAngle = 317
      sliceStopAngle = 43
      textLeft = cx + 60
      textTop = cy - 10
      circleLeft = cx + circleDistance
      circleTop = cy
      break
    case 'bottom':
      sliceStartAngle = 47
      sliceStopAngle = 133
      textLeft = cx - 35
      textTop = cy + 58
      circleLeft = cx
      circleTop = cy + circleDistance
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

  const maskId = `mask-${position}`

  // Construct the SVG element
  return (
    <div
      key={`donut_${position}`}
      className={`absolute pointer-events-none ${className}`}
      style={{
        top: BubbleR - ContainerSize / 2,
        left: BubbleR - ContainerSize / 2,
        ...style,
      }}>
      <svg
        style={svgStyle}
        width={`${ContainerSize}px`}
        height={`${ContainerSize}px`}
        viewBox={`0 0 ${ContainerSize} ${ContainerSize}`}
        className={`pointer-events-none`}>
        {/** the mask is there to transition from a circle to the donut slice */}
        <mask id={maskId}>
          <path d={`${pathData.trim()}`} fill='white' />
        </mask>
        <circle
          className='transition-all duration-700 ease-in-out'
          cx={circleLeft}
          cy={circleTop}
          r={`${isActive || isHovered ? ContainerSize / 2 : circleR}`}
          mask={`url(#${maskId})`}
          fill={`${isActive || isHovered ? '#FF0000' : '#D3D3D3'}`}
        />

        {/** this is an invisible path to catch mouse events */}
        <path
          className='pointer-events-auto'
          onMouseOver={() => setHovered(true)}
          onMouseOut={() => setHovered(false)}
          d={`${pathData.trim()}`}
          fill='rgba(0,0,0,0)'
          onClick={() => onClick && onClick(position)}
        />
      </svg>
      {!!label && (isActive || isHovered) && (
        <div className='absolute' style={{ fontSize: 8, top: textTop, left: textLeft }}>
          {label}
        </div>
      )}
    </div>
  )
}

type DonutPosition = 'top' | 'bottom' | 'left' | 'right'

const PersonNode = ({
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
  hovered: DonutPosition | false
}>) => {
  // console.log('PersonNode render', id, data)
  const onNodeButtonPressed = React.useContext(NodeListenerContext)

  const handleDonutClick = useCallback(
    (position: DonutPosition) => {
      // Remember the nodeId and the position
      let newRelationshipAction: NewRelationshipAction | null = null

      switch (position) {
        case 'top': {
          newRelationshipAction = 'addParent'
          break
        }
        case 'bottom': {
          newRelationshipAction = 'addChild'
          break
        }
        case 'left': {
          newRelationshipAction = 'addFriend'
          break
        }
        case 'right': {
          newRelationshipAction = 'addSpouse'
          break
        }
      }

      if (onNodeButtonPressed) onNodeButtonPressed(id, newRelationshipAction)
    },
    [onNodeButtonPressed]
  )

  return (
    <div className='text-center relative' key={`personNode_${id}`}>
      {/* <Handle type='source' position={Position.Top} />
      <Handle type='target' position={Position.Bottom} /> */}
      <Handle id='parents' type='target' position={Position.Top} />
      <Handle id='children' type='source' position={Position.Bottom} />
      <Handle id='friends-spouses-left' type='target' position={Position.Left} />
      <Handle id='friends-spouses-right' type='source' position={Position.Right} />
      {(data.hovered || selected) && !dragging && (
        <>
          {/* Bottom */}
          <DonutSection position='bottom' label='Ajouter un enfant' onClick={handleDonutClick} hovered={data.hovered} />
          {/* Left */}
          <DonutSection label='Ajouter un ami' onClick={handleDonutClick} position='left' hovered={data.hovered} />
          {/* Top */}
          <DonutSection label='Ajouter un parent' onClick={handleDonutClick} position='top' hovered={data.hovered} />
          {/* Right */}
          <DonutSection
            label='Ajouter un compagnon / époux'
            onClick={handleDonutClick}
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

  const [edges, setEdges, onEdgesChange] = useEdgesState([])

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

  const removeHoveredState = useCallback(() => {
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
        setTimeout(removeHoveredState, 100)
      } catch (error) {
        console.error('could not parse the newNodeData', error)
      }
    },
    [reactFlowInstance]
  )

  const [isSearchPanelVisible, showSearchPanel] = useState<boolean>(false)

  const [pendingRelationshipAction, setPendingRelationshipAction] = useState<PendingNodeRelationshipAction | null>(null)

  const onNodeButtonPressed = useCallback((nodeId: string, newRelationshipAction: NewRelationshipAction) => {
    // console.log('top level onNodeButtonPressed', nodeId, newRelationshipAction)
    // Open search panel
    showSearchPanel(true)

    // Move the nodeId and the action to state
    setPendingRelationshipAction({ personId: nodeId as UUID, relationshipAction: newRelationshipAction })
  }, [])

  const onPersonSelected = useCallback<PersonAutocompleteProps['onPersonSelected']>(
    (person) => {
      // console.log('onPersonSelected', person, pendingRelationshipAction)

      if (!pendingRelationshipAction) return

      const { relationshipAction, personId } = pendingRelationshipAction
      addRelationship({ sourcePersonId: personId, targetPerson: person, relationshipAction, persons, setNodes, setEdges })
    },
    [pendingRelationshipAction, reactFlowInstance]
  )

  return (
    <AppLayout>
      <NodeListenerContext.Provider value={onNodeButtonPressed}>
        <UnattachedPersonList persons={persons} nodes={nodes} />
        <ReactFlowProvider>
          <div className='w-full h-screen relative' ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
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
              <Panel position='top-center'>
                <SearchPanel
                  open={isSearchPanelVisible}
                  setOpen={showSearchPanel}
                  onPersonSelected={onPersonSelected}
                  pendingRelationshipAction={pendingRelationshipAction}
                />
              </Panel>
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </NodeListenerContext.Provider>
    </AppLayout>
  )
})

type AddRelationshipArgs = {
  sourcePersonId: UUID // the person that is selected
  targetPerson: { type: 'known'; personId: UUID } | { type: 'unknown'; name: string } // The person that is added to the graph
  relationshipAction: NewRelationshipAction
  persons: Person[]
  setNodes: (nodes: React.SetStateAction<Node[]>) => void
  setEdges: (edges: React.SetStateAction<Edge[]>) => void
}

function addRelationship({
  sourcePersonId,
  targetPerson,
  relationshipAction,
  persons,
  setNodes,
  setEdges,
}: AddRelationshipArgs) {
  let newNode: Node | null = null
  setNodes((nodes) => {
    const currentNode = nodes.find((node) => node.id === sourcePersonId)

    if (!currentNode) return nodes

    const currentNodePosition = currentNode.position

    const profilePicUrl =
      targetPerson.type === 'known'
        ? persons.find((p) => p.personId === targetPerson.personId)!.profilePicUrl
        : fakeProfilePicUrl

    const name =
      targetPerson.type === 'known' ? persons.find((p) => p.personId === targetPerson.personId)!.name : targetPerson.name

    newNode = {
      id: targetPerson.type === 'known' ? targetPerson.personId : getUuid(),
      type: 'person',
      position: {
        x: ['addParent', 'addChild'].includes(relationshipAction)
          ? currentNodePosition.x
          : relationshipAction === 'addFriend'
          ? currentNodePosition.x - 100
          : currentNodePosition.x + 100,
        y: ['addFriend', 'addSpouse'].includes(relationshipAction)
          ? currentNodePosition.y
          : relationshipAction === 'addParent'
          ? currentNodePosition.y - 100
          : currentNodePosition.y + 100,
      },
      data: { label: name, profilePicUrl, hovered: false },
    }

    return [...nodes, newNode]
  })

  setEdges((edges) => {
    if (!newNode) {
      return edges
    }

    let sourceHandle = ''
    let targetHandle = ''
    let source = ''
    let target = ''
    switch (relationshipAction) {
      case 'addChild': {
        source = sourcePersonId
        target = newNode.id
        sourceHandle = 'children'
        targetHandle = 'parents'
        break
      }
      case 'addParent': {
        // On est obligés d'inverser l'ordre
        source = newNode.id
        target = sourcePersonId
        sourceHandle = 'children'
        targetHandle = 'parents'
        break
      }
      case 'addFriend': {
        // Inversion
        source = newNode.id
        target = sourcePersonId
        sourceHandle = 'friends-spouses-right'
        targetHandle = 'friends-spouses-left'
        break
      }
      case 'addSpouse': {
        source = sourcePersonId
        target = newNode.id
        sourceHandle = 'friends-spouses-right'
        targetHandle = 'friends-spouses-left'
        break
      }
    }
    const newEdge: Edge = {
      id: getUuid(),
      source,
      target,
      sourceHandle,
      targetHandle,
    }

    return [...edges, newEdge]
  })
}

type SearchPanelProps = {
  open: boolean
  setOpen: (open: boolean) => void
  onPersonSelected: PersonAutocompleteProps['onPersonSelected']
  pendingRelationshipAction: PendingNodeRelationshipAction | null
}

function SearchPanel({ open, setOpen, onPersonSelected, pendingRelationshipAction }: SearchPanelProps) {
  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog as='div' className='relative z-50' onClose={setOpen}>
        <Transition.Child
          as={React.Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'>
          <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <Transition.Child
              as={React.Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'>
              <Dialog.Panel className='relative transform overflow-visible rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6'>
                <div className='absolute right-0 top-0 hidden pr-4 pt-4 sm:block'>
                  <button
                    type='button'
                    className='rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                    onClick={() => setOpen(false)}>
                    <span className='sr-only'>Close</span>
                    <XMarkIcon className='h-6 w-6' aria-hidden='true' />
                  </button>
                </div>
                <div className='sm:flex sm:items-start'>
                  <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10'>
                    <ExclamationTriangleIcon className='h-6 w-6 text-red-600' aria-hidden='true' />
                  </div>
                  <div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
                    <Dialog.Title as='h3' className='text-base font-semibold leading-6 text-gray-900'>
                      {(() => {
                        if (!pendingRelationshipAction) return 'Ajouter un parent'
                        switch (pendingRelationshipAction.relationshipAction) {
                          case 'addParent': {
                            return 'Ajouter un père ou une mère'
                          }
                          case 'addChild': {
                            return 'Ajouter un fils ou une fille'
                          }
                          case 'addFriend': {
                            return 'Ajouter un ami ou une connaissance'
                          }
                          case 'addSpouse': {
                            return 'Ajouter un compagne, un époux, ...'
                          }
                        }
                      })()}
                    </Dialog.Title>
                    <div className='mt-2'>
                      <PersonAutocomplete
                        onPersonSelected={(props) => {
                          setOpen(false)
                          onPersonSelected(props)
                        }}
                        className='max-w-xl text-gray-800'
                      />
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

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
