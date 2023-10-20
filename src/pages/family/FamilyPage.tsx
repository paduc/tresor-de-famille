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
import { UserPlusIcon, PhotoIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { getUuid } from '../../libs/getUuid'
import { PersonAutocomplete, PersonAutocompleteProps } from '../_components/PersonAutocomplete'
import { Transition, Dialog } from '@headlessui/react'
import { ClientOnly } from '../_components/ClientOnly'
import {
  secondaryButtonStyles,
  buttonIconStyles,
  primaryButtonStyles,
  secondaryRedButtonStyles,
  smallButtonStyles,
  smallButtonIconStyles,
} from '../_components/Button'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

type Person = {
  profilePicUrl: string | null
  name: string
  personId: UUID
}

type Relationship = { id: UUID } & (
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
)

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

const BUBBLE_RADIUS = 72

const Y_OFFSET = 4 * BUBBLE_RADIUS
const X_OFFSET = 2.5 * BUBBLE_RADIUS
const COUPLE_NODE_RADIUS = 6

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

  const originNode = makePersonNode(originPersonId, { x: currentX, y: currentY })
  originNode.data.isOriginPerson = true
  nodes.push(originNode)

  const COUPLE_OFFSET = X_OFFSET * 1.15

  // Add spouse
  const spouseRel = relationships.find(
    (rel): rel is Relationship & { type: 'spouses' } => rel.type === 'spouses' && rel.spouseIds.includes(originPersonId)
  )
  let coupleNode: Node | null = null
  const spouseIds: UUID[] = []
  if (spouseRel) {
    const spouseId = spouseRel.spouseIds.find((personId) => personId !== originPersonId)!

    const spouseNode = makePersonNode(spouseId, {
      x: currentX + COUPLE_OFFSET,
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
  addChildren(originNode)

  function addChildren(parentNode: Node) {
    if (!parentNode) return []

    const personId = parentNode.id

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

        parent2Node.position.x = parentNode.position.x + (uniqueParentIds.size - 1) * COUPLE_OFFSET
        coupleNode.position.x = parent2Node.position.x - BUBBLE_RADIUS / 2
      }
      if (newEdges && newEdges.length) {
        edges = edges.concat(newEdges)
      }
      if (!coupleChildren.has(coupleNode.id)) {
        coupleChildren.set(coupleNode.id, [])
      }
      coupleChildren.get(coupleNode.id)!.push(childId)
    }

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

      edges.push(makeParentChildEdge(coupleNode.id, personId))

      return [parent1Node, parent2Node]
    }

    // Edge from the person to his single parent node
    edges.push(makeParentChildEdge(parent1Id, personId))
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
            x: personNode.position.x - X_OFFSET * ++counter,
            y: personNode.position.y,
          })
          nodes.push(siblingNode)
          edges.push(makeParentChildEdge(coupleNode.id, siblingId))
        }
      }

      if (halfSiblings.size) {
        for (const [siblingId, parentId] of halfSiblings) {
          const siblingNode = makePersonNode(siblingId as UUID, {
            x: personNode.position.x - X_OFFSET * ++counter,
            y: personNode.position.y,
          })
          nodes.push(siblingNode)
          edges.push(makeParentChildEdge(parent1Id, siblingId))
        }
      }

      return trueSiblings.size + halfSiblings.size
    }

    // One parent
    // use the parent node
    for (const siblingId of trueSiblings) {
      const siblingNode = makePersonNode(siblingId as UUID, {
        x: personNode.position.x - X_OFFSET * ++counter,
        y: personNode.position.y,
      })
      nodes.push(siblingNode)
      edges.push(makeParentChildEdge(parent1Id, siblingId))
    }

    return trueSiblings.size
  }

  function makePersonNode(personId: UUID, position: { x: number; y: number }) {
    const person = getPersonById(personId)
    return {
      id: personId,
      type: 'person',
      data: { label: person.name, profilePicUrl: person.profilePicUrl, isOriginPerson: false },
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
      deletable: false,
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
      deletable: false,
    }

    const coupleToLeftSpouse = {
      id: `${leftSpouse.id}isSpouseOf${rightSpouse.id}`,
      source: leftSpouse.id,
      target: coupleNode.id,
      sourceHandle: 'person-right',
      targetHandle: 'couple-left',
      deletable: false,
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

  const [pendingRelationshipAction, setPendingRelationshipAction] = useState<PendingNodeRelationshipAction | null>(null)

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

  const onRelationshipButtonPressed = useCallback((nodeId: string, newRelationshipAction: NewRelationshipAction) => {
    // Move the nodeId and the action to state
    setPendingRelationshipAction({ personId: nodeId as UUID, relationshipAction: newRelationshipAction })
  }, [])

  const onSearchPersonSelected = useCallback<SearchPanelProps['onPersonSelected']>(
    async (args) => {
      if (args === null) {
        setPendingRelationshipAction(null)
        return
      }

      const { selectedPerson, sourcePersonId, relationshipAction } = args

      // console.log('onPersonSelected', { newPersonId, sourcePersonId })

      const { newPerson, targetPersonId } = getNewPerson(selectedPerson)

      try {
        const newRelationship = getNewRelationship()

        // TODO: display loading state
        await saveNewRelationship({ newPerson, relationship: newRelationship })

        // Add Node if new person (call setPersons)
        setPersons((persons) => {
          if (newPerson) {
            return [...persons, newPerson as Person]
          }

          return persons
        })

        // Add Relationship
        setRelationships((relationships) => {
          return [...relationships, newRelationship]
        })

        setPendingRelationshipAction(null)
      } catch (error) {}

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
            return { id: getUuid(), type: 'parent', childId: targetPersonId, parentId: sourcePersonId }
          case 'addParent':
            return { id: getUuid(), type: 'parent', childId: sourcePersonId, parentId: targetPersonId }
          case 'addFriend':
            return { id: getUuid(), type: 'friends', friendIds: [targetPersonId, sourcePersonId] }
          case 'addSpouse':
            return { id: getUuid(), type: 'spouses', spouseIds: [targetPersonId, sourcePersonId] }
        }
      }
    },
    [reactFlowInstance]
  )

  const onRemoveRelationship = useCallback(
    async (relationshipId: UUID) => {
      try {
        // TODO: display loading state
        await removeRelationship({ relationshipId })
        setRelationships((rels) => rels.filter((rel) => rel.id !== relationshipId))
      } catch (error) {}
    },
    [reactFlowInstance]
  )

  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      if (nodes.length !== 1) return

      const selectedNode = nodes[0]
      if (selectedNode.id === origin.personId) return
      const { x, y } = selectedNode.position
      setOrigin({ personId: selectedNode.id as UUID, x, y })
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
              onInit={setReactFlowInstance}
              onSelectionChange={onSelectionChange}
              nodeTypes={nodeTypes}
              fitView
              maxZoom={1}>
              <Background />
              <Panel position='top-center'>
                <SearchPanel
                  onPersonSelected={onSearchPersonSelected}
                  onRemoveRelationship={onRemoveRelationship}
                  pendingRelationshipAction={pendingRelationshipAction}
                  relationships={relationships}
                  persons={persons}
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
  onRemoveRelationship: (relationshipId: UUID) => unknown
  pendingRelationshipAction: PendingNodeRelationshipAction | null
  relationships: Relationship[]
  persons: Person[]
}

function SearchPanel({
  onPersonSelected,
  onRemoveRelationship,
  pendingRelationshipAction,
  relationships,
  persons,
}: SearchPanelProps) {
  const close = () => onPersonSelected(null)

  const relativeIdsWithThisRelationship: { personId: UUID; relationship: Relationship }[] = React.useMemo(() => {
    if (!pendingRelationshipAction) return []

    const { relationshipAction, personId } = pendingRelationshipAction

    switch (relationshipAction) {
      case 'addChild':
        return relationships
          .filter((rel): rel is Relationship & { type: 'parent' } => rel.type === 'parent' && rel.parentId === personId)
          .map((relationship) => ({ personId: relationship.childId, relationship }))
      case 'addParent':
        return relationships
          .filter((rel): rel is Relationship & { type: 'parent' } => rel.type === 'parent' && rel.childId === personId)
          .map((relationship) => ({ personId: relationship.parentId, relationship }))
      case 'addFriend':
        return relationships
          .filter(
            (rel): rel is Relationship & { type: 'friends' } => rel.type === 'friends' && rel.friendIds.includes(personId)
          )
          .map((relationship) => ({ personId: relationship.friendIds.find((fId) => fId !== personId)!, relationship }))
      case 'addSpouse':
        return relationships
          .filter(
            (rel): rel is Relationship & { type: 'spouses' } => rel.type === 'spouses' && rel.spouseIds.includes(personId)
          )
          .map((relationship) => ({ personId: relationship.spouseIds.find((fId) => fId !== personId)!, relationship }))
    }
  }, [pendingRelationshipAction, relationships])

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
                <div className='divide-y divider-gray-200'>
                  <div className='sm:flex sm:items-start pb-5'>
                    <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10'>
                      <UserPlusIcon className='h-6 w-6 text-indigo-600' aria-hidden='true' />
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
                          unselectableIds={relativeIdsWithThisRelationship.map((rel) => rel.personId)}
                          className='max-w-xl text-gray-800'
                        />
                      </div>
                    </div>
                  </div>
                  {relativeIdsWithThisRelationship.length ? (
                    <div className='pt-5'>
                      <div>Actuellement, vous avez indiqué :</div>
                      <ul role='list' className='divide-y divide-gray-100'>
                        {relativeIdsWithThisRelationship.map(({ personId, relationship }) => {
                          const person = persons.find((person) => person.personId === personId)
                          if (!person) return null
                          return (
                            <li key={personId} className='flex items-center justify-between gap-x-6 py-5'>
                              {person.profilePicUrl ? (
                                <img
                                  className='h-12 w-12 flex-none rounded-full bg-gray-50 shadow-md border border-gray-200'
                                  src={person.profilePicUrl}
                                  alt=''
                                />
                              ) : (
                                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-500`}>
                                  <span className='text-xl font-medium leading-none text-white'>
                                    {getInitials(person.name)}
                                  </span>
                                </span>
                              )}
                              <div className='min-w-0 flex-auto'>
                                <p className='text-base'>{person.name}</p>
                              </div>
                              <button
                                onClick={() => onRemoveRelationship(relationship.id)}
                                className={`${secondaryButtonStyles} ${smallButtonStyles}`}>
                                <XMarkIcon className={smallButtonIconStyles} />
                                Retirer
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
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
  isOriginPerson?: true
}>) {
  const onRelationshipButtonPressed = React.useContext(NodeListenerContext)

  const handleButtonPress = useCallback(
    (newRelationshipAction: NewRelationshipAction) => () => {
      // Remember the nodeId and the position

      if (onRelationshipButtonPressed) onRelationshipButtonPressed(id, newRelationshipAction)
    },
    [onRelationshipButtonPressed]
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

      <div className='relative z-10'>
        {data.profilePicUrl ? (
          <img
            src={data.profilePicUrl}
            className={`inline-block rounded-full h-36 w-36 ring-2 ${
              selected || data.isOriginPerson ? 'ring-indigo-500' : 'ring-white'
            } shadow-sm`}
          />
        ) : (
          <span
            className={`inline-flex h-36 w-36 items-center justify-center rounded-full bg-gray-500 ring-2 ${
              selected || data.isOriginPerson ? 'ring-indigo-500' : 'ring-white'
            } shadow-sm`}>
            <span className='text-xl font-medium leading-none text-white'>{getInitials(data.label)}</span>
          </span>
        )}
        <div className='absolute w-full top-full -mt-1 pointer-events-none z-10'>
          <span
            className={`inline-flex items-center rounded-lg bg-white/70 px-3 py-1    ring-1 ring-inset ${
              selected || data.isOriginPerson ? 'text-indigo-700 ring-indigo-500/50' : 'ring-gray-500/10 text-gray-600'
            } `}>
            {data.label}
          </span>
        </div>
        <div className={`${selected ? 'focus:visible' : 'invisible'} z-20 relative`}>
          <ActionLabel
            label={addParentLabel}
            position={{ bottom: BUBBLE_RADIUS * 2 + 5, left: 0 }}
            onClick={handleButtonPress('addParent')}
          />
          <ActionLabel
            label={addSpouseLabel}
            position={{ bottom: BUBBLE_RADIUS - 20, left: BUBBLE_RADIUS * 2 + 5 }}
            onClick={handleButtonPress('addSpouse')}
          />
          <ActionLabel label={addChildLabel} position={{ bottom: -70, left: 0 }} onClick={handleButtonPress('addChild')} />
          <ActionLabel
            label={addFriendLabel}
            position={{ bottom: BUBBLE_RADIUS - 20, right: BUBBLE_RADIUS * 2 + 5 }}
            onClick={handleButtonPress('addFriend')}
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
    <span
      className={`absolute ${primaryButtonStyles} whitespace-nowrap`}
      style={{
        ...position,
      }}
      onClick={onClick}>
      {label}
    </span>
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

const saveNewRelationship = async ({ newPerson, relationship }: SaveNewRelationshipArgs) => {
  // setStatus('saving')
  return fetch(`/family/saveNewRelationship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPerson, relationship }),
  }).then((res) => {
    if (!res.ok) {
      alert("La nouvelle relation n'a pas pu être sauvegardée.")
      // setStatus('error')
      throw new Error('saving of new relationship failed')
    }
    // setStatus('saved')
    // setLatestTitle(newTitle)
    // setTimeout(() => {
    //   setStatus('idle')
    // }, 2000)
  })
}

type RemoveRelationshipArgs = {
  relationshipId: UUID
}
const removeRelationship = async ({ relationshipId }: RemoveRelationshipArgs) => {
  // setStatus('saving')
  return fetch(`/family/removeRelationship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ relationshipId }),
  }).then((res) => {
    if (!res.ok) {
      alert("Le retrait de la relation n'a pas pu être sauvegardée.")
      // setStatus('error')
      throw new Error('removal of relationship failed')
    }
  })
}
