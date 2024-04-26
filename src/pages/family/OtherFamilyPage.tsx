import * as React from 'react'
import type { Edge, Node } from 'reactflow'
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
import { FamilyTree } from './_components/familyTree/FamilyTree.js'
import { removeRelationship } from './_components/removeRelationship.js'
import { saveNewRelationship } from './_components/saveNewRelationship.js'
import { closeFamilyMapper } from './mappers/closeFamilyMapper.js'
import { useLoggedInSession } from '../_components/SessionContext.js'
import { useMutation, useQuery, QueryClient, QueryClientProvider } from 'react-query'
import axios from 'axios'
import { SetOriginPersonForFamilyTreeURL } from './SetOriginPersonForFamilyTreeURL.js'
import { filterUniqueById } from '../../libs/filterUniqueById.js'

export type FamilyPageProps = {
  initialPersons: PersonInTree[]
  initialRelationships: RelationshipInTree[]
  initialOriginPersonId: PersonId | undefined
  familyId: FamilyId
}

const queryClient = new QueryClient()

export const OtherFamilyPage = withBrowserBundle((props: FamilyPageProps) => {
  return (
    <ClientOnly>
      <ContextualMenuProvider>
        <QueryClientProvider client={queryClient}>
          <ClientEnabledFamilyPage {...props} />
        </QueryClientProvider>
      </ContextualMenuProvider>
    </ClientOnly>
  )
})

const fetchFamilyPageProps = (familyId: FamilyId) => async () => {
  throw new Error('fetchFamilyPageProps as API is not implemented')
  return (await axios<FamilyPageProps>(`/api/familyTree/${familyId}`)).data
}

const familyPagePropsQueryKey = (familyId: FamilyId) => ['family', familyId] as const

const familyPagePropsQueryOptions = ({ familyId, initialData }: { familyId: FamilyId; initialData: FamilyPageProps }) => ({
  queryFn: fetchFamilyPageProps(familyId),
  queryKey: familyPagePropsQueryKey(familyId),
  initialData,
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
})

function useFamilyPageProps({ familyId, initialData }: { familyId: FamilyId; initialData: FamilyPageProps }) {
  console.log('useFamilyPageProps', { familyId, initialData })
  const res = useQuery(familyPagePropsQueryOptions({ familyId, initialData }))

  return res.data
}

const ClientEnabledFamilyPage = (props: FamilyPageProps) => {
  console.log('ClientEnabledFamilyPage', props)
  const familyPageProps = useFamilyPageProps({
    familyId: props.familyId,
    initialData: props,
  })

  if (!familyPageProps) return null

  const initialOriginPersonId = familyPageProps.initialOriginPersonId

  const { initialPersons: persons, initialRelationships: relationships, familyId } = familyPageProps

  console.log('ClientOnlyFamilyPage render', { persons, relationships, initialOriginPersonId, familyId })

  const { userFamilies } = useLoggedInSession()
  const currentFamilyName = userFamilies?.find(({ familyId: id }) => id === familyId)?.familyName

  if (!currentFamilyName) return null

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const [pendingRelationshipAction, setPendingRelationshipAction] = useState<PendingNodeRelationshipAction | null>(null)

  const origin = React.useMemo(() => {
    if (!initialOriginPersonId) return null
    return { personId: initialOriginPersonId, x: 0, y: 0 }
  }, [initialOriginPersonId])

  /**
   * Map the persons and relationships to nodes and edges
   */
  React.useEffect(() => {
    console.log('OtherFamilyPage: useEffect', { persons, relationships, origin })
    if (!origin) return

    const { nodes, edges } = closeFamilyMapper({ persons, relationships, origin })

    setNodes(filterUniqueById(nodes))
    setEdges(filterUniqueById(edges))
  }, [persons, relationships, origin])

  const onRelationshipButtonPressed = useCallback((nodeId: string, newRelationshipAction: NewRelationshipAction) => {
    // Move the nodeId and the action to state
    setPendingRelationshipAction({ personId: nodeId as PersonId, relationshipAction: newRelationshipAction })
  }, [])

  const onSearchPersonSelected = useCallback<SearchPanelProps['onPersonSelected']>(async (args) => {
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
      // @ts-ignore
      queryClient.setQueryData<FamilyPageProps>(familyPagePropsQueryKey(familyId), (oldData) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          initialPersons: persons,
          initialRelationships: relationships,
        }
      })
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
  }, [])

  const onRemoveRelationship = useCallback(async (relationshipId: RelationshipId) => {
    try {
      // TODO: display loading state
      await removeRelationship({ relationshipId })
      // @ts-ignore
      queryClient.setQueryData<FamilyPageProps>(familyPagePropsQueryKey(familyId), (oldData) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          initialRelationships: oldData.initialRelationships.filter((rel) => rel.id !== relationshipId),
        }
      })
    } catch (error) {}
  }, [])

  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      console.log('onSelectionChange', { nodes, edges })

      // if (nodes.length !== 1) return
      // if (!origin) return

      // const selectedNode = nodes[0]
      // if (selectedNode.id === origin.personId) return
      // const { x, y } = selectedNode.position
      // // @ts-ignore
      // queryClient.setQueryData<FamilyPageProps>(familyPagePropsQueryKey(familyId), (oldData) => {
      //   if (!oldData) return oldData
      //   return {
      //     ...oldData,
      //     initialOriginPersonId: { personId: selectedNode.id as PersonId, x, y },
      //   }
      // })
    },
    [origin]
  )

  console.log('origin', origin)

  return (
    <AppLayout>
      <div className='w-full h-screen relative'>
        <FamilyTree
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onSelectionChange={onSelectionChange}>
          <Panel position='top-left'>
            <FamilySwitcher currentFamilyId={familyId} />
          </Panel>
          <Panel position='top-center'>
            <div>{currentFamilyName}</div>
            {origin ? null : <NoFamilyTree currentFamilyId={familyId} />}
            <SearchPanel
              onPersonSelected={onSearchPersonSelected}
              onRemoveRelationship={onRemoveRelationship}
              pendingRelationshipAction={pendingRelationshipAction}
              relationships={relationships}
              persons={persons}
              currentFamilyId={familyId}
              inCurrentFamilyOnly
            />
          </Panel>
          <Panel position='top-right'>
            <ContextualMenu onRelationshipButtonPressed={onRelationshipButtonPressed} />
          </Panel>
        </FamilyTree>
      </div>
    </AppLayout>
  )
}

function NoFamilyTree({ currentFamilyId }: { currentFamilyId: FamilyId }) {
  const mutation = useMutation({
    mutationFn: async (name: string) => {
      console.log('mutation', name)
      // return Promise.resolve({ name, personId: makePersonId() })
      return await axios.post<{ name: string; personId: PersonId }>(SetOriginPersonForFamilyTreeURL(), {
        name,
        familyId: currentFamilyId,
      })
    },
    onSuccess: async ({ data }) => {
      console.log('mutation success', data)

      // @ts-ignore
      queryClient.setQueryData(familyPagePropsQueryKey(currentFamilyId), (oldData: FamilyPageProps | undefined) => {
        console.log('mutation setQueryData, oldData', oldData)
        if (!oldData) return oldData
        return {
          ...oldData,
          initialPersons: [...oldData.initialPersons, data as PersonInTree],
          initialOriginPersonId: data.personId,
        }
      })
    },
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    console.log('handleSubmit', event.currentTarget.originName.value)
    event.preventDefault()
    mutation.mutate(event.currentTarget.originName.value)
  }

  return (
    <div>
      <div>Cette famille n'a pas encore d'arbre généalogique.</div>
      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor='family-switcher'>Nommez la personne qui sert de point de départ</label>
          <input type='text' name='originName' placeholder='Jean Biche' />
          <button>C'est parti</button>
        </form>
      </div>
    </div>
  )
}
