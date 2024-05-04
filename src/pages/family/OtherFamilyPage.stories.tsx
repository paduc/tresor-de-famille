import { SearchIndex } from 'algoliasearch'
import * as React from 'react'
import { makePersonId } from '../../libs/makePersonId.js'
import { PersonSearchContext } from '../_components/usePersonSearch.js'
import { OtherFamilyPage } from './OtherFamilyPage.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { SessionContext } from '../_components/SessionContext.js'
import { FamilyColorCodes } from '../../libs/ssr/FamilyColorCodes.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { makeFamilyId } from '../../libs/makeFamilyId.js'
import { QueryClient, QueryClientProvider } from 'react-query'
import { makeRelationshipId } from '../../libs/makeRelationshipId.js'

const fakeProfileUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

const fakePhoto = (gender?: 'men' | 'women') => {
  const nbr = Math.round(Math.random() * 57) + 1
  const genderUsed = gender || ['men', 'women'][Math.round(Math.random() * 100) % 2]
  return `https://randomuser.me/api/portraits/${genderUsed}/${nbr}.jpg`
}

const fakePerson1Id = makePersonId()
const fakePerson2Id = makePersonId()
const fakePerson3Id = makePersonId()

const fakePersonSearch = async (query: string) => {
  return {
    hits: [
      { objectID: fakePerson1Id, name: 'John Doe' },
      { objectID: fakePerson2Id, name: 'Zelda Moroney' },
      { objectID: fakePerson3Id, name: 'Claire Politi' },
    ],
  }
}

const john = { name: 'John', personId: makePersonId(), profilePicUrl: '' }
const jane = { name: 'Jane', personId: makePersonId(), profilePicUrl: '' }

const child1 = { name: 'Child 1', personId: makePersonId(), profilePicUrl: '' }
const inlaw1 = { name: 'Inlaw 1', personId: makePersonId(), profilePicUrl: '' }
const grandChild1 = { name: 'Grandchild 1', personId: makePersonId(), profilePicUrl: '' }
const grandChild2 = { name: 'Grandchild 2', personId: makePersonId(), profilePicUrl: '' }
const grandChild3 = { name: 'Grandchild 3', personId: makePersonId(), profilePicUrl: '' }

const child2 = { name: 'Child 2', personId: makePersonId(), profilePicUrl: '' }
const inlaw2 = { name: 'Inlaw 2', personId: makePersonId(), profilePicUrl: '' }

const child3 = { name: 'Child 3', personId: makePersonId(), profilePicUrl: '' }
const inlaw3 = { name: 'Inlaw 3', personId: makePersonId(), profilePicUrl: '' }
const grandChild4 = { name: 'Grandchild 4', personId: makePersonId(), profilePicUrl: '' }
const greatGrandChild1 = { name: 'Great Grandchild 1', personId: makePersonId(), profilePicUrl: '' }
const greatGrandChild2 = { name: 'Great Grandchild 2', personId: makePersonId(), profilePicUrl: '' }

const persons = [
  john,
  jane,
  child1,
  inlaw1,
  child2,
  inlaw2,
  child3,
  inlaw3,
  grandChild1,
  grandChild2,
  grandChild3,
  grandChild4,
  greatGrandChild1,
  greatGrandChild2,
]

export default {
  title: 'Page Famille (autre)',
  component: OtherFamilyPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story: any) => {
      return (
        <PersonSearchContext.Provider value={{ search: fakePersonSearch } as unknown as SearchIndex}>
          <Story />
        </PersonSearchContext.Provider>
      )
    },
  ],
}

const fakeSession = {
  isLoggedIn: true,
  userId: 'a' as AppUserId,
  userFamilies: [
    {
      familyId: 'a' as FamilyId,
      familyName: 'Votre espace personnel',
      about: '',
      color: FamilyColorCodes[0],
      isUserSpace: true,
    },
    {
      familyId: 'b' as FamilyId,
      familyName: 'Famille A',
      about: 'La famille A',
      color: FamilyColorCodes[1],
      isUserSpace: false,
    },
    {
      familyId: makeFamilyId(),
      familyName: 'Famille B',
      about: 'La famille B',
      color: FamilyColorCodes[2],
      isUserSpace: false,
    },
    {
      familyId: makeFamilyId(),
      familyName: 'Famille C',
      about: 'La famille C',
      color: FamilyColorCodes[3],
      isUserSpace: false,
    },
  ],

  userName: 'Jean-Michel Trotro',
  profilePic: fakeProfileUrl,
  isAdmin: false,
  arePhotosEnabled: true,
  areThreadsEnabled: true,
  areVideosEnabled: true,
  arePersonsEnabled: true,
}
export const OrigineAChoisir = () => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <SessionContext.Provider value={fakeSession}>
        <OtherFamilyPage
          initialPersons={persons}
          initialRelationships={
            [
              // { id: makeRelationshipId(), spouseIds: [john.personId, jane.personId], type: 'spouses' },
              // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child1.personId },
              // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child1.personId, inlaw1.personId] },
              // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild1.personId },
              // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild2.personId },
              // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild3.personId },
              // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child2.personId },
              // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child2.personId, inlaw2.personId] },
              // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child3.personId },
              // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child3.personId, inlaw3.personId] },
              // { id: makeRelationshipId(), type: 'parent', parentId: child3.personId, childId: grandChild4.personId },
              // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild1.personId },
              // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild2.personId },
            ]
          }
          initialOriginPersonId={undefined}
          familyId={'b' as FamilyId}
        />
      </SessionContext.Provider>
    </QueryClientProvider>
  )
}

export const OrigineChoisie = () => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <SessionContext.Provider value={fakeSession}>
        <OtherFamilyPage
          initialPersons={persons}
          initialRelationships={
            [
              // { id: makeRelationshipId(), spouseIds: [john.personId, jane.personId], type: 'spouses' },
              // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child1.personId },
              // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child1.personId, inlaw1.personId] },
              // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild1.personId },
              // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild2.personId },
              // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild3.personId },
              // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child2.personId },
              // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child2.personId, inlaw2.personId] },
              // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child3.personId },
              // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child3.personId, inlaw3.personId] },
              // { id: makeRelationshipId(), type: 'parent', parentId: child3.personId, childId: grandChild4.personId },
              // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild1.personId },
              // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild2.personId },
            ]
          }
          initialOriginPersonId={john.personId}
          familyId={'b' as FamilyId}
        />
      </SessionContext.Provider>
    </QueryClientProvider>
  )
}

export const AvecFamilleComplétée = () => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <SessionContext.Provider value={fakeSession}>
        <OtherFamilyPage
          initialPersons={persons}
          initialRelationships={[
            { id: makeRelationshipId(), spouseIds: [john.personId, jane.personId], type: 'spouses' },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child1.personId },
            { id: makeRelationshipId(), type: 'spouses', spouseIds: [child1.personId, inlaw1.personId] },
            { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild1.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild2.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild3.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child2.personId },
            { id: makeRelationshipId(), type: 'spouses', spouseIds: [child2.personId, inlaw2.personId] },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child3.personId },
            { id: makeRelationshipId(), type: 'spouses', spouseIds: [child3.personId, inlaw3.personId] },
            { id: makeRelationshipId(), type: 'parent', parentId: child3.personId, childId: grandChild4.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild1.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild2.personId },
          ]}
          initialOriginPersonId={john.personId}
          familyId={'b' as FamilyId}
        />
      </SessionContext.Provider>
    </QueryClientProvider>
  )
}
