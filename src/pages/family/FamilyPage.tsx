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
import { ClientOnly } from '../_components/ClientOnly'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

type Person = {
  profilePicUrl: string | null
  name: string
  personId: UUID
}

type Relationship =
  | {
      type: 'parent'
      parentId: UUID
      childId: UUID
    }
  | {
      type: 'spouses'
      spouseIds: [UUID, UUID] // in which order ? alphabetical on UUID ?
    }
  | {
      type: 'friends'
      friendIds: [UUID, UUID]
    }

type PersonsRelationships = {
  originPersonId: UUID
  persons: Person[]
  relationships: Relationship[]
}

type NodesEdges = {
  nodes: Node[]
  edges: Edge[]
}

const Y_OFFSET = 100

const BUBBLE_RADIUS = 28
const X_OFFSET = 3 * BUBBLE_RADIUS
const COUPLE_NODE_RADIUS = 6
const INNER_DONUT_RADIUS = BUBBLE_RADIUS + 3
const OUTER_DONUT_RADIUS = 60
const ContainerSize = 200

/**
 * Transform a list of persons and relationship to a list of nodes and edges.
 * Reactive function to be executed each time persons/relationships change (to repaint the graph).
 * @param props persons and relationsip
 * @returns nodes and edges
 */
function transferFn({ originPersonId, persons, relationships }: PersonsRelationships): NodesEdges {
  let nodes: Node[] = []
  let edges: Edge[] = []
  type PersonId = UUID

  // Create a node for the originPerson
  const originPerson = persons.find((person) => person.personId === originPersonId)

  if (!originPerson) throw new Error('Could not find origin person in list of persons')

  let currentX = 0
  let currentY = 0

  const originNode = {
    id: originPersonId,
    type: 'person',
    data: { label: originPerson.name, profilePicUrl: originPerson.profilePicUrl, hovered: false },
    position: { x: currentX, y: currentY },
    selectable: true,
    draggable: false,
    selected: true,
  }
  nodes.push(originNode)

  // Add spouse
  const spouseRel = relationships.find(
    (rel): rel is Relationship & { type: 'spouses' } => rel.type === 'spouses' && rel.spouseIds.includes(originPersonId)
  )
  let coupleNode: Node | null = null
  if (spouseRel) {
    const spouseId = spouseRel.spouseIds.find((personId) => personId !== originPersonId)!

    const spouseNode = makePersonNode(spouseId, {
      x: currentX + X_OFFSET,
      y: currentY,
    })
    nodes.push(spouseNode)

    coupleNode = makeCoupleNode(originNode, spouseNode)
    nodes.push(coupleNode)

    const coupleEdges = makeCoupleEdges(coupleNode, originNode, spouseNode)
    edges = edges.concat(coupleEdges)
  }

  // Add parents
  const parents = addParents(originNode)

  // Add grand-parents
  for (const parent of parents) {
    addParents(parent, 1)
  }

  // Add children
  addChildren(coupleNode || originNode, originPersonId)

  function addChildren(personNode: Node, personId: string): Node[] {
    if (!personNode) return []

    const { x: currentX, y: currentY } = personNode.position

    // Look for the persons children
    const childRelationships = relationships.filter(
      (rel): rel is Relationship & { type: 'parent' } => rel.type === 'parent' && rel.parentId === personId
    )

    if (!childRelationships.length) {
      return []
    }

    const children = childRelationships.map((rel) => getPersonById(rel.childId))

    const centerX = currentX - BUBBLE_RADIUS + COUPLE_NODE_RADIUS

    const childNodes = children.map(({ personId: childId }, index, children) => {
      let x = 0
      if (children.length === 1) {
        x = currentX
      } else {
        const count = children.length
        const childrenContainerWidth = (count - 1) * X_OFFSET
        x = centerX - childrenContainerWidth / 2 + index * X_OFFSET
      }
      return makePersonNode(childId, {
        x,
        y: currentY + Y_OFFSET,
      })
    })
    nodes = nodes.concat(childNodes)

    const childEdges = children.map(({ personId: childId }) => ({
      id: `${personId}isParentOf${childId}`,
      source: personNode.id,
      target: childId,
      sourceHandle: 'children',
      targetHandle: 'parents',
    }))
    edges = edges.concat(childEdges)

    return childNodes
  }

  // Ideas to make this nicer:
  // - Do not try to make a fully recursive version, it's overly complex and not interesting, ex: for huge families, you have to put a huge distance between couples
  // - Stay focused on interesting use-cases (quick look at a persons family - as defined statically (children, grand-children, parents, grand-parents), path between two persons, ...)
  // - You can gather information by traversing the graph a first time _before_ traversing to add nodes (when you know what levels have what, choices are easier)
  // - use the user's context (is he a child, parent, grand-parents ? show branches that are adapted, for instance grand-parents think more of their grand-children than of their grand-parents)
  // - open/close branches (auto-close open branches when exploring another branch, makes it easier)
  // - make it possible to traverse by selecting a node (the initial node and the path to it should remain visible - like breadcrumbs)
  function addParents(personNode: Node, level: number = 0): Node[] {
    if (!personNode) return []

    const personId = personNode.id

    const { x: currentX, y: currentY } = personNode.position

    // Look for the persons parents
    const parentRelationships = relationships.filter(
      (rel): rel is Relationship & { type: 'parent' } => rel.type === 'parent' && rel.childId === personId
    )

    if (!parentRelationships.length) {
      return []
    }

    const localXOffset = X_OFFSET / (level + 1)

    const parents = parentRelationships.map((rel) => getPersonById(rel.parentId))

    const parentNodes = parents.map(({ personId }, index, parents) =>
      makePersonNode(personId, {
        x: parents.length === 1 ? currentX : index ? currentX - localXOffset : currentX + localXOffset,
        y: currentY - Y_OFFSET,
      })
    )
    nodes = nodes.concat(parentNodes)

    // Check for siblings
    let hasSiblings = false
    if (parents.length === 2) {
      // Get all unique children of a parent
      // TODO: check if both parents are the parents of the siblings
      const siblingIds = Array.from(
        new Set(
          relationships
            .filter(
              (rel): rel is Relationship & { type: 'parent' } =>
                rel.type === 'parent' && parents.map((p) => p.personId).includes(rel.parentId)
            )
            .map((rel) => rel.childId)
        )
      )

      if (siblingIds.length) {
        hasSiblings = true
        let counter = 0

        const spouse1Node = parentNodes[0]
        const spouse2Node = parentNodes[1]

        const coupleNode = makeCoupleNode(spouse1Node, spouse2Node)
        nodes.push(coupleNode)

        const coupleEdges = makeCoupleEdges(coupleNode, spouse1Node, spouse2Node)
        edges = edges.concat(coupleEdges)

        for (const siblingId of siblingIds) {
          const siblingNode = makePersonNode(siblingId, {
            x: personNode.position.x - 80 * counter++,
            y: personNode.position.y,
          })
          nodes.push(siblingNode)
          edges.push({
            id: `${coupleNode.id}isParentOf${siblingId}`,
            source: coupleNode.id,
            target: siblingId,
            sourceHandle: 'children',
            targetHandle: 'parents',
          })
        }
      }
    }

    if (!hasSiblings) {
      const parentEdges = parents.map(({ personId: parentId }) => ({
        id: `${parentId}isParentOf${personId}`,
        source: parentId,
        target: personId,
        sourceHandle: 'children',
        targetHandle: 'parents',
      }))
      edges = edges.concat(parentEdges)
    }

    return parentNodes
  }

  function makePersonNode(personId: UUID, position: { x: number; y: number }) {
    const person = getPersonById(personId)
    return {
      id: personId,
      type: 'person',
      data: { label: person.name, profilePicUrl: person.profilePicUrl, hovered: false },
      position,
      selectable: true,
      draggable: false,
    }
  }

  function makeCoupleNode(spouse1Node: Node, spouse2Node: Node): Node {
    return {
      id: `${spouse1Node.id}_coupled_${spouse2Node.id}`,
      type: 'couple',
      data: {},
      position: {
        x: (spouse1Node.position.x + spouse2Node.position.x) / 2 + BUBBLE_RADIUS - COUPLE_NODE_RADIUS,
        y: spouse1Node.position.y + BUBBLE_RADIUS - COUPLE_NODE_RADIUS + 2,
      },
    }
  }

  function makeCoupleEdges(coupleNode: Node, spouse1Node: Node, spouse2Node: Node) {
    const leftSpouse = spouse1Node.position.x < spouse2Node.position.x ? spouse1Node : spouse2Node
    const rightSpouse = spouse1Node.position.x > spouse2Node.position.x ? spouse1Node : spouse2Node

    const coupleToRightSpouse = {
      id: `${rightSpouse.id}isSpouseOf${leftSpouse.id}`,
      source: coupleNode.id,
      target: rightSpouse.id,
      sourceHandle: 'couple-right',
      targetHandle: 'person-left',
    }

    const coupleToLeftSpouse = {
      id: `${leftSpouse.id}isSpouseOf${rightSpouse.id}`,
      source: leftSpouse.id,
      target: coupleNode.id,
      sourceHandle: 'person-right',
      targetHandle: 'couple-left',
    }

    return [coupleToRightSpouse, coupleToLeftSpouse]
  }

  function getPersonById(personId: UUID): Person {
    const person = persons.find((person) => person.personId === personId)
    if (!person) throw new Error('Could not find personId in list of persons')

    return person
  }

  return { nodes, edges }
}

type NewRelationshipAction = 'addChild' | 'addParent' | 'addFriend' | 'addSpouse'
type PendingNodeRelationshipAction = {
  personId: UUID
  relationshipAction: NewRelationshipAction
}

const NodeListenerContext = React.createContext<((nodeId: string, relationshipAction: NewRelationshipAction) => void) | null>(
  null
)

const nodeTypes = {
  person: PersonNode,
  couple: CoupleNode,
}

export type FamilyPageProps = {
  initialPersons: Person[]
  initialRelationships: Relationship[]
  originPersonId: UUID
}

export const FamilyPage = withBrowserBundle((props: FamilyPageProps) => {
  return (
    <ClientOnly>
      <ClientOnlyFamilyPage {...props} />
    </ClientOnly>
  )
})

const ClientOnlyFamilyPage = ({ initialPersons, initialRelationships, originPersonId }: FamilyPageProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [persons, setPersons] = useState(initialPersons)
  const [relationships, setRelationships] = useState(initialRelationships)

  React.useEffect(() => {
    const { nodes, edges } = transferFn({ persons, relationships, originPersonId })

    console.log('useEffect', { persons, relationships, nodes, edges })

    const uniqueNodes = new Map<string, Node>()
    for (const node of nodes) {
      uniqueNodes.set(node.id, node)
    }
    const uniqueEdges = new Map<string, Edge>()
    for (const edge of edges) {
      uniqueEdges.set(edge.id, edge)
    }
    setNodes(Array.from(uniqueNodes.values()))
    setEdges(Array.from(uniqueEdges.values()))
  }, [persons, relationships, reactFlowInstance])

  const [origX, setOrigX] = useState<number | undefined>()
  const [origY, setOrigY] = useState<number | undefined>()

  // const onNodeDragStart = useCallback((e: React.MouseEvent, node: Node) => {
  //   dragRef.current = node
  //   setOrigX(node.position.x)
  //   setOrigY(node.position.y)
  //   setNodes((nodes) =>
  //     nodes.map((node) => {
  //       if (node.id === originPersonId) {
  //         node.data = { ...node.data, hovered: false }
  //       }
  //       return node
  //     })
  //   )
  // }, [])

  // const onNodeDrag = useCallback((evt: React.MouseEvent, draggedNode: Node) => {
  //   // calculate the center point of the node from position and dimensions
  //   const centerX = draggedNode.position.x + draggedNode.width! / 2
  //   const centerY = draggedNode.position.y + draggedNode.height! / 2

  //   setNodes((nodes) =>
  //     nodes.map((node) => {
  //       if (node.id === originPersonId) {
  //         const targetCenterX = node.position.x + node.width! / 2
  //         const targetCenterY = node.position.y + node.height! / 2
  //         if (
  //           centerX > targetCenterX + OuterDonutRadius + BubbleR ||
  //           centerX < targetCenterX - OuterDonutRadius - BubbleR ||
  //           centerY > targetCenterY + OuterDonutRadius + BubbleR ||
  //           centerY < targetCenterY - OuterDonutRadius - BubbleR
  //         ) {
  //           node.data = { ...node.data, hovered: false }
  //         } else {
  //           if (centerX > targetCenterX - 30 && centerX < targetCenterX + 30) {
  //             if (centerY > targetCenterY) {
  //               node.data = { ...node.data, hovered: 'bottom' }
  //             } else {
  //               node.data = { ...node.data, hovered: 'top' }
  //             }
  //           } else {
  //             if (centerX > targetCenterX) {
  //               node.data = { ...node.data, hovered: 'right' }
  //             } else {
  //               node.data = { ...node.data, hovered: 'left' }
  //             }
  //           }
  //         }
  //       }
  //       return node
  //     })
  //   )

  //   // Find on which pad it is hovering
  // }, [])

  // const onNodeDragStop = useCallback(
  //   (evt: React.MouseEvent, draggedNode: Node) => {
  //     // on drag stop, either create a relationship or not
  //     setNodes((nodes) =>
  //       nodes.map((node) => {
  //         if (node.id === originPersonId) {
  //           node.data = { ...node.data, hovered: false }
  //         }

  //         if (node.id === draggedNode.id) {
  //           node.position = { x: origX!, y: origY! }
  //         }
  //         return node
  //       })
  //     )

  //     dragRef.current = null
  //   },
  //   [origX, origY]
  // )

  // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // const onDragOver: React.DragEventHandler = useCallback(
  //   (event) => {
  //     event.preventDefault()
  //     event.dataTransfer.dropEffect = 'move'

  //     if (!reactFlowWrapper.current) {
  //       console.error('wrapper not current')
  //       return
  //     }

  //     if (!reactFlowInstance) {
  //       console.error('reactFlowInstance not ok')
  //       return
  //     }

  //     const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
  //     const position = reactFlowInstance.project({
  //       x: event.clientX - reactFlowBounds.left,
  //       y: event.clientY - reactFlowBounds.top,
  //     })

  //     const centerX = position.x
  //     const centerY = position.y

  //     setNodes((nodes) => {
  //       // console.log('onDragOver setNodes')
  //       return nodes.map((node) => {
  //         // console.log('setNodes looking at ', node.id, originPersonId)
  //         if (node.id === originPersonId) {
  //           const targetCenterX = node.position.x + node.width! / 2
  //           const targetCenterY = node.position.y + node.height! / 2
  //           if (
  //             centerX > targetCenterX + OUTER_DONUT_RADIUS + BUBBLE_RADIUS ||
  //             centerX < targetCenterX - OUTER_DONUT_RADIUS - BUBBLE_RADIUS ||
  //             centerY > targetCenterY + OUTER_DONUT_RADIUS + BUBBLE_RADIUS ||
  //             centerY < targetCenterY - OUTER_DONUT_RADIUS - BUBBLE_RADIUS
  //           ) {
  //             node.data = { ...node.data, hovered: false }
  //           } else {
  //             if (centerX > targetCenterX - 30 && centerX < targetCenterX + 30) {
  //               if (centerY > targetCenterY) {
  //                 node.data = { ...node.data, hovered: 'bottom' }
  //               } else {
  //                 node.data = { ...node.data, hovered: 'top' }
  //               }
  //             } else {
  //               if (centerX > targetCenterX) {
  //                 node.data = { ...node.data, hovered: 'right' }
  //               } else {
  //                 node.data = { ...node.data, hovered: 'left' }
  //               }
  //             }
  //           }
  //         }

  //         return node
  //       })
  //     })
  //   },
  //   [reactFlowInstance]
  // )

  // const removeHoveredState = useCallback(() => {
  //   setNodes((nodes) =>
  //     nodes.map((node) => {
  //       if (!!node.data.hovered) {
  //         node.data = { ...node.data, hovered: false }
  //       }
  //       return node
  //     })
  //   )
  // }, [])

  // const onDrop: React.DragEventHandler = useCallback(
  //   (event) => {
  //     event.preventDefault()

  //     const newNodeDataEncoded = event.dataTransfer.getData('application/reactflow')

  //     // check if the dropped element is valid
  //     if (typeof newNodeDataEncoded === 'undefined' || !newNodeDataEncoded) {
  //       return
  //     }

  //     try {
  //       const newNodeData: Person = JSON.parse(newNodeDataEncoded)
  //       const { personId, name, profilePicUrl } = newNodeData

  //       setNodes((nodes) => {
  //         const targettedNode = nodes.find((node) => !!node.data.hovered)

  //         if (targettedNode && targettedNode.data.hovered !== false) {
  //           const { hovered } = targettedNode.data
  //           const newNode = {
  //             id: personId,
  //             type: 'person',
  //             position: {
  //               x: ['top', 'bottom'].includes(hovered) ? 0 : hovered === 'left' ? -100 : 100,
  //               y: ['right', 'left'].includes(hovered) ? 0 : hovered === 'top' ? -100 : 100,
  //             }, // TODO
  //             data: { label: name, profilePicUrl, hovered: false },
  //           }

  //           // targettedNode.data = { ...targettedNode.data, hovered: false }

  //           const newNodes = [...nodes, newNode]
  //           // console.log('onDrop newNodes', newNodes)

  //           return newNodes
  //         }

  //         return nodes
  //       })

  //       // Barbaric fix to have the hovered nodes pass to unhovered
  //       setTimeout(removeHoveredState, 100)
  //     } catch (error) {
  //       console.error('could not parse the newNodeData', error)
  //     }
  //   },
  //   [reactFlowInstance]
  // )

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

      const { relationshipAction, personId: sourcePersonId } = pendingRelationshipAction

      const targetPerson = person.type === 'unknown' ? { personId: getUuid(), name: person.name } : person

      const newPersonId = targetPerson.personId

      // console.log('onPersonSelected', { newPersonId, sourcePersonId })

      // Add Node if new person (call setPersons)
      setPersons((persons) => {
        if (targetPerson) {
          return [...persons, targetPerson as Person]
        }

        return persons
      })

      // Add Relationship
      setRelationships((relationships) => {
        switch (relationshipAction) {
          case 'addChild':
            return [...relationships, { type: 'parent', childId: newPersonId, parentId: sourcePersonId }]
          case 'addParent':
            return [...relationships, { type: 'parent', childId: sourcePersonId, parentId: newPersonId }]
          case 'addFriend':
            return [...relationships, { type: 'friends', friendIds: [newPersonId, sourcePersonId] }]
          case 'addSpouse':
            return [...relationships, { type: 'spouses', spouseIds: [newPersonId, sourcePersonId] }]
        }
      })
    },
    [pendingRelationshipAction, reactFlowInstance]
  )

  return (
    <AppLayout>
      <NodeListenerContext.Provider value={onNodeButtonPressed}>
        {/* <UnattachedPersonList persons={persons} nodes={nodes} /> */}
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
              // onDragOver={onDragOver}
              // onDrop={onDrop}
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
}

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

  let relationAlreadyExistedForTargetId: string | false = false

  setNodes((initialNodes) => {
    let nodes = initialNodes

    const targetNode = targetPerson.type === 'known' && nodes.find((node) => node.id === targetPerson.personId)

    if (targetNode) {
      relationAlreadyExistedForTargetId = targetNode.id
      // remove the old node
      nodes.splice(nodes.findIndex((node) => node.id === targetPerson.personId) + 1)
    }

    const currentNode = nodes.find((node) => node.id === sourcePersonId)

    if (!currentNode) return nodes

    const currentNodePosition = currentNode.position

    const profilePicUrl =
      targetPerson.type === 'known' ? persons.find((p) => p.personId === targetPerson.personId)!.profilePicUrl : null

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

  setEdges((initialEdges) => {
    let edges = [...initialEdges]

    if (!newNode) {
      return edges
    }

    if (relationAlreadyExistedForTargetId) {
      edges = edges.filter(
        ({ source, target }) => source !== relationAlreadyExistedForTargetId && target !== relationAlreadyExistedForTargetId
      )
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
        sourceHandle = 'person-right'
        targetHandle = 'person-left'
        break
      }
      case 'addSpouse': {
        source = sourcePersonId
        target = newNode.id
        sourceHandle = 'person-right'
        targetHandle = 'person-left'
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

type DonutProps = {
  position: DonutPosition
  hovered?: DonutPosition | false
  className?: string
  style?: React.CSSProperties
  svgStyle?: React.CSSProperties
  label?: string
  onClick?: (position: DonutPosition) => unknown
}
type DonutPosition = 'top' | 'bottom' | 'left' | 'right'

const DonutSection = ({ position, className, style, svgStyle, hovered, label, onClick }: DonutProps) => {
  const isActive = hovered === position
  const [isHovered, setHovered] = useState<boolean>(false)

  // Calculate the center of the container
  const cx = ContainerSize / 2
  const cy = ContainerSize / 2

  const circleR = 3
  const circlePadding = 10
  const circleDistance = BUBBLE_RADIUS / 2 + circleR / 2 + 10 + circlePadding

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
      textTop = cy - 55
      circleLeft = cx
      circleTop = cy - circleDistance
      break
    case 'left':
      sliceStartAngle = 137
      sliceStopAngle = 223
      textLeft = cx - 110
      textTop = cy
      circleLeft = cx - circleDistance
      circleTop = cy
      break
    case 'right':
      sliceStartAngle = 317
      sliceStopAngle = 43
      textLeft = cx + 35
      textTop = cy - 10
      circleLeft = cx + circleDistance
      circleTop = cy
      break
    case 'bottom':
      sliceStartAngle = 47
      sliceStopAngle = 133
      textLeft = cx - 35
      textTop = cy + 38
      circleLeft = cx
      circleTop = cy + circleDistance
      break
  }

  // Convert angles to radians
  const startAngle = (Math.PI * sliceStartAngle) / 180
  const stopAngle = (Math.PI * sliceStopAngle) / 180

  // Calculate the starting and stopping coordinates for the inner and outer arcs
  const xOuterStart = cx + OUTER_DONUT_RADIUS * Math.cos(startAngle)
  const yOuterStart = cy + OUTER_DONUT_RADIUS * Math.sin(startAngle)
  const xOuterStop = cx + OUTER_DONUT_RADIUS * Math.cos(stopAngle)
  const yOuterStop = cy + OUTER_DONUT_RADIUS * Math.sin(stopAngle)

  const xInnerStart = cx + INNER_DONUT_RADIUS * Math.cos(startAngle)
  const yInnerStart = cy + INNER_DONUT_RADIUS * Math.sin(startAngle)
  const xInnerStop = cx + INNER_DONUT_RADIUS * Math.cos(stopAngle)
  const yInnerStop = cy + INNER_DONUT_RADIUS * Math.sin(stopAngle)

  // Create the SVG path using the calculated coordinates
  const pathData = `
        M ${xOuterStart},${yOuterStart}
        A ${OUTER_DONUT_RADIUS},${OUTER_DONUT_RADIUS} 0 ${
    stopAngle - startAngle > Math.PI ? 1 : 0
  },1 ${xOuterStop},${yOuterStop}
        L ${xInnerStop},${yInnerStop}
        A ${INNER_DONUT_RADIUS},${INNER_DONUT_RADIUS} 0 ${
    stopAngle - startAngle > Math.PI ? 1 : 0
  },0 ${xInnerStart},${yInnerStart}
        Z
    `

  const maskId = `mask-${position}`

  // Construct the SVG element
  return (
    <div
      key={`donut_${position}`}
      className={`absolute pointer-events-none ${className}`}
      style={{
        top: BUBBLE_RADIUS - ContainerSize / 2,
        left: BUBBLE_RADIUS - ContainerSize / 2,
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
          <path d={pathData.trim()} fill='white' />
        </mask>
        <circle
          className='transition-all duration-700 ease-in-out'
          cx={circleLeft}
          cy={circleTop}
          r={`${isActive || isHovered ? ContainerSize / 2 : circleR}`}
          mask={`url(#${maskId})`}
          fill={`${isActive || isHovered ? 'rgb(79 70 229)' : '#D3D3D3'}`}
        />

        {/** this is an invisible path to catch mouse events */}
        <path
          className='pointer-events-auto bg-indigo'
          onMouseOver={() => setHovered(true)}
          onMouseOut={() => setHovered(false)}
          d={`${pathData.trim()}`}
          fill='rgba(0,0,0,0)'
          onClick={() => onClick?.(position)}
        />
      </svg>
      {!!label && (isActive || isHovered) && (
        <div
          className='absolute'
          style={{
            fontSize: 8,
            top: textTop,
            left: textLeft,
          }}>
          <span className='inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-indigo-700 ring-1 ring-inset ring-indigo-700/10'>
            {label}
          </span>
        </div>
      )}
    </div>
  )
}

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

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
      <Handle id='couple-left' type='target' style={{ opacity: 0, left: 3 }} position={Position.Left} />
      <Handle id='couple-right' type='source' style={{ opacity: 0, right: 3 }} position={Position.Right} />
      <Handle id='children' type='source' style={{ opacity: 0, bottom: 3 }} position={Position.Bottom} />
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
  hovered: DonutPosition | false
  isOriginPerson?: true
}>) {
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
      <Handle id='parents' type='target' style={{ opacity: 0 }} position={Position.Top} />
      <Handle id='children' type='source' style={{ opacity: 0 }} position={Position.Bottom} />
      <Handle id='person-left' type='target' style={{ opacity: 0 }} position={Position.Left} />
      <Handle id='person-right' type='source' style={{ opacity: 0 }} position={Position.Right} />
      {(data.hovered || selected) && (
        <>
          {/* Bottom */}
          <DonutSection
            position='bottom'
            label='Ajouter un enfant'
            onClick={handleDonutClick}
            hovered={data.hovered}
            className='z-20' // To go over the name label
          />
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

      <div className='relative'>
        {data.profilePicUrl ? (
          <img
            src={data.profilePicUrl}
            className={`inline-block rounded-full h-14 w-14 ring-2 ${selected ? 'ring-indigo-500' : 'ring-white'} shadow-sm`}
          />
        ) : (
          <span className='inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-500'>
            <span className='text-xl font-medium leading-none text-white'>{getInitials(data.label)}</span>
          </span>
        )}
        <div className='absolute w-full -mt-1 pointer-events-none z-10'>
          <span
            style={{ fontSize: 8 }}
            className='inline-flex  items-center rounded-md bg-gray-50 px-1 py-0.5   text-gray-600 ring-1 ring-inset ring-gray-500/10'>
            {data.label}
          </span>
        </div>
      </div>
      {/* {<div>{data?.label}</div>} */}
      {/* <Handle type='source' position={sourcePosition} isConnectable={isConnectable} /> */}
    </div>
  )
}

function getInitials(name: string): string {
  // Split the name into words using whitespace or hyphen as separators
  const words = name.split(/\s|-/)

  // Initialize an empty string to store the initials
  let initials = ''

  // Iterate through the words and append the first character of each word to the initials string
  for (const word of words) {
    if (word.length > 0) {
      initials += word[0].toUpperCase()
    }
  }

  return initials
}
