import { SearchIndex } from 'algoliasearch'
import * as React from 'react'
import { AppUserId } from '../../domain/AppUserId'
import { getUuid } from '../../libs/getUuid'
import { makeThreadId } from '../../libs/makeThreadId'
import { SessionContext } from '../_components/SessionContext'
import { PersonSearchContext } from '../_components/usePersonSearch'
import { HomePage } from './HomePage'

const fakePersonSearch = async (query: string) => {
  return {
    hits: [
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
    ],
  }
}

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
            userFamilies: [],

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
      userFamilies: [],

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
      userFamilies: [],

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
        },
        {
          threadId: makeThreadId(),
          title:
            'Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
          lastUpdatedOn: Date.now(),
        },
      ]}
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
