import { SearchIndex } from 'algoliasearch'
import * as React from 'react'
import { getUuid } from '../../libs/getUuid'
import { PersonSearchContext } from '../_components/usePersonSearch'
import { HomePage } from './HomePage'
import { makePhotoId } from '../../libs/makePhotoId'
import { makePersonId } from '../../libs/makePersonId'
import { makeFaceId } from '../../libs/makeFaceId'
import { SessionContext } from '../_components/SessionContext'
import { makeThreadId } from '../../libs/makeThreadId'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'

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
      'upload-profile-picture': 'pending',
    }}
  />
)

export const WaitingForPhoto = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [],

      userName: 'John Doe',
      profilePic: null,
      isAdmin: false,
      arePhotosEnabled: false,
      areThreadsEnabled: false,
      areVideosEnabled: false,
      arePersonsEnabled: false,
    }}>
    <HomePage
      isOnboarding
      steps={{
        'get-user-name': 'done',
        name: 'John Doe',
        personId: makePersonId(),
        'upload-profile-picture': 'pending',
      }}
    />
  </SessionContext.Provider>
)
export const PhotoUploadedNoFaces = () => (
  <HomePage
    isOnboarding
    steps={{
      'get-user-name': 'done',
      name: 'John Doe',
      personId: makePersonId(),
      'upload-profile-picture': 'photo-uploaded',
      photoId: makePhotoId(),
      photoUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      faces: [],
    }}
  />
)

export const PhotoUploadedSingleFace = () => (
  <HomePage
    isOnboarding
    steps={{
      'get-user-name': 'done',
      name: 'John Doe',
      personId: makePersonId(),
      'upload-profile-picture': 'photo-uploaded',
      photoId: makePhotoId(),
      photoUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      faces: [{ faceId: makeFaceId() }],
    }}
  />
)

export const PhotoUploadedMultipleFaces = () => (
  <HomePage
    isOnboarding
    steps={{
      'get-user-name': 'done',
      name: 'John Doe',
      personId: makePersonId(),
      'upload-profile-picture': 'photo-uploaded',
      photoId: makePhotoId(),
      photoUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      faces: [{ faceId: makeFaceId() }, { faceId: makeFaceId() }, { faceId: makeFaceId() }],
    }}
  />
)
