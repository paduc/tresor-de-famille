import * as React from 'react'
import type { Edge, Node, ReactFlowInstance } from 'reactflow'
import { Panel, useEdgesState, useNodesState } from 'reactflow'

import { useCallback, useState } from 'react'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'
import { RelationshipId } from '../../domain/RelationshipId.js'
import { makePersonId } from '../../libs/makePersonId.js'
import { makeRelationshipId } from '../../libs/makeRelationshipId.js'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle.js'
import { ClientOnly } from '../_components/ClientOnly.js'
import { AppLayout } from '../_components/layout/AppLayout.js'
import { ContextualMenu, ContextualMenuProvider } from './_components/ContextualMenu.js'
import { FamilySwitcher } from './_components/FamilySwitcher.js'
import { SearchPanel, SearchPanelProps } from './_components/SearchPanel.js'
import {
  NewRelationshipAction,
  PendingNodeRelationshipAction,
  PersonInTree,
  RelationshipInTree,
} from './_components/TreeTypes.js'
import { CoupleNode } from './_components/familyTree/CoupleNode.js'
import { FamilyTree } from './_components/familyTree/FamilyTree.js'
import { PersonNode } from './_components/familyTree/PersonNode.js'
import { removeRelationship } from './_components/removeRelationship.js'
import { saveNewRelationship } from './_components/saveNewRelationship.js'
import { closeFamilyMapper } from './mappers/closeFamilyMapper.js'

// @ts-ignore
export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const NodeListenerContext = React.createContext<((nodeId: string, relationshipAction: NewRelationshipAction) => void) | null>(
  null
)

const nodeTypes = {
  person: PersonNode,
  couple: CoupleNode,
}

export type FamilyPageProps = {
  initialPersons: PersonInTree[]
  initialRelationships: RelationshipInTree[]
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
    const { nodes, edges } = closeFamilyMapper({ persons, relationships, origin })

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
        const secondaryRelationships: RelationshipInTree[] = newSecondaryRelationshipsCb
          ? newSecondaryRelationshipsCb(targetPersonId)
          : []

        // TODO: display loading state
        const { persons, relationships } = await saveNewRelationship({
          newPerson,
          relationship: newRelationship,
          secondaryRelationships,
          familyId,
        })

        // Given their could be new persons created during the saveNewRelationship
        // use the returned persons and relationships
        setPersons(persons)
        setRelationships(relationships)
      } catch (error) {
        console.error('Failed to save relationships', error)
        alert("La nouvelle relation n'a malheureusement pas pu être sauvegardée.")
      }

      function getNewPerson(person: Exclude<typeof selectedPerson, null>): {
        newPerson?: PersonInTree
        targetPersonId: PersonId
      } {
        if (person.type === 'unknown') {
          const newPersonId = makePersonId()
          return {
            newPerson: { personId: newPersonId, name: person.name, profilePicUrl: null },
            targetPersonId: newPersonId,
          }
        }

        return { targetPersonId: person.personId }
      }

      function getNewRelationship(sourcePersonId: PersonId): RelationshipInTree {
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
        <div className='w-full h-screen relative'>
          <FamilyTree
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={setReactFlowInstance}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}>
            <Panel position='top-left'>
              <FamilySwitcher currentFamilyId={familyId} />
            </Panel>
            <Panel position='top-center'>
              <SearchPanel
                onPersonSelected={onSearchPersonSelected}
                onRemoveRelationship={onRemoveRelationship}
                pendingRelationshipAction={pendingRelationshipAction}
                relationships={relationships}
                persons={persons}
                currentFamilyId={familyId}
              />
            </Panel>
            <Panel position='top-right'>
              <ContextualMenu onRelationshipButtonPressed={onRelationshipButtonPressed} />
            </Panel>
          </FamilyTree>
        </div>
      </NodeListenerContext.Provider>
    </AppLayout>
  )
}
