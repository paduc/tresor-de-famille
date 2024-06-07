import { Edge, Node } from 'reactflow'
import { PersonId } from '../../../../domain/PersonId.js'
import { RelationshipId } from '../../../../domain/RelationshipId.js'
import { PersonInTree, RelationshipInTree } from '../TreeTypes.js'

const BUBBLE_RADIUS = 72 as const
const Y_OFFSET = 4 * BUBBLE_RADIUS
const X_SPACING = 36
const PERSON_WIDTH = BUBBLE_RADIUS * 2
const COUPLE_NODE_RADIUS = 6
const COUPLE_WIDTH = PERSON_WIDTH + X_SPACING + PERSON_WIDTH

export const entireFamilyOfPersonMapper = ({
  persons,
  relationships,
  originPersonId,
}: {
  persons: PersonInTree[]
  relationships: RelationshipInTree[]
  originPersonId: PersonId
}) => {
  const personsMap = persons.reduce((map, person) => {
    map.set(person.personId, person)
    return map
  }, new Map<PersonId, PersonInTree>())
  const relationshipsMap = relationships.reduce((map, relationship) => {
    map.set(relationship.id, relationship)
    return map
  }, new Map<RelationshipId, RelationshipInTree>())

  const nodes = new Map<Node['id'], Node>()
  const edges = new Map<Edge['id'], Edge>()

  const originXY = { x: 0, y: 0 }

  // // Add origin person node
  const originPersonNode = makePersonNode(originPersonId, originXY)
  insertNode(originPersonNode)
  drawPersonSpouseAndChildren(originPersonId, originXY)

  // Lets add the parents
  drawParents(originPersonId, 'left')
  const [spouse] = findSpouses(originPersonId)
  if (spouse) {
    drawParents(spouse.personId, 'right')
  }

  return { nodes, edges }

  function drawParents(personId: PersonId, position: 'left' | 'right') {
    const personNode = nodes.get(personId)!
    const parents = findParents(personId)
    if (!parents.length) return

    if (parents.length === 1) {
      const parent = parents[0]
      const parentXY = {
        x: personNode.position.x,
        y: personNode.position.y - Y_OFFSET,
      }
      const parentNode = makePersonNode(parent.personId, parentXY)
      insertNode(parentNode)
      insertEdge(makeParentChildEdge(parentNode.id, personId))

      const ascendants = findParents(parent.personId)
      console.log(`ascendants of ${personsMap.get(parent.personId)?.name}`, ascendants)
      if (ascendants.length > 0) {
        insertExploreAscendants(parentNode)
      }

      return
    }

    const [parent1, parent2] = parents

    const parent1XY = { x: personNode.position.x, y: personNode.position.y - Y_OFFSET }
    const parent1Node = makePersonNode(parent1.personId, parent1XY)
    insertNode(parent1Node)

    const parent2XY = {
      x: personNode.position.x + (position === 'left' ? -1 : 1) * (PERSON_WIDTH + X_SPACING),
      y: personNode.position.y - Y_OFFSET,
    }
    const parent2Node = makePersonNode(parent2.personId, parent2XY)
    insertNode(parent2Node)

    const coupleNode = makeCoupleNode(parent1Node, parent2Node)
    insertNode(coupleNode)
    insertEdges(makeCoupleEdges(coupleNode, parent1Node, parent2Node))

    const ascendants = [...findParents(parent1.personId), ...findParents(parent2.personId)].filter((item) => !!item)
    if (ascendants.length > 0) {
      insertExploreAscendants(coupleNode)
    }

    insertEdge(makeParentChildEdge(coupleNode.id, personId))
  }

  function getChildWidth(personId: PersonId): number {
    const children = findChildren(personId)
    const spouses = findSpouses(personId)
    if (children.length === 0) {
      if (spouses.length === 0) {
        return PERSON_WIDTH + X_SPACING
      }

      return COUPLE_WIDTH + X_SPACING
    }
    const res = Math.max(
      spouses.length ? COUPLE_WIDTH + X_SPACING : 0,
      children.reduce((acc, child) => acc + getChildWidth(child.personId), 0)
    )

    return res
  }

  function drawSpouses({ personId, position }: { personId: PersonId; position: { x: number; y: number } }) {
    const spouses = findSpouses(personId)
    const spouse = spouses[0]
    let coupleNode: Node | undefined
    if (spouse) {
      const x = position.x + X_SPACING + PERSON_WIDTH
      const y = position.y
      const spouseNode = makePersonNode(spouse.personId, { x, y })
      insertNode(spouseNode)
      const parentNode = nodes.get(personId)!
      coupleNode = makeCoupleNode(parentNode, spouseNode)
      insertNode(coupleNode)
      insertEdges(makeCoupleEdges(coupleNode, parentNode, spouseNode))

      return coupleNode
    }
  }

  function drawPersonSpouseAndChildren(parentNodeId: PersonId, parentPosition: { x: number; y: number }) {
    const coupleNode = drawSpouses({ personId: parentNodeId, position: parentPosition })
    const hasTwoParents = !!coupleNode

    const children = findChildren(parentNodeId)

    // Get the children layer width to center the children
    const childLayerWidth = children.reduce((acc, child) => acc + getChildWidth(child.personId), 0)
    const currentLayerWidth = hasTwoParents ? COUPLE_WIDTH + X_SPACING : PERSON_WIDTH

    const childGroupOffset = (childLayerWidth - currentLayerWidth) / 2

    children.forEach((child, index) => {
      const siblingsToTheLeftWidth = children.slice(0, index).reduce((acc, child) => acc + getChildWidth(child.personId), 0)

      const ownChildrenWidth = getChildWidth(child.personId)

      const childHasSpouse = findSpouses(child.personId).length > 0

      const x =
        parentPosition.x +
        siblingsToTheLeftWidth -
        childGroupOffset +
        ownChildrenWidth / 2 -
        (childHasSpouse ? COUPLE_WIDTH / 2 : PERSON_WIDTH / 2) -
        (hasTwoParents ? X_SPACING / 2 : 0)
      const y = parentPosition.y + Y_OFFSET

      const childNode = makePersonNode(child.personId, { x, y })
      insertNode(childNode)
      insertEdge(makeParentChildEdge(coupleNode ? coupleNode.id : parentNodeId, child.personId))

      drawPersonSpouseAndChildren(child.personId, { x, y })
    })
  }

  function findParents(personId: PersonId) {
    const parentRelationships = relationships.filter(
      (relationship): relationship is RelationshipInTree & { type: 'parent' } =>
        relationship.type === 'parent' && relationship.childId === personId
    )
    return parentRelationships.map((relationship) => personsMap.get(relationship.parentId)!)
  }

  function findChildren(personId: PersonId) {
    const childRelationships = relationships.filter(
      (relationship): relationship is RelationshipInTree & { type: 'parent' } =>
        relationship.type === 'parent' && relationship.parentId === personId
    )
    return childRelationships.map((relationship) => personsMap.get(relationship.childId)!)
  }

  function findSpouses(personId: PersonId) {
    const spouseRelationships = relationships.filter(
      (relationship): relationship is RelationshipInTree & { type: 'spouses' } =>
        relationship.type === 'spouses' && relationship.spouseIds.includes(personId)
    )
    return spouseRelationships
      .map((relationship) => relationship.spouseIds.filter((spouseId) => spouseId !== personId)[0])
      .map((spouseId) => personsMap.get(spouseId)!)
  }

  function findSiblings(personId: PersonId) {
    const parentRelationships = relationships.filter(
      (relationship): relationship is RelationshipInTree & { type: 'parent' } =>
        relationship.type === 'parent' && relationship.childId === personId
    )
    const parentIds = parentRelationships.map((relationship) => relationship.parentId)

    const siblingRelationships = relationships.filter(
      (relationship): relationship is RelationshipInTree & { type: 'parent' } =>
        relationship.type === 'parent' && parentIds.includes(relationship.parentId) && relationship.childId !== personId
    )

    return siblingRelationships.map((relationship) => personsMap.get(relationship.childId)!)
  }

  function makePersonNode(personId: PersonId, options: { x: number; y: number; parentId?: PersonId }): Node {
    const person = personsMap.get(personId)!
    const { x, y } = options
    return {
      id: personId,
      type: 'person',
      data: { label: person.name, profilePicUrl: person.profilePicUrl, isOriginPerson: false },
      position: { x, y },
      selectable: true,
      draggable: false,
      ...(options.parentId ? { parentId: options.parentId, extent: 'parent' } : {}),
    }
  }

  function makeParentChildEdge(parentId: string, childId: string): Edge {
    return {
      id: `${parentId}isParentOf${childId}`,
      source: parentId,
      target: childId,
      sourceHandle: 'children',
      targetHandle: 'parents',
      deletable: false,
      focusable: false,
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

  function makeCoupleEdges(coupleNode: Node, spouse1Node: Node, spouse2Node: Node): Edge[] {
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

  function insertExploreAscendants(originNode: Node) {
    const dashedLength = 50
    const lineLength = 200

    const isOriginCouple = originNode.type === 'couple'

    const x = originNode.position.x + (isOriginCouple ? 0 : PERSON_WIDTH / 2 - X_SPACING / 4 + 2)
    const y = originNode.position.y - (isOriginCouple ? lineLength - COUPLE_NODE_RADIUS : lineLength - PERSON_WIDTH / 2)

    const endNode = {
      id: `explore_from_${originNode.id}`,
      type: 'explore',
      data: {},
      position: {
        x,
        y,
      },
      selectable: false,
      draggable: false,
    }
    insertNode(endNode)

    const intermediatNode = {
      id: `explore_inter_${originNode.id}`,
      type: 'explore',
      data: {},
      position: {
        x,
        y: y + dashedLength,
      },
      selectable: false,
      draggable: false,
    }
    insertNode(intermediatNode)

    const intermediadeToEndEdge = {
      id: `explore_from_${intermediatNode.id}_to_${endNode.id}`,
      source: intermediatNode.id,
      target: endNode.id,
      deletable: false,
      selectable: false,
      style: { strokeDasharray: '5, 5' },
    }
    insertEdge(intermediadeToEndEdge)

    const sourceToIntermediateEdge = {
      id: `explore_from_${originNode.id}_to_${intermediatNode.id}`,
      source: originNode.id,
      target: intermediatNode.id,
      sourceHandle: isOriginCouple ? 'parents' : 'children',
      targetHandle: 'explore',
      deletable: false,
      selectable: false,
      style: {},
    }
    insertEdge(sourceToIntermediateEdge)
  }

  function insertNode(node: Node) {
    nodes.set(node.id, node)
  }

  function insertNodes(newNodes: Node[]) {
    newNodes.forEach(insertNode)
  }

  function insertEdge(edge: Edge) {
    edges.set(edge.id, edge)
  }

  function insertEdges(newEdges: Edge[]) {
    newEdges.forEach(insertEdge)
  }
}
