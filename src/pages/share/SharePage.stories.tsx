import * as React from 'react'
import { SessionContext } from '../_components/SessionContext.js'
import { SharePage } from './SharePage.js'
import { makePersonId } from '../../libs/makePersonId.js'
import { makeFamilyId } from '../../libs/makeFamilyId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { SearchIndex } from 'algoliasearch'
import { makeAppUserId } from '../../libs/makeUserId.js'
import { PersonSearchContext } from '../_components/usePersonSearch.js'
import { FamilyShareCode } from '../../domain/FamilyShareCode.js'
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
  },
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
          isUserSpace: true,
          shareUrl: '' as FamilyShareCode,
          color: '',
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
          familyId: 'a' as FamilyId,
          familyName: 'Espace personnel',
          about: '',
          isUserSpace: true,
          shareUrl: '' as FamilyShareCode,
          color: '',
        },
        {
          familyId,
          familyName: 'Ma famille avec un nom trop trop trop trop long',
          about: '',
          isUserSpace: true,
          shareUrl: '' as FamilyShareCode,
          color: '',
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
          isUserSpace: false,
          shareUrl: 'https://tresordefamille.org/?famille=CB5ACD2D3EF689A8FBEC4D06C576371834689673' as FamilyShareCode,
          users: [
            {
              userId: makeAppUserId(),
              name: 'Pierre-Antoine',
              partialEmail: 'pie***ine@tre***lle.org',
            },
            {
              userId: makeAppUserId(),
              name: 'Pierre-Antoine',
              partialEmail: 'pie***ine@tre***lle.org',
            },
            {
              userId: makeAppUserId(),
              name: 'Pierre-Antoine',
              partialEmail: 'pie***ine@tre***lle.org',
            },
          ],
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
          isUserSpace: true,
          shareUrl: '' as FamilyShareCode,
          color: '',
        },
        {
          familyId: familyId,
          familyName: 'Ma famille',
          about: 'Voila une description de ma famille, avec quelques longs passages.',
          isUserSpace: false,
          shareUrl: '' as FamilyShareCode,
          color: '',
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
          isUserSpace: false,
          shareUrl: 'https://tresordefamille.org/?famille=CB5ACD2D3EF689A8FBEC4D06C576371834689673' as FamilyShareCode,
          users: [],
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
          isUserSpace: false,
          shareUrl: '' as FamilyShareCode,
          color: '',
        },
        {
          familyId: makeFamilyId(),
          familyName: 'Duchateau Louis Family',
          about: 'Les descendants de Louis Duchateau',
          isUserSpace: false,
          shareUrl: '' as FamilyShareCode,
          color: '',
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
          isUserSpace: false,
          shareUrl: 'https://tresordefamille.org/?famille=CB5ACD2D3EF689A8FBEC4D06C576371834689673' as FamilyShareCode,
          users: [
            {
              userId: makeAppUserId(),
              name: 'Pierre-Antoine',
              partialEmail: 'pie***ine@tre***lle.org',
            },
            {
              userId: makeAppUserId(),
              name: 'Pierre-Antoine',
              partialEmail: 'pie***ine@tre***lle.org',
            },
            {
              userId: makeAppUserId(),
              name: 'Pierre-Antoine',
              partialEmail: 'pie***ine@tre***lle.org',
            },
          ],
        },
        {
          familyId: makeFamilyId(),
          name: 'Duchateau Louis Family',
          about: 'Les descendants de Louis Duchateau et leurss proches',
          isUserSpace: false,
          shareUrl: 'https://tresordefamille.org/?famille=CB5ACD2D3EF689A8FBEC4D06C576371834689673' as FamilyShareCode,
          users: [],
        },
      ]}
    />
  </SessionContext.Provider>
)
