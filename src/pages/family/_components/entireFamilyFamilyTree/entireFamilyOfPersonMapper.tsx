import { Edge, Node } from 'reactflow'
import { PersonId } from '../../../../domain/PersonId'
import { PersonInTree, RelationshipInTree } from '../TreeTypes'
import { RelationshipId } from '../../../../domain/RelationshipId'
import { PersonNode } from './PersonNode'

const BUBBLE_RADIUS = 72 as const
const Y_OFFSET = 4 * BUBBLE_RADIUS
const X_OFFSET = 2.5 * BUBBLE_RADIUS
const COUPLE_NODE_RADIUS = 6

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

  function getDescendantsWidth(personId: PersonId): number {
    const children = findChildren(personId)
    if (children.length === 0) return BUBBLE_RADIUS * 2 + X_OFFSET / 4
    return children.reduce((acc, child) => acc + getDescendantsWidth(child.personId), 0)
  }

  function drawPersonSpouseAndChildren(parentNodeId: PersonId, parentPosition: { x: number; y: number }) {
    const children = findChildren(parentNodeId)

    const totalLayerWidth = children.reduce((acc, child) => acc + getDescendantsWidth(child.personId), 0)

    children.forEach((child, index) => {
      const previousSiblingSumOfWidth = children
        .slice(0, index)
        .reduce((acc, child) => acc + getDescendantsWidth(child.personId), 0)

      const x = parentPosition.x + previousSiblingSumOfWidth - totalLayerWidth / 2 + getDescendantsWidth(child.personId) / 2
      const y = parentPosition.y + Y_OFFSET

      const childNode = makePersonNode(child.personId, { x, y })
      insertNode(childNode)
      insertEdge(makeParentChildEdge(parentNodeId, child.personId))

      drawPersonSpouseAndChildren(child.personId, { x, y })
    })

    const spouses = findSpouses(parentNodeId)
    spouses.forEach((spouse, index) => {
      const x = parentPosition.x + (index + 1) * X_OFFSET
      const y = parentPosition.y
      const spouseNode = makePersonNode(spouse.personId, { x, y })
      insertNode(spouseNode)
      const parentNode = nodes.get(parentNodeId)!
      const coupleNode = makeCoupleNode(parentNode, spouseNode)
      insertNode(coupleNode)
      insertEdges(makeCoupleEdges(coupleNode, parentNode, spouseNode))
    })
  }

  // // Add origin person node
  const originPersonNode = makePersonNode(originPersonId, { x: 0, y: 0 })
  insertNode(originPersonNode)
  drawPersonSpouseAndChildren(originPersonId, { x: 0, y: 0 })

  // // Add children
  // const children = findChildren(originPersonId)
  // const childrenNodes = children.map((child, index) => {
  //   const x = index * X_OFFSET
  //   const y = Y_OFFSET
  //   const childNode = makePersonNode(child.personId, { x, y, parentId: originPersonId })
  //   insertNode(childNode)
  //   insertEdge(makeParentChildEdge(originPersonId, child.personId))
  //   return childNode
  // })

  // const spouses = findSpouses(originPersonId)
  // const spouseNodes = spouses.map((spouse, index) => {
  //   const x = originPersonNode.position.x + (index + 1) * X_OFFSET
  //   const y = originPersonNode.position.y
  //   const spouseNode = makePersonNode(spouse.personId, { x, y })
  //   insertNode(spouseNode)
  // const coupleNode = makeCoupleNode(originPersonNode, spouseNode)
  // insertNode(coupleNode)
  // insertEdges(makeCoupleEdges(coupleNode, originPersonNode, spouseNode))
  //   return spouseNode
  // })

  return { nodes, edges }

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
