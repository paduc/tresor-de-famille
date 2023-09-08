import { SearchIndex } from 'algoliasearch'
import * as React from 'react'
import { getUuid } from '../../libs/getUuid'
import { SessionContext } from '../_components'
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
      userName: 'John Doe Adear',
      profilePic:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
      isAdmin: false,
      arePhotosEnabled: true,
      areThreadsEnabled: true,
      areVideosEnabled: false,
      arePersonsEnabled: true,
    }}>
    <HomePage isOnboarding={false} />
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
        personId: getUuid(),
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
      personId: getUuid(),
      'upload-profile-picture': 'photo-uploaded',
      photoId: getUuid(),
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
      personId: getUuid(),
      'upload-profile-picture': 'photo-uploaded',
      photoId: getUuid(),
      photoUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      faces: [{ faceId: getUuid() }],
    }}
  />
)

export const PhotoUploadedMultipleFaces = () => (
  <HomePage
    isOnboarding
    steps={{
      'get-user-name': 'done',
      name: 'John Doe',
      personId: getUuid(),
      'upload-profile-picture': 'photo-uploaded',
      photoId: getUuid(),
      photoUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      faces: [{ faceId: getUuid() }, { faceId: getUuid() }, { faceId: getUuid() }],
    }}
  />
)
