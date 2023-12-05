import * as React from 'react'
import { FamilyPage } from './FamilyPage'
import { SessionContext } from '../_components/SessionContext'
import { getUuid } from '../../libs/getUuid'
import { UUID } from '../../domain'
import { SearchIndex } from 'algoliasearch'
import { PersonSearchContext } from '../_components/usePersonSearch'
import { makeRelationshipId } from '../../libs/makeRelationshipId'
import { makePersonId } from '../../libs/makePersonId'
import { PersonId } from '../../domain/PersonId'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

const fakePhoto = (gender?: 'men' | 'women') => {
  const nbr = Math.round(Math.random() * 57) + 1
  const genderUsed = gender || ['men', 'women'][Math.round(Math.random() * 100) % 2]
  return `https://randomuser.me/api/portraits/${genderUsed}/${nbr}.jpg`
}

const fakePerson1Id = makePersonId()
const fakePerson2Id = makePersonId()
const fakePerson3Id = makePersonId()

const originPersonId = 'origin' as PersonId
const papaId = makePersonId()
const mamaId = makePersonId()
const mama2Id = 'mama2' as PersonId
const fille1Id = makePersonId()
const fille2Id = makePersonId()
const petiteFille1Id = makePersonId()
const bonPapaId = makePersonId()
const bonneMamieId = makePersonId()
const mamyId = makePersonId()
const papyId = makePersonId()
const broId = makePersonId()
const sisId = makePersonId()
// const wifeId = makePersonId()
const wifeId = 'wife' as PersonId
const fils1Id = 'fils1' as PersonId
// const fils2Id = makePersonId()
const fils2Id = 'fils2' as PersonId
const halfBroId = makePersonId()

const initialPersons = [
  { personId: originPersonId, name: 'Pierrot', profilePicUrl: fakeProfilePicUrl },
  { personId: wifeId, name: 'Anne-Sophie', profilePicUrl: fakePhoto('women') },
  // { personId: papaId, name: 'Papa', profilePicUrl: fakePhoto('men') },
  // { personId: bonPapaId, name: 'Bon-Papa', profilePicUrl: fakePhoto('men') },
  // { personId: bonneMamieId, name: 'Bonne-Mamie', profilePicUrl: fakePhoto('women') },
  // { personId: mamyId, name: 'Mamy', profilePicUrl: fakePhoto('women') },
  // { personId: papyId, name: 'Papy', profilePicUrl: fakePhoto('men') },
  // { personId: mamaId, name: 'Maman', profilePicUrl: fakePhoto('women') },
  // { personId: mama2Id, name: 'Secretaire', profilePicUrl: fakePhoto('women') },
  // { personId: halfBroId, name: 'Demi-Frérot', profilePicUrl: fakePhoto('men') },
  // { personId: broId, name: 'Frérot', profilePicUrl: fakePhoto('men') },
  // { personId: sisId, name: 'Soeurette', profilePicUrl: fakePhoto('women') },
  { personId: fille1Id, name: 'Fille 1', profilePicUrl: fakePhoto('women') },
  // { personId: fille2Id, name: 'Fille 2', profilePicUrl: fakePhoto('women') },
  { personId: fils1Id, name: 'Fils 1', profilePicUrl: fakePhoto('men') },
  // { personId: fils2Id, name: 'Fils 2', profilePicUrl: fakePhoto('men') },
  // { personId: petiteFille1Id, name: 'Petite-fille 1', profilePicUrl: fakePhoto('women') },
  { personId: fakePerson1Id, name: 'John Doe', profilePicUrl: fakePhoto('men') },
  { personId: fakePerson2Id, name: 'Zelda Moroney', profilePicUrl: fakePhoto('women') },
  { personId: fakePerson3Id, name: 'Claire Politi', profilePicUrl: fakePhoto('women') },
  // { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
  // { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
]

const fakePersonSearch = async (query: string) => {
  return {
    hits: [
      { objectID: fakePerson1Id, name: 'John Doe' },
      { objectID: fakePerson2Id, name: 'Zelda Moroney' },
      { objectID: fakePerson3Id, name: 'Claire Politi' },
      ...initialPersons.map((person) => ({ objectID: person.personId, name: person.name })),
    ],
  }
}

export default {
  title: 'Page Famille',
  component: FamilyPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story: any) => {
      return (
        <SessionContext.Provider
          value={{
            isLoggedIn: true,
            userId: 'a' as AppUserId,

            userFamilies: [],

            userName: 'Toto',
            profilePic: fakeProfilePicUrl,
            isAdmin: false,
            arePhotosEnabled: true,
            areThreadsEnabled: false,
            areVideosEnabled: false,
            arePersonsEnabled: true,
          }}>
          <PersonSearchContext.Provider value={{ search: fakePersonSearch } as unknown as SearchIndex}>
            <Story />
          </PersonSearchContext.Provider>
        </SessionContext.Provider>
      )
    },
  ],
}

// export const UneSeulePerson = () => {
//   const selectedPersonId = getUuid()
//   return (
//     <SessionContext.Provider
//       value={{
//         isLoggedIn: true,
// userId: 'a' as AppUserId,

// userFamilies: [],
//         userName: 'toto',
//         isAdmin: false,
//         profilePic: fakeProfilePicUrl,
//         arePhotosEnabled: true,
//         arePersonsEnabled: true,
//         areThreadsEnabled: true,
//         areVideosEnabled: true,
//       }}>
//       <FamilyPage
//         persons={[{ personId: selectedPersonId, name: 'Pierrot', profilePicUrl: fakeProfilePicUrl }]}
//         defaultSelectedPersonId={selectedPersonId}
//       />
//     </SessionContext.Provider>
//   )
// }

export const PlusieursPersonnes = () => {
  // const originPersonId = getUuid()

  return (
    <SessionContext.Provider
      value={{
        isLoggedIn: true,
        userId: 'a' as AppUserId,

        userFamilies: [],

        userName: 'toto',
        isAdmin: false,
        profilePic: fakeProfilePicUrl,
        arePhotosEnabled: true,
        arePersonsEnabled: true,
        areThreadsEnabled: true,
        areVideosEnabled: true,
        isFamilyPageEnabled: true,
      }}>
      <FamilyPage
        initialPersons={initialPersons}
        initialRelationships={[
          { id: makeRelationshipId(), type: 'spouses', spouseIds: [originPersonId, wifeId] },
          // { id: makeRelationshipId(), type: 'spouses', spouseIds: [papaId, mamaId] },
          // { id: makeRelationshipId(), type: 'parent', childId: originPersonId, parentId: papaId },
          // { id: makeRelationshipId(), type: 'parent', childId: originPersonId, parentId: mamaId },
          // { id: makeRelationshipId(), type: 'parent', childId: halfBroId, parentId: papaId },
          // { id: makeRelationshipId(), type: 'parent', childId: broId, parentId: mamaId },
          // { id: makeRelationshipId(), type: 'parent', childId: broId, parentId: papaId },
          // { id: makeRelationshipId(), type: 'parent', childId: sisId, parentId: mamaId },
          // { id: makeRelationshipId(), type: 'parent', childId: sisId, parentId: papaId },
          // { id: makeRelationshipId(), type: 'parent', childId: fille1Id, parentId: originPersonId },
          // { id: makeRelationshipId(), type: 'parent', childId: fille1Id, parentId: wifeId },
          // { id: makeRelationshipId(), type: 'parent', childId: fille2Id, parentId: originPersonId },
          // { id: makeRelationshipId(), type: 'parent', childId: fille2Id, parentId: wifeId },
          // { id: makeRelationshipId(), type: 'parent', childId: fils1Id, parentId: originPersonId },
          // { id: makeRelationshipId(), type: 'parent', childId: fils1Id, parentId: wifeId },
          // { id: makeRelationshipId(), type: 'parent', childId: fils2Id, parentId: originPersonId },
          // { id: makeRelationshipId(), type: 'parent', childId: fils2Id, parentId: mama2Id },
          // { id: makeRelationshipId(), type: 'parent', childId: petiteFille1Id, parentId: fille2Id },
          // { id: makeRelationshipId(), type: 'parent', childId: papaId, parentId: bonPapaId },
          // { id: makeRelationshipId(), type: 'parent', childId: papaId, parentId: bonneMamieId },
          // { id: makeRelationshipId(), type: 'parent', childId: mamaId, parentId: papyId },
          // { id: makeRelationshipId(), type: 'parent', childId: mamaId, parentId: mamyId },
        ]}
        initialOriginPersonId={originPersonId}
      />
    </SessionContext.Provider>
  )
}

export const PlusieursFamilles = () => {
  // const originPersonId = getUuid()

  return (
    <SessionContext.Provider
      value={{
        isLoggedIn: true,
        userId: 'a' as AppUserId,

        userFamilies: [
          {
            familyName: 'Famille 1',
            about: "C'est la famille 1, la number #1 quoi.",
            familyId: '1' as FamilyId,
          },
          {
            familyName: 'Famille 2',
            about: '',
            familyId: '2' as FamilyId,
          },
        ],

        userName: 'toto',
        isAdmin: false,
        profilePic: fakeProfilePicUrl,
        arePhotosEnabled: true,
        arePersonsEnabled: true,
        areThreadsEnabled: true,
        areVideosEnabled: true,
        isFamilyPageEnabled: true,
      }}>
      <FamilyPage
        familyId={'1' as FamilyId}
        initialPersons={initialPersons}
        initialRelationships={[
          { id: makeRelationshipId(), type: 'spouses', spouseIds: [originPersonId, wifeId] },
          // { id: makeRelationshipId(), type: 'spouses', spouseIds: [papaId, mamaId] },
          // { id: makeRelationshipId(), type: 'parent', childId: originPersonId, parentId: papaId },
          // { id: makeRelationshipId(), type: 'parent', childId: originPersonId, parentId: mamaId },
          // { id: makeRelationshipId(), type: 'parent', childId: halfBroId, parentId: papaId },
          // { id: makeRelationshipId(), type: 'parent', childId: broId, parentId: mamaId },
          // { id: makeRelationshipId(), type: 'parent', childId: broId, parentId: papaId },
          // { id: makeRelationshipId(), type: 'parent', childId: sisId, parentId: mamaId },
          // { id: makeRelationshipId(), type: 'parent', childId: sisId, parentId: papaId },
          // { id: makeRelationshipId(), type: 'parent', childId: fille1Id, parentId: originPersonId },
          // { id: makeRelationshipId(), type: 'parent', childId: fille1Id, parentId: wifeId },
          // { id: makeRelationshipId(), type: 'parent', childId: fille2Id, parentId: originPersonId },
          // { id: makeRelationshipId(), type: 'parent', childId: fille2Id, parentId: wifeId },
          // { id: makeRelationshipId(), type: 'parent', childId: fils1Id, parentId: originPersonId },
          // { id: makeRelationshipId(), type: 'parent', childId: fils1Id, parentId: wifeId },
          // { id: makeRelationshipId(), type: 'parent', childId: fils2Id, parentId: originPersonId },
          // { id: makeRelationshipId(), type: 'parent', childId: fils2Id, parentId: mama2Id },
          // { id: makeRelationshipId(), type: 'parent', childId: petiteFille1Id, parentId: fille2Id },
          // { id: makeRelationshipId(), type: 'parent', childId: papaId, parentId: bonPapaId },
          // { id: makeRelationshipId(), type: 'parent', childId: papaId, parentId: bonneMamieId },
          // { id: makeRelationshipId(), type: 'parent', childId: mamaId, parentId: papyId },
          // { id: makeRelationshipId(), type: 'parent', childId: mamaId, parentId: mamyId },
        ]}
        initialOriginPersonId={originPersonId}
      />
    </SessionContext.Provider>
  )
}
