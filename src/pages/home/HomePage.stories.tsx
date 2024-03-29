import { SearchIndex } from 'algoliasearch'
import * as React from 'react'
import { AppUserId } from '../../domain/AppUserId.js'
import { getUuid } from '../../libs/getUuid.js'
import { makeThreadId } from '../../libs/makeThreadId.js'
import { SessionContext } from '../_components/SessionContext.js'
import { PersonSearchContext } from '../_components/usePersonSearch.js'
import { HomePage } from './HomePage.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { makeFamilyId } from '../../libs/makeFamilyId.js'
import { asFamilyId } from '../../libs/typeguards.js'

const fakePersonSearch = async (query: string) => {
  return {
    hits: [
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
    ],
  }
}

const familyABCId = makeFamilyId()
export default {
  title: "Page d'accueil",
  component: HomePage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story: any) => {
      return (
        <SessionContext.Provider
          value={{
            isLoggedIn: true,
            userId: 'a' as AppUserId,
            userFamilies: [
              {
                familyId: 'a' as FamilyId,
                familyName: 'Espace personnel',
                about: '',
                color: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10',
                isUserSpace: true,
                shareUrl: '',
              },
              {
                familyId: familyABCId,
                familyName: 'Famille ABC',
                about: 'La famille qui connait le début de son alphabet',
                color: 'bg-red-50 text-red-700 ring-red-600/10',
                isUserSpace: true,
                shareUrl: '',
              },
            ],

            userName: '',
            profilePic: null,
            isAdmin: false,
            arePhotosEnabled: false,
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

export const AfterOnboarding = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [
        {
          familyId: 'a' as FamilyId,
          familyName: 'Espace personnel',
          about: '',
          color: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10',
          isUserSpace: true,
          shareUrl: '',
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
    <HomePage isOnboarding={false} latestThreads={[]} />
  </SessionContext.Provider>
)

export const AfterOnboardingAvecSouvenirs = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [
        {
          familyId: 'a' as FamilyId,
          familyName: 'Espace personnel',
          about: '',
          color: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10',
          isUserSpace: true,
          shareUrl: '',
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
    }}>
    <HomePage
      isOnboarding={false}
      latestThreads={[
        {
          threadId: makeThreadId(),
          title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          lastUpdatedOn: Date.now(),
          authors: [{ name: 'John Doe' }],
          contents: 'Ceci est le reste du contenu',
          thumbnails: [],
          familyIds: [asFamilyId('a' as AppUserId)],
        },
        {
          threadId: makeThreadId(),
          title:
            'Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
          lastUpdatedOn: Date.now(),
          authors: [{ name: 'John Doe' }],
          contents: 'Ceci est le reste du contenu',
          thumbnails: [],
          familyIds: [asFamilyId('a' as AppUserId)],
        },
        {
          threadId: makeThreadId(),
          title:
            'Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
          lastUpdatedOn: Date.now(),
          authors: [{ name: 'John Doe' }],
          contents: 'Ceci est le reste du contenu',
          thumbnails: [],
          familyIds: [asFamilyId('a' as AppUserId)],
        },
      ]}
      hasMoreThreads={true}
    />
  </SessionContext.Provider>
)

export const WaitingForName = () => (
  <HomePage
    isOnboarding
    steps={{
      'get-user-name': 'pending',
    }}
  />
)
