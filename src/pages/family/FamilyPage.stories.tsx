import * as React from 'react'
import { FamilyPage } from './FamilyPage'
import { SessionContext } from '../_components/SessionContext'
import { getUuid } from '../../libs/getUuid'
import { SearchIndex } from 'algoliasearch'
import { PersonSearchContext } from '../_components/usePersonSearch'

const fakePersonSearch = async (query: string) => {
  return {
    hits: [
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
    ],
  }
}

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

const fakePhoto = () => {
  const nbr = Math.round(Math.random() * 57) + 1
  const gender = ['men', 'women'][Math.round(Math.random() * 100) % 2]
  return `https://randomuser.me/api/portraits/${gender}/${nbr}.jpg`
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

export const UneSeulePerson = () => {
  const selectedPersonId = getUuid()
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
        persons={[{ personId: selectedPersonId, name: 'Pierrot', profilePicUrl: fakeProfilePicUrl }]}
        defaultSelectedPersonId={selectedPersonId}
      />
    </SessionContext.Provider>
  )
}

export const PlusieursPersonnes = () => {
  const selectedPersonId = getUuid()
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
        persons={[
          { personId: selectedPersonId, name: 'Pierrot', profilePicUrl: fakeProfilePicUrl },
          { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
          { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
          { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
          { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
          { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
          { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
          { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
          { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
          { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
          { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
          { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
          { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
          { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
          { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
          { personId: getUuid(), name: 'Prénom Nom', profilePicUrl: fakePhoto() },
        ]}
        defaultSelectedPersonId={selectedPersonId}
      />
    </SessionContext.Provider>
  )
}
