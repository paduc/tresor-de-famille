import * as React from 'react'
import { FamilyPage } from './FamilyPage'
import { SessionContext } from '../_components/SessionContext'
import { getUuid } from '../../libs/getUuid'
import { UUID } from '../../domain'
import { SearchIndex } from 'algoliasearch'
import { PersonSearchContext } from '../_components/usePersonSearch'

const fakePerson1Id = getUuid()
const fakePerson2Id = getUuid()
const fakePerson3Id = getUuid()

const fakePersonSearch = async (query: string) => {
  return {
    hits: [
      { objectID: fakePerson1Id, name: 'John Doe' },
      { objectID: fakePerson2Id, name: 'Zelda Moroney' },
      { objectID: fakePerson3Id, name: 'Claire Politi' },
    ],
  }
}

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

const fakePhoto = (gender?: 'men' | 'women') => {
  const nbr = Math.round(Math.random() * 57) + 1
  const genderUsed = gender || ['men', 'women'][Math.round(Math.random() * 100) % 2]
  return `https://randomuser.me/api/portraits/${genderUsed}/${nbr}.jpg`
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
  const originPersonId = 'origin' as UUID
  const papaId = getUuid()
  const mamaId = getUuid()
  // const mama2Id = getUuid()
  const mama2Id = 'mama2' as UUID
  const fille1Id = getUuid()
  const fille2Id = getUuid()
  const petiteFille1Id = getUuid()
  const bonPapaId = getUuid()
  const bonneMamieId = getUuid()
  const mamyId = getUuid()
  const papyId = getUuid()
  const broId = getUuid()
  const sisId = getUuid()
  // const wifeId = getUuid()
  const wifeId = 'wife' as UUID
  const fils1Id = 'fils1' as UUID
  // const fils2Id = getUuid()
  const fils2Id = 'fils2' as UUID
  const halfBroId = getUuid()
  return (
    <SessionContext.Provider
      value={{
        isLoggedIn: true,
        userName: 'toto',
        isAdmin: false,
        profilePic: fakeProfilePicUrl,
        arePhotosEnabled: true,
        arePersonsEnabled: true,
        areThreadsEnabled: true,
        areVideosEnabled: true,
      }}>
      <FamilyPage
        initialPersons={[
          { personId: originPersonId, name: 'Pierrot', profilePicUrl: fakeProfilePicUrl },
          { personId: wifeId, name: 'Anne-Sophie', profilePicUrl: fakePhoto('women') },
          { personId: papaId, name: 'Papa', profilePicUrl: fakePhoto('men') },
          { personId: bonPapaId, name: 'Bon-Papa', profilePicUrl: fakePhoto('men') },
          { personId: bonneMamieId, name: 'Bonne-Mamie', profilePicUrl: fakePhoto('women') },
          { personId: mamyId, name: 'Mamy', profilePicUrl: fakePhoto('women') },
          { personId: papyId, name: 'Papy', profilePicUrl: fakePhoto('men') },
          { personId: mamaId, name: 'Maman', profilePicUrl: fakePhoto('women') },
          { personId: mama2Id, name: 'Secretaire', profilePicUrl: fakePhoto('women') },
          { personId: halfBroId, name: 'Demi-Frérot', profilePicUrl: fakePhoto('men') },
          { personId: broId, name: 'Frérot', profilePicUrl: fakePhoto('men') },
          { personId: sisId, name: 'Soeurette', profilePicUrl: fakePhoto('women') },
          { personId: fille1Id, name: 'Fille 1', profilePicUrl: fakePhoto('women') },
          { personId: fille2Id, name: 'Fille 2', profilePicUrl: fakePhoto('women') },
          { personId: fils1Id, name: 'Fils 1', profilePicUrl: fakePhoto('men') },
          { personId: fils2Id, name: 'Fils 2', profilePicUrl: fakePhoto('men') },
          { personId: petiteFille1Id, name: 'Petite-fille 1', profilePicUrl: fakePhoto('women') },
          { personId: fakePerson1Id, name: 'John Doe', profilePicUrl: fakePhoto('men') },
          { personId: fakePerson2Id, name: 'Zelda Moroney', profilePicUrl: fakePhoto('women') },
          { personId: fakePerson3Id, name: 'Claire Politi', profilePicUrl: fakePhoto('women') },
          // { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
          // { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
        ]}
        initialRelationships={[
          { type: 'spouses', spouseIds: [originPersonId, wifeId] },
          // { type: 'spouses', spouseIds: [papaId, mamaId] },
          // { type: 'parent', childId: originPersonId, parentId: papaId },
          // { type: 'parent', childId: originPersonId, parentId: mamaId },
          // { type: 'parent', childId: halfBroId, parentId: papaId },
          // { type: 'parent', childId: broId, parentId: mamaId },
          // { type: 'parent', childId: broId, parentId: papaId },
          // { type: 'parent', childId: sisId, parentId: mamaId },
          // { type: 'parent', childId: sisId, parentId: papaId },
          { type: 'parent', childId: fille1Id, parentId: originPersonId },
          // { type: 'parent', childId: fille1Id, parentId: wifeId },
          { type: 'parent', childId: fille2Id, parentId: originPersonId },
          { type: 'parent', childId: fille2Id, parentId: wifeId },
          { type: 'parent', childId: fils1Id, parentId: originPersonId },
          { type: 'parent', childId: fils1Id, parentId: wifeId },
          { type: 'parent', childId: fils2Id, parentId: originPersonId },
          { type: 'parent', childId: fils2Id, parentId: mama2Id },
          // { type: 'parent', childId: petiteFille1Id, parentId: fille2Id },
          // { type: 'parent', childId: papaId, parentId: bonPapaId },
          // { type: 'parent', childId: papaId, parentId: bonneMamieId },
          // { type: 'parent', childId: mamaId, parentId: papyId },
          // { type: 'parent', childId: mamaId, parentId: mamyId },
        ]}
        initialOriginPersonId={originPersonId}
      />
    </SessionContext.Provider>
  )
}
