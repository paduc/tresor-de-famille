import * as React from 'react'
import { Panel } from 'reactflow'

import axios from 'axios'
import { useCallback, useState } from 'react'
import { QueryClient, QueryClientProvider, useMutation, useQuery } from 'react-query'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'
import { RelationshipId } from '../../domain/RelationshipId.js'
import { makePersonId } from '../../libs/makePersonId.js'
import { makeRelationshipId } from '../../libs/makeRelationshipId.js'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle.js'
import { ClientOnly } from '../_components/ClientOnly.js'
import { useLoggedInSession } from '../_components/SessionContext.js'
import { AppLayout } from '../_components/layout/AppLayout.js'
import { SetOriginPersonForFamilyTreeURL } from './SetOriginPersonForFamilyTreeURL.js'
import { ContextualMenu, ContextualMenuProvider } from './_components/ContextualMenu.js'
import { FamilySwitcher } from './_components/FamilySwitcher.js'
import { SearchPanel, SearchPanelProps } from './_components/SearchPanel.js'
import {
  NewRelationshipAction,
  PendingNodeRelationshipAction,
  PersonInTree,
  RelationshipInTree,
} from './_components/TreeTypes.js'
import { EntireFamilyFamilyTree } from './_components/EntireFamilyFamilyTree/EntireFamilyFamilyTree.js'
import { removeRelationship } from './_components/removeRelationship.js'
import { saveNewRelationship } from './_components/saveNewRelationship.js'
import { primaryButtonStyles } from '../_components/Button.js'

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

  const {
    initialPersons: persons,
    initialRelationships: relationships,
    initialOriginPersonId: originPersonId,
    familyId,
  } = familyPageProps

  console.log('ClientOnlyFamilyPage render', { persons, relationships, initialOriginPersonId, familyId })

  const { userFamilies } = useLoggedInSession()
  const currentFamilyName = userFamilies?.find(({ familyId: id }) => id === familyId)?.familyName

  if (!currentFamilyName) return null

  const [pendingRelationshipAction, setPendingRelationshipAction] = useState<PendingNodeRelationshipAction | null>(null)

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

  console.log('origin', origin)

  return (
    <AppLayout>
      <div className='w-full h-screen relative'>
        <EntireFamilyFamilyTree persons={persons} relationships={relationships} originPersonId={originPersonId}>
          <Panel position='top-left'>
            <FamilySwitcher currentFamilyId={familyId} />
            {originPersonId ? null : <NoFamilyTree currentFamilyId={familyId} />}
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
        </EntireFamilyFamilyTree>
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
    <div className='text-gray-600 mt-24'>
      <div className='mr-3 text-lg font-bold'>Cette famille n'a pas encore d'arbre généalogique.</div>
      <div className='mt-2'>
        <form onSubmit={handleSubmit}>
          <label htmlFor='family-switcher'>Nommez une personne qui servira de point de départ (i.e. l'aïeul commun)</label>
          <input
            type='text'
            className={
              'mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base'
            }
            name='originName'
            placeholder='ex: Jean Bonnot'
          />
          <div className='mt-2'>
            <button className={`${primaryButtonStyles}`}>Valider</button>
          </div>
        </form>
      </div>
    </div>
  )
}
