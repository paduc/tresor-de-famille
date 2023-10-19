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
  origin: {
    personId: UUID
    x: number
    y: number
  }
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
function transferFn({ origin, persons, relationships }: PersonsRelationships): NodesEdges {
  const { personId: originPersonId, x: currentX, y: currentY } = origin

  let nodes: Node[] = []
  let edges: Edge[] = []

  // Create a node for the originPerson
  const originPerson = persons.find((person) => person.personId === originPersonId)

  if (!originPerson) throw new Error('Could not find origin person in list of persons')

  const originNode = {
    id: originPersonId,
    type: 'person',
    data: { label: originPerson.name, profilePicUrl: originPerson.profilePicUrl, isOriginPerson: true },
    position: { x: currentX, y: currentY },
    selected: false,
    draggable: false,
  }
  nodes.push(originNode)

  // Add spouse
  const spouseRel = relationships.find(
    (rel): rel is Relationship & { type: 'spouses' } => rel.type === 'spouses' && rel.spouseIds.includes(originPersonId)
  )
  let coupleNode: Node | null = null
  const spouseIds: UUID[] = []
  if (spouseRel) {
    const spouseId = spouseRel.spouseIds.find((personId) => personId !== originPersonId)!

    const spouseNode = makePersonNode(spouseId, {
      x: currentX + X_OFFSET,
      y: currentY,
    })
    nodes.push(spouseNode)

    spouseIds.push(spouseId)

    coupleNode = makeCoupleNode(originNode, spouseNode)
    nodes.push(coupleNode)

    const coupleEdges = makeCoupleEdges(coupleNode, originNode, spouseNode)
    edges = edges.concat(coupleEdges)
  }

  // Add parents
  const parentNodes = addParents(originNode)

  // Add siblings
  addSiblings(originNode, parentNodes)

  // Add grand-parents
  for (const parent of parentNodes) {
    addParents(parent, 1)
  }

  // Add children
  addChildren(originNode, originPersonId)

  function addChildren(parentNode: Node, personId: string) {
    if (!parentNode) return []

    const { x: currentX, y: currentY } = parentNode.position

    // Look for the persons children
    const childRelationships = relationships.filter(
      (rel): rel is Relationship & { type: 'parent' } => rel.type === 'parent' && rel.parentId === personId
    )

    if (!childRelationships.length) {
      return []
    }

    const childIds = new Set<UUID>(childRelationships.map((rel) => rel.childId))

    const childCount = childIds.size

    // Create a centered box with ALL the children
    const CHILD_GAP = BUBBLE_RADIUS / 2
    const childrenBoxWidth = childCount * BUBBLE_RADIUS * 2 + (childCount - 1) * CHILD_GAP
    const childrenBoxX = parentNode.position.x + BUBBLE_RADIUS

    type ChildId = UUID

    type CoupleNodeId = string

    const uniqueParentIds = new Set<UUID>(spouseIds) // Add the spouses so they appear in uniqueParentIds.size()

    const coupleChildren = new Map<CoupleNodeId, ChildId[]>()
    for (const childId of childIds) {
      const parents = getParents(childId)
      const [parent1Id, parent2Id] = parents
      parent1Id && uniqueParentIds.add(parent1Id)
      parent2Id && uniqueParentIds.add(parent2Id)
      const { coupleNode, edges: newEdges, parent2Node } = getCoupleNode(parent1Id, parent2Id)
      if (parent2Node) {
        nodes.push(coupleNode)
        nodes.push(parent2Node)

        parent2Node.position.x =
          parentNode.position.x + (uniqueParentIds.size - 1) * (BUBBLE_RADIUS * 2 + COUPLE_NODE_RADIUS * 2 + 20)
        coupleNode.position.x = parent2Node.position.x - (COUPLE_NODE_RADIUS * 2 + 10)
      }
      if (newEdges && newEdges.length) {
        edges = edges.concat(newEdges)
      }
      if (!coupleChildren.has(coupleNode.id)) {
        coupleChildren.set(coupleNode.id, [])
      }
      coupleChildren.get(coupleNode.id)!.push(childId)
    }

    // Il y a un probleme dans le sort pour le cas en core

    const couplesSortedByX: [string, UUID[]][] = Array.from(coupleChildren.keys())
      .sort((a, b) => {
        const nodeA = findNode(a)
        const xA = nodeA ? nodeA.position.x : Infinity
        const nodeB = findNode(b)
        const xB = nodeB ? nodeB.position.x : Infinity
        return xA - xB
      })
      .map((coupleId) => {
        return [coupleId, coupleChildren.get(coupleId)!]
      })

    // console.log(couplesSortedByX)

    let childIndex = 0
    let childNodes: Node[] = []
    for (const [coupleId, children] of couplesSortedByX) {
      for (const childId of children) {
        const childNode = makePersonNode(childId, {
          x: childrenBoxX + childIndex++ * (2 * BUBBLE_RADIUS + CHILD_GAP) - childrenBoxWidth / 2,
          y: currentY + Y_OFFSET,
        })
        childNodes.push(childNode)
        edges.push(makeParentChildEdge(coupleId, childId))
      }
    }

    nodes = nodes.concat(childNodes)
    // }

    return
  }

  function findCoupleNode(parent1Id: string, parent2Id?: string): Node | undefined {
    if (!parent2Id) return findPersonNode(parent1Id)
    return nodes.find((node) => node.type === 'couple' && node.id.includes(parent1Id) && node.id.includes(parent2Id))
  }

  function getCoupleNode(parent1Id: string, parent2Id?: string): { coupleNode: Node; parent2Node?: Node; edges?: Edge[] } {
    const node = findCoupleNode(parent1Id, parent2Id)
    if (node) return { coupleNode: node, edges: [] }

    const parent1Node = findPersonNode(parent1Id)
    if (!parent1Node) {
      throw new Error('getCoupleNode could not find parent1Node')
    }

    if (parent2Id) {
      let parent2Node = findPersonNode(parent2Id)
      let parent2NodeExisted = true
      if (!parent2Node) {
        parent2NodeExisted = false
        parent2Node = makePersonNode(parent2Id as UUID, { x: parent1Node.position.x + 100, y: 0 }) // place it arbitrarily on the right of the parent1Node so that makeCoupleEdges knows to which handles to connect
      }

      const coupleNode = makeCoupleNode(parent1Node, parent2Node)
      const edges = makeCoupleEdges(coupleNode, parent1Node, parent2Node)

      return {
        coupleNode,
        parent2Node: parent2NodeExisted ? undefined : parent2Node,
        edges,
      }
    }

    // Single parent
    return {
      coupleNode: parent1Node,
    }
  }

  function findPersonNode(personId: string): Node | undefined {
    return nodes.find((node) => node.type === 'person' && node.id === personId)
  }

  function findNode(nodeId: string): Node | undefined {
    return nodes.find((node) => node.id === nodeId)
  }

  // Ideas to make this nicer:
  // - Do not try to make a fully recursive version, it's overly complex and not interesting, ex: for huge families, you have to put a huge distance between couples
  // - Stay focused on interesting use-cases (quick look at a persons family - as defined statically (children, grand-children, parents, grand-parents), path between two persons, ...)
  // - You can gather information by traversing the graph a first time _before_ traversing to add nodes (when you know what levels have what, choices are easier)
  // - use the user's context (is he a child, parent, grand-parents ? show branches that are adapted, for instance grand-parents think more of their grand-children than of their grand-parents)
  // - open/close branches (auto-close open branches when exploring another branch, makes it easier)
  // - make it possible to traverse by selecting a node (the initial node and the path to it should remain visible - like breadcrumbs)
  function addParents(personNode: Node, level: number = 0): [] | [Node] | [Node, Node] {
    if (!personNode) return []

    const personId = personNode.id

    const { x: currentX, y: currentY } = personNode.position

    // Look for the persons parents
    const parentIds = relationships
      .filter((rel): rel is Relationship & { type: 'parent' } => rel.type === 'parent' && rel.childId === personId)
      .map((rel) => rel.parentId)

    if (!parentIds.length) return []

    const [parent1Id, parent2Id] = new Set(parentIds)

    const localXOffset = X_OFFSET / (level + 1)

    const singleParent = !parent2Id
    const parent1Node = makePersonNode(parent1Id, {
      x: singleParent ? currentX : currentX - localXOffset,
      y: currentY - Y_OFFSET,
    })
    nodes.push(parent1Node)

    if (!singleParent) {
      const parent2Node = makePersonNode(parent2Id, {
        x: currentX + localXOffset,
        y: currentY - Y_OFFSET,
      })
      nodes.push(parent2Node)

      // Make couple node here
      const coupleNode = makeCoupleNode(parent1Node, parent2Node)
      nodes.push(coupleNode)

      // Edge from the person to his parents' couple node
      const coupleEdges = makeCoupleEdges(coupleNode, parent1Node, parent2Node)
      edges = edges.concat(coupleEdges)

      edges.push({
        id: `${coupleNode.id}isParentOf${personId}`,
        source: coupleNode.id,
        target: personId,
        sourceHandle: 'children',
        targetHandle: 'parents',
      })

      return [parent1Node, parent2Node]
    }

    // Edge from the person to his single parent node
    edges.push({
      id: `${parent1Node.id}isParentOf${personId}`,
      source: parent1Node.id,
      target: personId,
      sourceHandle: 'children',
      targetHandle: 'parents',
    })
    return [parent1Node]
  }

  function getParents(personId: string): Set<UUID> {
    const rels = relationships.filter(
      (rel): rel is Relationship & { type: 'parent' } => rel.type === 'parent' && rel.childId === personId
    )

    return new Set(rels.map((rel) => rel.parentId))
  }

  function addSiblings(personNode: Node, parentNodes: ReturnType<typeof addParents>): number {
    const personId = personNode.id

    const { x: currentX, y: currentY } = personNode.position

    const [parent1Id, parent2Id] = parentNodes.map((node) => node.id)

    // Look for persons with the same relationships
    const siblingParentRelationships = relationships.filter(
      (rel): rel is Relationship & { type: 'parent' } =>
        rel.type === 'parent' && rel.childId !== personId && (rel.parentId === parent1Id || rel.parentId === parent2Id)
    )

    type SiblingId = string
    type ParentId = string

    const siblingIds = new Set<SiblingId>(siblingParentRelationships.map((rel) => rel.childId))

    const siblingParentMap = new Map<SiblingId, Set<ParentId>>()
    for (const siblingId of siblingIds) {
      siblingParentMap.set(siblingId, getParents(siblingId))
    }

    // Determine the true siblings (=same parents) and halfsiblings (=one parent)
    const trueSiblings = new Set<string>()
    const halfSiblings = new Set<[SiblingId, ParentId]>()
    for (const [childId, parentIdSet] of siblingParentMap.entries()) {
      const hasParent1 = parentIdSet.has(parent1Id)
      if (hasParent1 && (!parent2Id || parentIdSet.has(parent2Id))) {
        trueSiblings.add(childId)
      } else {
        // Can only happen with 2 parents
        halfSiblings.add([childId, hasParent1 ? parent1Id : parent2Id])
      }
    }

    let counter = 0
    if (parent2Id) {
      if (trueSiblings.size) {
        // Two parents
        // Look for couple node
        const coupleNode = findCoupleNode(parent1Id, parent2Id)

        if (!coupleNode) return 0

        for (const siblingId of trueSiblings) {
          const siblingNode = makePersonNode(siblingId as UUID, {
            x: personNode.position.x - 80 * ++counter,
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

      if (halfSiblings.size) {
        for (const [siblingId, parentId] of halfSiblings) {
          const siblingNode = makePersonNode(siblingId as UUID, {
            x: personNode.position.x - 80 * ++counter,
            y: personNode.position.y,
          })
          nodes.push(siblingNode)
          edges.push({
            id: `${parentId}isParentOf${siblingId}`,
            source: parentId,
            target: siblingId,
            sourceHandle: 'children',
            targetHandle: 'parents',
          })
        }
      }

      return trueSiblings.size + halfSiblings.size
    }

    // One parent
    // use the parent node
    for (const siblingId of trueSiblings) {
      const siblingNode = makePersonNode(siblingId as UUID, {
        x: personNode.position.x - 80 * ++counter,
        y: personNode.position.y,
      })
      nodes.push(siblingNode)
      edges.push({
        id: `${parent1Id}isParentOf${siblingId}`,
        source: parent1Id,
        target: siblingId,
        sourceHandle: 'children',
        targetHandle: 'parents',
      })
    }

    return trueSiblings.size
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

  function makeParentChildEdge(parentId: string, childId: string) {
    return {
      id: `${parentId}isParentOf${childId}`,
      source: parentId,
      target: childId,
      sourceHandle: 'children',
      targetHandle: 'parents',
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
  initialOriginPersonId: UUID
}

export const FamilyPage = withBrowserBundle((props: FamilyPageProps) => {
  return (
    <ClientOnly>
      <ClientOnlyFamilyPage {...props} />
    </ClientOnly>
  )
})

const ClientOnlyFamilyPage = ({ initialPersons, initialRelationships, initialOriginPersonId }: FamilyPageProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [persons, setPersons] = useState(initialPersons)
  const [relationships, setRelationships] = useState(initialRelationships)
  const [origin, setOrigin] = useState<{ personId: UUID; x: number; y: number }>({
    personId: initialOriginPersonId,
    x: 0,
    y: 0,
  })

  React.useEffect(() => {
    const { nodes, edges } = transferFn({ persons, relationships, origin })

    // console.log('useEffect', { persons, relationships, nodes, edges })

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
  }, [persons, relationships, origin, reactFlowInstance])

  // const [origX, setOrigX] = useState<number | undefined>()
  // const [origY, setOrigY] = useState<number | undefined>()

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

  const [pendingRelationshipAction, setPendingRelationshipAction] = useState<PendingNodeRelationshipAction | null>(null)

  const onRelationshipButtonPressed = useCallback((nodeId: string, newRelationshipAction: NewRelationshipAction) => {
    // Move the nodeId and the action to state
    setPendingRelationshipAction({ personId: nodeId as UUID, relationshipAction: newRelationshipAction })
  }, [])

  const onSearchPersonSelected = useCallback<SearchPanelProps['onPersonSelected']>(
    (args) => {
      if (args === null) {
        setPendingRelationshipAction(null)
        return
      }

      const { selectedPerson, sourcePersonId, relationshipAction } = args

      // console.log('onPersonSelected', { newPersonId, sourcePersonId })

      const { newPerson, targetPersonId } = getNewPerson(selectedPerson)

      // Add Node if new person (call setPersons)
      setPersons((persons) => {
        if (newPerson) {
          return [...persons, newPerson as Person]
        }

        return persons
      })

      const newRelationship = getNewRelationship()

      // Add Relationship
      setRelationships((relationships) => {
        return [...relationships, newRelationship]
      })

      // TODO: if error, revert change
      saveNewRelationship({ newPerson, relationship: newRelationship })

      setPendingRelationshipAction(null)

      function getNewPerson(person: Exclude<typeof selectedPerson, null>): { newPerson?: Person; targetPersonId: UUID } {
        if (person.type === 'unknown') {
          const newPersonId = getUuid()
          return {
            newPerson: { personId: newPersonId, name: person.name, profilePicUrl: null },
            targetPersonId: newPersonId,
          }
        }

        return { targetPersonId: person.personId }
      }

      function getNewRelationship(): Relationship {
        switch (relationshipAction) {
          case 'addChild':
            return { type: 'parent', childId: targetPersonId, parentId: sourcePersonId }
          case 'addParent':
            return { type: 'parent', childId: sourcePersonId, parentId: targetPersonId }
          case 'addFriend':
            return { type: 'friends', friendIds: [targetPersonId, sourcePersonId] }
          case 'addSpouse':
            return { type: 'spouses', spouseIds: [targetPersonId, sourcePersonId] }
        }
      }
    },
    [reactFlowInstance]
  )

  const unselectableIds = React.useMemo(() => {
    if (!pendingRelationshipAction) return []

    const { relationshipAction, personId } = pendingRelationshipAction

    switch (relationshipAction) {
      case 'addChild':
        return relationships
          .filter((rel): rel is Relationship & { type: 'parent' } => rel.type === 'parent' && rel.parentId === personId)
          .map((rel) => rel.childId)
      case 'addParent':
        return relationships
          .filter((rel): rel is Relationship & { type: 'parent' } => rel.type === 'parent' && rel.childId === personId)
          .map((rel) => rel.parentId)
      case 'addFriend':
        return relationships
          .filter(
            (rel): rel is Relationship & { type: 'friends' } => rel.type === 'friends' && rel.friendIds.includes(personId)
          )
          .flatMap((rel) => rel.friendIds.filter((fId) => fId !== personId))
      case 'addSpouse':
      case 'addFriend':
        return relationships
          .filter(
            (rel): rel is Relationship & { type: 'spouses' } => rel.type === 'spouses' && rel.spouseIds.includes(personId)
          )
          .flatMap((rel) => rel.spouseIds.filter((sId) => sId !== personId))
    }

    return []
  }, [pendingRelationshipAction, relationships])

  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      if (nodes.length === 1) {
        const selectedNode = nodes[0]
        if (selectedNode.id === origin.personId) return
        const { x, y } = selectedNode.position
        setOrigin({ personId: selectedNode.id as UUID, x, y })
      }
    },
    [reactFlowInstance, origin]
  )

  return (
    <AppLayout>
      <NodeListenerContext.Provider value={onRelationshipButtonPressed}>
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
              onSelectionChange={onSelectionChange}
              nodeTypes={nodeTypes}
              fitView>
              <Background />
              <Panel position='top-center'>
                <SearchPanel
                  onPersonSelected={onSearchPersonSelected}
                  pendingRelationshipAction={pendingRelationshipAction}
                  unselectableIds={unselectableIds}
                />
              </Panel>
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </NodeListenerContext.Provider>
    </AppLayout>
  )
}

type SearchPanelProps = {
  onPersonSelected: (
    args: {
      selectedPerson: { type: 'known'; personId: UUID } | { type: 'unknown'; name: string }
      sourcePersonId: UUID
      relationshipAction: NewRelationshipAction
    } | null
  ) => unknown
  pendingRelationshipAction: PendingNodeRelationshipAction | null
  unselectableIds: string[]
}

function SearchPanel({ onPersonSelected, pendingRelationshipAction, unselectableIds: nodeIds }: SearchPanelProps) {
  const close = () => onPersonSelected(null)

  return (
    <Transition.Root show={!!pendingRelationshipAction} as={React.Fragment}>
      <Dialog as='div' className='relative z-50' onClose={close}>
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
          <div className='flex sm:min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
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
                    onClick={close}>
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
                        onPersonSelected={(person) => {
                          if (!pendingRelationshipAction) return
                          const { personId, relationshipAction } = pendingRelationshipAction
                          onPersonSelected({
                            selectedPerson: person,
                            sourcePersonId: personId,
                            relationshipAction,
                          })
                        }}
                        unselectableIds={nodeIds}
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

const DonutSection = ({ position, className, style, svgStyle, label, onClick }: DonutProps) => {
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
          r={`${isHovered ? ContainerSize / 2 : circleR}`}
          mask={`url(#${maskId})`}
          fill={`${isHovered ? 'rgb(79 70 229)' : '#D3D3D3'}`}
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
      {!!label && isHovered && (
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

  const handleMobileButtonClick = useCallback(
    (newRelationshipAction: NewRelationshipAction) => () => {
      // Remember the nodeId and the position

      if (onNodeButtonPressed) onNodeButtonPressed(id, newRelationshipAction)
    },
    [onNodeButtonPressed]
  )

  const addChildLabel = 'Ajouter un enfant'
  const addFriendLabel = 'Ajouter un ami'
  const addParentLabel = 'Ajouter un parent'
  const addSpouseLabel = 'Ajouter un compagnon / époux'
  return (
    <div className='text-center relative' key={`personNode_${id}`}>
      <Handle id='parents' type='target' style={{ opacity: 0, top: 5 }} position={Position.Top} />
      <Handle id='children' type='source' style={{ opacity: 0, bottom: 5 }} position={Position.Bottom} />
      <Handle id='person-left' type='target' style={{ opacity: 0, left: 5 }} position={Position.Left} />
      <Handle id='person-right' type='source' style={{ opacity: 0, right: 5 }} position={Position.Right} />

      <div className='invisible sm:visible'>
        {selected && (
          <>
            {/* Bottom */}
            <DonutSection
              position='bottom'
              label={addChildLabel}
              onClick={handleDonutClick}
              className='z-20' // To go over the name label
            />
            {/* Left */}
            <DonutSection label={addFriendLabel} onClick={handleDonutClick} position='left' />
            {/* Top */}
            <DonutSection label={addParentLabel} onClick={handleDonutClick} position='top' />
            {/* Right */}
            <DonutSection label={addSpouseLabel} onClick={handleDonutClick} position='right' />
          </>
        )}
      </div>

      <div className='relative'>
        {data.profilePicUrl ? (
          <img
            src={data.profilePicUrl}
            className={`inline-block rounded-full h-14 w-14 ring-2 ${
              selected || data.isOriginPerson ? 'ring-indigo-500' : 'ring-white'
            } shadow-sm`}
          />
        ) : (
          <span
            className={`inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-500 ring-2 ${
              selected || data.isOriginPerson ? 'ring-indigo-500' : 'ring-white'
            } shadow-sm`}>
            <span className='text-xl font-medium leading-none text-white'>{getInitials(data.label)}</span>
          </span>
        )}
        <div className='absolute w-full top-full -mt-1 pointer-events-none z-10'>
          <span
            style={{ fontSize: 8 }}
            className={`inline-flex  items-center rounded-md bg-white/70 px-1 py-0.5    ring-1 ring-inset ${
              selected || data.isOriginPerson ? 'text-indigo-700 ring-indigo-500/50' : 'ring-gray-500/10 text-gray-600'
            } `}>
            {data.label}
          </span>
        </div>
        <div className={`${selected ? 'focus:visible' : 'invisible'} sm:invisible z-20`}>
          <ActionLabel
            label={addParentLabel}
            position={{ bottom: BUBBLE_RADIUS * 2 + 5 }}
            onClick={handleMobileButtonClick('addParent')}
          />
          <ActionLabel
            label={addSpouseLabel}
            position={{ left: BUBBLE_RADIUS * 2 + 5, top: BUBBLE_RADIUS - 20 }}
            onClick={handleMobileButtonClick('addSpouse')}
          />
          <ActionLabel
            label={addChildLabel}
            position={{ top: BUBBLE_RADIUS * 2 + 5 }}
            onClick={handleMobileButtonClick('addChild')}
          />
          <ActionLabel
            label={addFriendLabel}
            position={{ right: BUBBLE_RADIUS * 2 + 5, top: BUBBLE_RADIUS - 15 }}
            onClick={handleMobileButtonClick('addFriend')}
          />
        </div>
      </div>
    </div>
  )
}

type ActionLabelProps = {
  label: string
  position: {
    top?: number | string
    bottom?: number | string
    left?: number | string
    right?: number | string
  }
  onClick?: () => void
}

function ActionLabel({ label, position, onClick }: ActionLabelProps) {
  return (
    <div
      className='absolute z-20'
      style={{
        fontSize: 8,
        ...position,
      }}
      onClick={onClick}>
      <span className='inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-indigo-700 ring-1 ring-inset ring-indigo-700/10'>
        {label}
      </span>
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

type SaveNewRelationshipArgs = {
  newPerson?: Person
  relationship: Relationship
}

const saveNewRelationship = ({ newPerson, relationship }: SaveNewRelationshipArgs) => {
  // setStatus('saving')
  fetch(`/family/saveNewRelationship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPerson, relationship }),
  }).then((res) => {
    if (!res.ok) {
      alert("La nouvelle relation n'a pas pu être sauvegardée.")
      // setStatus('error')
      return
    }
    // setStatus('saved')
    // setLatestTitle(newTitle)
    // setTimeout(() => {
    //   setStatus('idle')
    // }, 2000)
  })
}
