import type { Node, Edge } from 'reactflow'
import { PersonId } from '../../../domain/PersonId.js'
import { PersonsRelationshipsInTree, RelationshipInTree, PersonInTree } from '../_components/TreeTypes.js'

const BUBBLE_RADIUS = 72 as const
type NodesEdges = {
  nodes: Node[]
  edges: Edge[]
}

/**
 * Paint close family members
 * Transform a list of persons and relationship to a list of nodes and edges.
 * Reactive function to be executed each time persons/relationships change (to repaint the graph).
 * @param props persons and relationsip
 * @returns nodes and edges
 */
export function closeFamilyMapper({ origin, persons, relationships }: PersonsRelationshipsInTree): NodesEdges {
  console.log('closeFamilyMapper', { origin, persons, relationships })
  const Y_OFFSET = 4 * BUBBLE_RADIUS
  const X_OFFSET = 2.5 * BUBBLE_RADIUS
  const COUPLE_NODE_RADIUS = 6

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
    (rel): rel is RelationshipInTree & { type: 'spouses' } => rel.type === 'spouses' && rel.spouseIds.includes(originPersonId)
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
      (rel): rel is RelationshipInTree & { type: 'parent' } => rel.type === 'parent' && rel.parentId === personId
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
      .filter((rel): rel is RelationshipInTree & { type: 'parent' } => rel.type === 'parent' && rel.childId === personId)
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
      (rel): rel is RelationshipInTree & { type: 'parent' } => rel.type === 'parent' && rel.childId === personId
    )

    return new Set(rels.map((rel) => rel.parentId))
  }

  function addSiblings(personNode: Node, parentNodes: ReturnType<typeof addParents>): number {
    const personId = personNode.id

    const { x: currentX, y: currentY } = personNode.position

    const [parent1Id, parent2Id] = parentNodes.map((node) => node.id)

    // Look for persons with the same relationships
    const siblingParentRelationships = relationships.filter(
      (rel): rel is RelationshipInTree & { type: 'parent' } =>
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

  function getPersonById(personId: PersonId): PersonInTree {
    const person = persons.find((person) => person.personId === personId)
    if (!person) throw new Error(`Could not find personId(${personId}) in list of persons (length=${persons.length})`)

    return person
  }

  return { nodes, edges }
}
