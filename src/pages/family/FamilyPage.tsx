import * as React from 'react'
import ReactFlow, {
  Background,
  Edge,
  Handle,
  Node,
  NodeProps,
  Panel,
  Position,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from 'reactflow'

import { Dialog, Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon, EllipsisHorizontalIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useCallback, useMemo, useRef, useState } from 'react'
import { PersonId } from '../../domain/PersonId'
import { RelationshipId } from '../../domain/RelationshipId'
import { makePersonId } from '../../libs/makePersonId'
import { makeRelationshipId } from '../../libs/makeRelationshipId'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { primaryButtonStyles, secondaryButtonStyles, smallButtonIconStyles, smallButtonStyles } from '../_components/Button'
import { ClientOnly } from '../_components/ClientOnly'
import { PersonAutocomplete } from '../_components/PersonAutocomplete'
import { TDFModal } from '../_components/TDFModal'
import { AppLayout } from '../_components/layout/AppLayout'
import { PersonPageURL } from '../person/PersonPageURL'
import { FamilyId } from '../../domain/FamilyId'
import { useSession } from '../_components/SessionContext'
import { PhotoListPageUrlWithFamily } from '../photoList/PhotoListPageUrl'
import { FamilyPageURL, FamilyPageURLWithFamily } from './FamilyPageURL'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

type Person = {
  profilePicUrl: string | null
  name: string
  personId: PersonId
}

type Relationship = { id: RelationshipId } & (
  | {
      type: 'parent'
      parentId: PersonId
      childId: PersonId
    }
  | {
      type: 'spouses'
      spouseIds: [PersonId, PersonId] // in which order ? alphabetical on PersonId ?
    }
  | {
      type: 'friends'
      friendIds: [PersonId, PersonId]
    }
)

type PersonsRelationships = {
  origin: {
    personId: PersonId
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
 * Paint close family members
 * Transform a list of persons and relationship to a list of nodes and edges.
 * Reactive function to be executed each time persons/relationships change (to repaint the graph).
 * @param props persons and relationsip
 * @returns nodes and edges
 */
function closeFamilyMembers({ origin, persons, relationships }: PersonsRelationships): NodesEdges {
  const { personId: originPersonId, x: currentX, y: currentY } = origin

  let nodes: Node[] = []
  let edges: Edge[] = []

  // Create a node for the originPerson

  const originNode = makePersonNode(originPersonId, { x: currentX, y: currentY })
  originNode.data.isOriginPerson = true
  insertNode(originNode)

  const COUPLE_OFFSET = X_OFFSET * 1.15

  // Add spouse
  const spouseRel = relationships.find(
    (rel): rel is Relationship & { type: 'spouses' } => rel.type === 'spouses' && rel.spouseIds.includes(originPersonId)
  )
  let coupleNode: Node | null = null
  const spouseIds: PersonId[] = []
  if (spouseRel) {
    const spouseId = spouseRel.spouseIds.find((personId) => personId !== originPersonId)!

    const spouseNode = makePersonNode(spouseId, {
      x: currentX + COUPLE_OFFSET,
      y: currentY,
    })
    insertNode(spouseNode)

    spouseIds.push(spouseId)

    coupleNode = makeCoupleNode(originNode, spouseNode)
    insertNode(coupleNode)

    const coupleEdges = makeCoupleEdges(coupleNode, originNode, spouseNode)
    insertEdges(coupleEdges)
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

    const childIds = new Set<PersonId>(childRelationships.map((rel) => rel.childId))

    const childCount = childIds.size

    // Create a centered box with ALL the children
    const CHILD_GAP = BUBBLE_RADIUS / 2
    const childrenBoxWidth = childCount * BUBBLE_RADIUS * 2 + (childCount - 1) * CHILD_GAP
    const childrenBoxX = parentNode.position.x + BUBBLE_RADIUS

    type ChildId = PersonId

    type CoupleNodeId = string

    const uniqueParentIds = new Set<PersonId>(spouseIds) // Add the spouses so they appear in uniqueParentIds.size()

    const coupleChildren = new Map<CoupleNodeId, ChildId[]>()
    for (const childId of childIds) {
      const parents = getParents(childId)
      const parentsAsArray = Array.from(parents)
      const parent1Id = parentsAsArray.find((parentId) => parentId === personId)!
      const parent2Id = parentsAsArray.find((parentId) => parentId !== personId)

      parent1Id && uniqueParentIds.add(parent1Id)
      parent2Id && uniqueParentIds.add(parent2Id)
      const { coupleNode, edges: newEdges, parent2Node } = getCoupleNode(parent1Id, parent2Id)
      if (parent2Node) {
        insertNode(coupleNode)
        insertNode(parent2Node)

        parent2Node.position = {
          x: parentNode.position.x + (uniqueParentIds.size - 1) * COUPLE_OFFSET,
          y: parentNode.position.y,
        }
        coupleNode.position.x = parent2Node.position.x - BUBBLE_RADIUS / 2
      }
      if (newEdges) {
        insertEdges(newEdges)
      }
      if (!coupleChildren.has(coupleNode.id)) {
        coupleChildren.set(coupleNode.id, [])
      }
      coupleChildren.get(coupleNode.id)!.push(childId)
    }

    const couplesSortedByX: [string, PersonId[]][] = Array.from(coupleChildren.keys())
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

    let childIndex = 0
    let childNodes: Node[] = []
    for (const [coupleId, children] of couplesSortedByX) {
      for (const childId of children) {
        const childNode = makePersonNode(childId, {
          x: childrenBoxX + childIndex++ * (2 * BUBBLE_RADIUS + CHILD_GAP) - childrenBoxWidth / 2,
          y: currentY + Y_OFFSET,
        })
        childNodes.push(childNode)
        insertEdge(makeParentChildEdge(coupleId, childId))
      }
    }

    insertNodes(childNodes)

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
      console.error({ parent1Id, parent2Id })
      throw new Error('getCoupleNode could not find parent1Node')
    }

    if (parent2Id) {
      let parent2Node = findPersonNode(parent2Id)
      let parent2NodeExisted = true
      if (!parent2Node) {
        parent2NodeExisted = false
        parent2Node = makePersonNode(parent2Id as PersonId, { x: parent1Node.position.x + 100, y: 0 }) // place it arbitrarily on the right of the parent1Node so that makeCoupleEdges knows to which handles to connect
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

  function insertEdge(edgeToBeInserted: Edge) {
    // avoid duplicate edges
    edges = [...edges.filter((edge) => edge.id !== edgeToBeInserted.id), edgeToBeInserted]
  }

  function insertEdges(edgesToBeInserted: Edge[]) {
    // avoid duplicate edges
    for (const edgeToBeInserted of edgesToBeInserted) {
      insertEdge(edgeToBeInserted)
    }
  }

  function insertNode(nodeToBeInserted: Node) {
    // avoid duplicate nodes
    nodes = [...nodes.filter((node) => node.id !== nodeToBeInserted.id), nodeToBeInserted]
  }

  function insertNodes(nodesToBeInserted: Node[]) {
    // avoid duplicate nodes
    for (const nodeToBeInserted of nodesToBeInserted) {
      insertNode(nodeToBeInserted)
    }
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
    insertNode(parent1Node)

    if (!singleParent) {
      const parent2Node = makePersonNode(parent2Id, {
        x: currentX + localXOffset,
        y: currentY - Y_OFFSET,
      })
      insertNode(parent2Node)

      // Make couple node here
      const coupleNode = makeCoupleNode(parent1Node, parent2Node)
      insertNode(coupleNode)

      // Edge from the person to his parents' couple node
      const coupleEdges = makeCoupleEdges(coupleNode, parent1Node, parent2Node)
      insertEdges(coupleEdges)

      insertEdge(makeParentChildEdge(coupleNode.id, personId))

      return [parent1Node, parent2Node]
    }

    // Edge from the person to his single parent node
    insertEdge(makeParentChildEdge(parent1Id, personId))
    return [parent1Node]
  }

  function getParents(personId: string): Set<PersonId> {
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
          const siblingNode = makePersonNode(siblingId as PersonId, {
            x: personNode.position.x - X_OFFSET * ++counter,
            y: personNode.position.y,
          })
          insertNode(siblingNode)
          insertEdge(makeParentChildEdge(coupleNode.id, siblingId))
        }
      }

      if (halfSiblings.size) {
        for (const [siblingId, parentId] of halfSiblings) {
          const siblingNode = makePersonNode(siblingId as PersonId, {
            x: personNode.position.x - X_OFFSET * ++counter,
            y: personNode.position.y,
          })
          insertNode(siblingNode)
          insertEdge(makeParentChildEdge(parent1Id, siblingId))
        }
      }

      return trueSiblings.size + halfSiblings.size
    }

    // One parent
    // use the parent node
    for (const siblingId of trueSiblings) {
      const siblingNode = makePersonNode(siblingId as PersonId, {
        x: personNode.position.x - X_OFFSET * ++counter,
        y: personNode.position.y,
      })
      insertNode(siblingNode)
      insertEdge(makeParentChildEdge(parent1Id, siblingId))
    }

    return trueSiblings.size
  }

  function makePersonNode(personId: PersonId, position: { x: number; y: number }) {
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
      selectable: false,
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
      selectable: false,
      draggable: false,
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
      selectable: false,
    }

    const coupleToLeftSpouse = {
      id: `${leftSpouse.id}isSpouseOf${rightSpouse.id}`,
      source: leftSpouse.id,
      target: coupleNode.id,
      sourceHandle: 'person-right',
      targetHandle: 'couple-left',
      deletable: false,
      selectable: false,
    }

    return [coupleToRightSpouse, coupleToLeftSpouse]
  }

  function getPersonById(personId: PersonId): Person {
    const person = persons.find((person) => person.personId === personId)
    if (!person) throw new Error('Could not find personId in list of persons')

    return person
  }

  return { nodes, edges }
}

type NewRelationshipAction = 'addChild' | 'addParent' | 'addFriend' | 'addSpouse'
type PendingNodeRelationshipAction = {
  personId: PersonId
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
  initialOriginPersonId: PersonId | undefined
  familyId: FamilyId
}

export const FamilyPage = withBrowserBundle((props: FamilyPageProps) => {
  return (
    <ClientOnly>
      <ContextualMenuProvider>
        <ClientOnlyFamilyPage {...props} />
      </ContextualMenuProvider>
    </ClientOnly>
  )
})

const ClientOnlyFamilyPage = ({ initialPersons, initialRelationships, initialOriginPersonId, familyId }: FamilyPageProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [persons, setPersons] = useState(initialPersons)
  const [relationships, setRelationships] = useState(initialRelationships)
  const [origin, setOrigin] = useState<{ personId: PersonId; x: number; y: number }>({
    personId: initialOriginPersonId || persons[0].personId,
    x: 0,
    y: 0,
  })

  const [pendingRelationshipAction, setPendingRelationshipAction] = useState<PendingNodeRelationshipAction | null>(null)

  React.useEffect(() => {
    const { nodes, edges } = closeFamilyMembers({ persons, relationships, origin })

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
    setPendingRelationshipAction({ personId: nodeId as PersonId, relationshipAction: newRelationshipAction })
  }, [])

  const onSearchPersonSelected = useCallback<SearchPanelProps['onPersonSelected']>(
    async (args) => {
      if (args === null) {
        setPendingRelationshipAction(null)
        return
      }

      const { selectedPerson, sourcePersonId, secondaryRelationshipsCb: newSecondaryRelationshipsCb, relationshipAction } = args

      const { newPerson, targetPersonId } = getNewPerson(selectedPerson)

      try {
        const newRelationship = getNewRelationship(sourcePersonId)
        const secondaryRelationships: Relationship[] = newSecondaryRelationshipsCb
          ? newSecondaryRelationshipsCb(targetPersonId)
          : []

        // TODO: display loading state
        await saveNewRelationship({ newPerson, relationship: newRelationship, secondaryRelationships })

        // Add Node if new person (call setPersons)
        setPersons((persons) => {
          if (newPerson) {
            return [...persons, newPerson as Person]
          }

          return persons
        })

        // Add Relationship
        setRelationships((relationships) => {
          const newRelationships = [newRelationship, ...secondaryRelationships]
          return [...relationships, ...newRelationships]
        })
      } catch (error) {}

      function getNewPerson(person: Exclude<typeof selectedPerson, null>): { newPerson?: Person; targetPersonId: PersonId } {
        if (person.type === 'unknown') {
          const newPersonId = makePersonId()
          return {
            newPerson: { personId: newPersonId, name: person.name, profilePicUrl: null },
            targetPersonId: newPersonId,
          }
        }

        return { targetPersonId: person.personId }
      }

      function getNewRelationship(sourcePersonId: PersonId): Relationship {
        switch (relationshipAction) {
          case 'addChild':
            return { id: makeRelationshipId(), type: 'parent', childId: targetPersonId, parentId: sourcePersonId }
          case 'addParent':
            return { id: makeRelationshipId(), type: 'parent', childId: sourcePersonId, parentId: targetPersonId }
          case 'addFriend':
            return { id: makeRelationshipId(), type: 'friends', friendIds: [targetPersonId, sourcePersonId] }
          case 'addSpouse':
            return { id: makeRelationshipId(), type: 'spouses', spouseIds: [targetPersonId, sourcePersonId] }
        }
      }
    },
    [reactFlowInstance]
  )

  const onRemoveRelationship = useCallback(
    async (relationshipId: RelationshipId) => {
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
      setOrigin({ personId: selectedNode.id as PersonId, x, y })
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
              <Panel position='top-left'>
                <FamilySwitcher currentFamilyId={familyId} />
              </Panel>
              {/* ) : null} */}
              <Panel position='top-center'>
                <SearchPanel
                  onPersonSelected={onSearchPersonSelected}
                  onRemoveRelationship={onRemoveRelationship}
                  pendingRelationshipAction={pendingRelationshipAction}
                  relationships={relationships}
                  persons={persons}
                />
              </Panel>
              <Panel position='top-right'>
                <ContextualMenu onRelationshipButtonPressed={onRelationshipButtonPressed} />
              </Panel>
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </NodeListenerContext.Provider>
    </AppLayout>
  )
}

const ContextualMenuContext = React.createContext<
  | { isOpen: boolean; close: () => unknown; open: (personId: PersonId) => unknown; selectedPersonId: PersonId | null }
  | undefined
>(undefined)

const useContextualMenu = function () {
  const context = React.useContext(ContextualMenuContext)

  if (!context) {
    throw new Error('Cannot useContextualMenu outside of Provider')
  }

  return context
}

function ContextualMenuProvider({ children }: { children: React.ReactNode }) {
  const [selectedPersonId, setSelectedPersonId] = useState<PersonId | null>(null)

  return (
    <ContextualMenuContext.Provider
      value={{
        isOpen: !!selectedPersonId,
        close: () => setSelectedPersonId(null),
        open: (personId: PersonId) => {
          setSelectedPersonId(personId)
        },
        selectedPersonId,
      }}>
      {children}
    </ContextualMenuContext.Provider>
  )
}

type ContextualMenuProps = {
  onRelationshipButtonPressed: (personId: PersonId, newRelationshipAction: NewRelationshipAction) => unknown
}
function ContextualMenu({ onRelationshipButtonPressed }: ContextualMenuProps) {
  const { isOpen, close, selectedPersonId } = useContextualMenu()

  const handleButtonPress = (newRelationshipAction: NewRelationshipAction) => () => {
    if (selectedPersonId) {
      close()
      onRelationshipButtonPressed(selectedPersonId, newRelationshipAction)
    }
  }

  return (
    <TDFModal isOpen={isOpen} close={close}>
      <div className='mt-8'>
        <button
          onClick={handleButtonPress('addParent')}
          className={`mb-4 ${secondaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
          Gérer les parents
        </button>
        <button
          onClick={handleButtonPress('addChild')}
          className={`mb-4 ${secondaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
          Gérer les enfants
        </button>
        <button
          onClick={handleButtonPress('addSpouse')}
          className={`mb-4 ${secondaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
          Gérer les époux/compagnes
        </button>
        <a
          href={PersonPageURL(selectedPersonId!)}
          className={`mb-4 ${primaryButtonStyles.replace(/inline\-flex/g, '')} block w-full text-center`}>
          Aller à la page profil
        </a>
      </div>
    </TDFModal>
  )
}

type SearchPanelProps = {
  onPersonSelected: (
    args: {
      selectedPerson: { type: 'known'; personId: PersonId } | { type: 'unknown'; name: string }
      sourcePersonId: PersonId
      secondaryRelationshipsCb?: (personId: PersonId) => Relationship[]
      relationshipAction: NewRelationshipAction
    } | null
  ) => unknown
  onRemoveRelationship: (relationshipId: RelationshipId) => unknown
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

  const relativeIdsWithThisRelationship: { personId: PersonId; relationship: Relationship }[] = React.useMemo(() => {
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

  const unselectableIds: PersonId[] = React.useMemo(() => {
    if (!pendingRelationshipAction) return []

    const { relationshipAction, personId } = pendingRelationshipAction

    const existingParents = relationships
      .filter((rel): rel is Relationship & { type: 'parent' } => rel.type === 'parent' && rel.childId === personId)
      .map((relationship) => relationship.parentId)

    const existingChildren = relationships
      .filter((rel): rel is Relationship & { type: 'parent' } => rel.type === 'parent' && rel.parentId === personId)
      .map((relationship) => relationship.childId)

    const existingSpouses = relationships
      .filter((rel): rel is Relationship & { type: 'spouses' } => rel.type === 'spouses' && rel.spouseIds.includes(personId))
      .map((relationship) => relationship.spouseIds.find((fId) => fId !== personId)!)

    const existingFriends = relationships
      .filter((rel): rel is Relationship & { type: 'friends' } => rel.type === 'friends' && rel.friendIds.includes(personId))
      .map((relationship) => relationship.friendIds.find((fId) => fId !== personId)!)

    const currentPersonId = pendingRelationshipAction.personId

    switch (relationshipAction) {
      case 'addChild':
        return [currentPersonId, ...existingSpouses, ...existingChildren, ...existingParents]
      case 'addParent':
        return [currentPersonId, ...existingSpouses, ...existingChildren, ...existingParents]
      case 'addFriend':
        return [currentPersonId, ...existingFriends]
      case 'addSpouse':
        return [currentPersonId, ...existingSpouses, ...existingChildren, ...existingParents]
    }
  }, [pendingRelationshipAction, relationships])

  const [otherRelationshipIsAccepted, setOtherRelationshipIsAccepted] = useState<boolean>(true)

  // Reset the checkbox on each open/close
  React.useEffect(() => {
    setOtherRelationshipIsAccepted(true)
  }, [pendingRelationshipAction])

  const otherRelationships = useMemo<{ label: string; cb: (searchedPerson: PersonId) => Relationship[] } | null>(() => {
    // If addChild and there is a single spouse, offer to add it to her as well
    if (pendingRelationshipAction) {
      const { relationshipAction, personId: sourcePersonId } = pendingRelationshipAction
      if (relationshipAction === 'addSpouse') {
        // Get children with single parent
        const childrenWithSingleParent = getChildrenWithSingleParent(sourcePersonId, { relationships, persons })

        if (!childrenWithSingleParent.length) {
          return null
        }

        return {
          label: `est aussi le parent de ${childrenWithSingleParent.map((child) => child.name).join(', ')}`,
          cb: (searchedSpouse) =>
            childrenWithSingleParent.map((child) => ({
              id: makeRelationshipId(),
              type: 'parent',
              childId: child.personId,
              parentId: searchedSpouse,
            })),
        }
      } else if (relationshipAction === 'addChild') {
        // Single coparent
        const [coparent, ...otherCoparents] = getCoparents(sourcePersonId, { relationships, persons })
        if (coparent && !otherCoparents.length) {
          return {
            label: `${coparent.name} est l'autre parent`,
            cb: (searchedChild) => [
              {
                id: makeRelationshipId(),
                type: 'parent',
                childId: searchedChild,
                parentId: coparent.personId,
              },
            ],
          }
        }

        // Single spouse
        const [spouse, ...otherSpouses] = getSpousesOf(sourcePersonId, { relationships, persons })

        if (spouse && !otherSpouses.length) {
          return {
            label: `${spouse.name} est l'autre parent`,
            cb: (searchedChild) => [
              {
                id: makeRelationshipId(),
                type: 'parent',
                childId: searchedChild,
                parentId: spouse.personId,
              },
            ],
          }
        }
      }
    }
    return null
  }, [pendingRelationshipAction])

  return (
    <TDFModal isOpen={!!pendingRelationshipAction} close={close}>
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
                    secondaryRelationshipsCb: otherRelationshipIsAccepted ? otherRelationships?.cb : undefined,
                    relationshipAction,
                  })
                }}
                unselectableIds={unselectableIds}
                className='max-w-xl text-gray-800'
              />
              {otherRelationships ? (
                <div className='flex items-center justify-between mt-2'>
                  <input
                    type='checkbox'
                    className='mr-1'
                    checked={otherRelationshipIsAccepted}
                    onChange={() => setOtherRelationshipIsAccepted((state) => !state)}
                  />
                  <div className='mx-2 min-w-0 flex-auto'>
                    <p className='text-base'>{otherRelationships.label}</p>
                  </div>
                </div>
              ) : null}
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
                        <span className='text-xl font-medium leading-none text-white'>{getInitials(person.name)}</span>
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
    </TDFModal>
  )
}

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

function getSpousesOf(sourcePersonId: PersonId, args: { relationships: Relationship[]; persons: Person[] }) {
  const spouseRels = args.relationships.filter(
    (rel): rel is Relationship & { type: 'spouses' } => rel.type === 'spouses' && rel.spouseIds.includes(sourcePersonId)
  )

  const uniqueSpouseIds = new Set<PersonId>()
  for (const spouseRel of spouseRels) {
    const spouseId = spouseRel.spouseIds.find((id) => id !== sourcePersonId)
    if (spouseId) uniqueSpouseIds.add(spouseId)
  }

  return Array.from(uniqueSpouseIds)
    .map((spouseId) => args.persons.find((person) => person.personId === spouseId))
    .filter((item): item is Person => !!item)
}

function getCoparents(sourcePersonId: PersonId, args: { relationships: Relationship[]; persons: Person[] }) {
  const { relationships } = args
  const childIds = new Set(
    relationships
      .filter((rel): rel is Relationship & { type: 'parent' } => rel.type === 'parent' && rel.parentId === sourcePersonId)
      .map((rel) => rel.childId)
  )

  const coparentIds = new Set<PersonId>()
  for (const childId of childIds) {
    const otherParent = relationships.find(
      (rel): rel is Relationship & { type: 'parent' } =>
        rel.type === 'parent' && rel.childId === childId && rel.parentId !== sourcePersonId
    )?.parentId

    if (otherParent) coparentIds.add(otherParent)
  }

  return Array.from(coparentIds)
    .map((coparentId) => args.persons.find((person) => person.personId === coparentId))
    .filter((item): item is Person => !!item)
}

function getChildrenWithSingleParent(sourceParentId: PersonId, args: { relationships: Relationship[]; persons: Person[] }) {
  const { relationships } = args
  const childIds = new Set(
    relationships
      .filter((rel): rel is Relationship & { type: 'parent' } => rel.type === 'parent' && rel.parentId === sourceParentId)
      .map((rel) => rel.childId)
  )

  const childrenWithSingleParent = Array.from(childIds).filter((childId) => {
    const parents = relationships.filter(
      (rel): rel is Relationship & { type: 'parent' } => rel.type === 'parent' && rel.childId === childId
    )

    return parents.length === 1
  })

  return childrenWithSingleParent
    .map((childId) => args.persons.find((person) => person.personId === childId))
    .filter((item): item is Person => !!item)
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

  return initials.substring(0, 3)
}

type SaveNewRelationshipArgs = {
  newPerson?: Person
  relationship: Relationship
  secondaryRelationships: Relationship[]
}

const saveNewRelationship = async ({ newPerson, relationship, secondaryRelationships }: SaveNewRelationshipArgs) => {
  // setStatus('saving')
  return fetch(`/family/saveNewRelationship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPerson, relationship, secondaryRelationships }),
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
  relationshipId: RelationshipId
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

type FamilySwitcherProps = { currentFamilyId: FamilyId }

const FamilySwitcher = ({ currentFamilyId }: FamilySwitcherProps) => {
  const session = useSession()
  if (!session.isLoggedIn) return null

  const { userFamilies } = session

  if (!userFamilies || userFamilies.length < 2 || !currentFamilyId) return null

  const selected = userFamilies.find(({ familyId }) => familyId === currentFamilyId)!

  if (!selected) return null

  const handleChange = (newFamily: typeof userFamilies[number]) => {
    if (newFamily.familyId === selected.familyId) return

    if (typeof window !== 'undefined') {
      window.location.href = FamilyPageURLWithFamily(newFamily.familyId)
    }
  }

  return (
    <div className='inline-flex items-center'>
      <div className='text-gray-600 mr-3'>
        Vous regardez l'arbre de <b>{selected.familyName}</b>
      </div>
      <Listbox value={selected} onChange={handleChange}>
        {({ open }) => (
          <>
            <Listbox.Label className='sr-only'>Changer de famille</Listbox.Label>
            <div className='relative'>
              <div className='inline-flex divide-x divide-indigo-700 rounded-md shadow-sm'>
                <Listbox.Button className={`${secondaryButtonStyles} ${smallButtonStyles}`}>
                  <ChevronDownIcon className={`${smallButtonIconStyles}`} aria-hidden='true' />
                  Changer
                  <span className='sr-only'>Changer de famille</span>
                </Listbox.Button>
              </div>

              <Transition
                show={open}
                as={React.Fragment}
                leave='transition ease-in duration-100'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'>
                <Listbox.Options className='absolute -left-2 z-50 mt-2 w-64 origin-top-left divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                  {userFamilies.map((family) => (
                    <Listbox.Option
                      key={family.familyId}
                      className={({ active }) =>
                        classNames(active ? 'bg-indigo-100' : '', 'cursor-default rounded-md select-none p-4 text-sm')
                      }
                      value={family}>
                      {({ selected, active }) => (
                        <div className={`${selected ? '' : 'cursor-pointer'} flex flex-col`}>
                          <div className='flex justify-between'>
                            <p className={selected ? 'font-semibold' : 'font-normal'}>{family.familyName}</p>
                            {selected ? (
                              <span className={'text-indigo-600'}>
                                <CheckIcon className='h-5 w-5' aria-hidden='true' />
                              </span>
                            ) : null}
                          </div>
                          <p className={classNames('mt-2 text-gray-500')}>{family.about}</p>
                        </div>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  )
}
