import * as React from 'react'
import { SessionContext } from '../_components/SessionContext'
import { SharePage } from './SharePage'
import { makePersonId } from '../../libs/makePersonId'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { FamilyId } from '../../domain/FamilyId'
import { AppUserId } from '../../domain/AppUserId'
import { SearchIndex } from 'algoliasearch'
import { makeAppUserId } from '../../libs/makeUserId'
import { PersonSearchContext } from '../_components/usePersonSearch'
const fakePersonSearch = async (query: string) => {
  return {
    hits: [
      { objectID: makeAppUserId(), name: 'John Doe' },
      { objectID: makeAppUserId(), name: 'Zelda Moroney' },
      { objectID: makeAppUserId(), name: 'Claire Politi' },
      ,
    ],
  }
}
export default {
  title: 'Partage',
  component: SharePage,
  parameters: {
    layout: 'fullscreen',
    decorators: [
      (Story: any) => {
        return (
          <PersonSearchContext.Provider value={{ search: fakePersonSearch } as unknown as SearchIndex}>
            <Story />
          </PersonSearchContext.Provider>
        )
      },
    ],
  },
}

export const PremiereNouvelleFamille = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [
        {
          familyId: 'a' as FamilyId,
          familyName: 'Espace personnel',
          about: '',
        },
      ],

      userName: 'John Doe Adear',
      profilePic:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
      isAdmin: false,
      arePhotosEnabled: true,
      areThreadsEnabled: true,
      areVideosEnabled: false,
      arePersonsEnabled: true,
      isSharingEnabled: true,
      isFamilyPageEnabled: true,
      personId: makePersonId(),
    }}>
    <SharePage userFamilies={[]} />
  </SessionContext.Provider>
)

const familyId = makeFamilyId()
export const UneFamilleExistante = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [
        {
          familyId,
          familyName: 'Ma famille avec un nom trop trop trop trop long',
          about: '',
        },
      ],
      userName: 'John Doe Adear',
      profilePic:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
      isAdmin: false,
      arePhotosEnabled: true,
      areThreadsEnabled: true,
      areVideosEnabled: false,
      arePersonsEnabled: true,
      isSharingEnabled: true,
      isFamilyPageEnabled: true,
    }}>
    <SharePage
      userFamilies={[
        {
          familyId: makeFamilyId(),
          name: 'Duchateau Henri Family',
          about: 'Les descendants de Henri Duchateau et les proches',
          shareUrl: 'https://tresordefamille.org/?famille=CB5ACD2D3EF689A8FBEC4D06C576371834689673',
        },
      ]}
    />
  </SessionContext.Provider>
)

export const UneFamilleCréée = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [
        {
          familyId: 'a' as FamilyId,
          familyName: 'Espace personnel',
          about: '',
        },
        {
          familyId: familyId,
          familyName: 'Ma famille',
          about: 'Voila une description de ma famille, avec quelques longs passages.',
        },
      ],
      userName: 'John Doe Adear',
      profilePic:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
      isAdmin: false,
      arePhotosEnabled: true,
      areThreadsEnabled: true,
      areVideosEnabled: false,
      arePersonsEnabled: true,
      isSharingEnabled: true,
      isFamilyPageEnabled: true,
      personId: makePersonId(),
    }}>
    <SharePage
      userFamilies={[
        {
          familyId: makeFamilyId(),
          name: 'Duchateau Henri Family',
          about: 'Les descendants de Henri Duchateau et les proches',
          shareUrl: 'https://tresordefamille.org/?famille=CB5ACD2D3EF689A8FBEC4D06C576371834689673',
        },
      ]}
    />
  </SessionContext.Provider>
)

const henriFamilyId = makeFamilyId()
export const PlusieursFamilleExistantes = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [
        {
          familyId: henriFamilyId,
          familyName: 'Duchateau Henri Family',
          about: 'Les descendants de Henri Duchateau',
        },
        {
          familyId: makeFamilyId(),
          familyName: 'Duchateau Louis Family',
          about: 'Les descendants de Louis Duchateau',
        },
      ],
      userName: 'John Doe Adear',
      profilePic:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
      isAdmin: false,
      arePhotosEnabled: true,
      areThreadsEnabled: true,
      areVideosEnabled: false,
      arePersonsEnabled: true,
      isSharingEnabled: true,
      isFamilyPageEnabled: true,
      personId: makePersonId(),
    }}>
    <SharePage
      userFamilies={[
        {
          familyId: makeFamilyId(),
          name: 'Duchateau Henri Family',
          about: 'Les descendants de Henri Duchateau et les proches',
          shareUrl: 'https://tresordefamille.org/?famille=CB5ACD2D3EF689A8FBEC4D06C576371834689673',
        },
        {
          familyId: makeFamilyId(),
          name: 'Duchateau Louis Family',
          about: 'Les descendants de Louis Duchateau et leurss proches',
          shareUrl: 'https://tresordefamille.org/?famille=CB5ACD2D3EF689A8FBEC4D06C576371834689673',
        },
      ]}
    />
  </SessionContext.Provider>
)
