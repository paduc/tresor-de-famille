import * as React from 'react'

import { OnboardingHomePage } from './OnboardingHomePage'
import { SearchIndex } from 'algoliasearch'
import { getUuid } from '../../../libs/getUuid'
import { SessionContext } from '../../_components'
import { PersonSearchContext } from '../../_components/usePersonSearch'

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
  title: 'DEPRECATED Onboarding v2',
  component: OnboardingHomePage,
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
            <div className='text-red-600 text-xl bg-red-200 p-6'>DEPRECATED</div>
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
    <OnboardingHomePage isOnboarding={false} displayFinisherCongratulations={true} />
  </SessionContext.Provider>
)

export const WaitingForName = () => (
  <OnboardingHomePage
    isOnboarding
    steps={{
      'get-user-name': 'pending',
      'upload-first-photo': 'pending',
      'upload-family-photo': 'awaiting-upload',
      'create-first-thread': 'awaiting-input',
      'chose-beneficiaries': 'awaiting-input',
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
    }}>
    <OnboardingHomePage
      isOnboarding
      steps={{
        'get-user-name': 'done',
        name: 'John Doe',
        personId: getUuid(),
        'upload-first-photo': 'pending',
        'upload-family-photo': 'awaiting-upload',
        'create-first-thread': 'awaiting-input',
        'chose-beneficiaries': 'awaiting-input',
      }}
    />
  </SessionContext.Provider>
)
export const PhotoUploadedNoFaces = () => (
  <OnboardingHomePage
    isOnboarding
    steps={{
      'get-user-name': 'done',
      name: 'John Doe',
      personId: getUuid(),
      'upload-first-photo': 'photo-uploaded',
      photoId: getUuid(),
      photoUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      faces: [],
      'upload-family-photo': 'awaiting-upload',
      'create-first-thread': 'awaiting-input',
      'chose-beneficiaries': 'awaiting-input',
    }}
  />
)

export const PhotoUploadedSingleFace = () => (
  <OnboardingHomePage
    isOnboarding
    steps={{
      'get-user-name': 'done',
      name: 'John Doe',
      personId: getUuid(),
      'upload-first-photo': 'photo-uploaded',
      photoId: getUuid(),
      photoUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      faces: [{ faceId: getUuid() }],
      'upload-family-photo': 'awaiting-upload',
      'create-first-thread': 'awaiting-input',
      'chose-beneficiaries': 'awaiting-input',
    }}
  />
)

export const PhotoUploadedMultipleFaces = () => (
  <OnboardingHomePage
    isOnboarding
    steps={{
      'get-user-name': 'done',
      name: 'John Doe',
      personId: getUuid(),
      'upload-first-photo': 'photo-uploaded',
      photoId: getUuid(),
      photoUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      faces: [{ faceId: getUuid() }, { faceId: getUuid() }, { faceId: getUuid() }],
      'upload-family-photo': 'awaiting-upload',
      'create-first-thread': 'awaiting-input',
      'chose-beneficiaries': 'awaiting-input',
    }}
  />
)

export const WaitingForFamilyPhoto = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userName: 'John Doe',
      profilePic:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      isAdmin: false,
      arePhotosEnabled: false,
      areThreadsEnabled: false,
      areVideosEnabled: false,
    }}>
    <OnboardingHomePage
      isOnboarding
      steps={{
        'get-user-name': 'done',
        name: 'John Doe',
        personId: getUuid(),
        'upload-first-photo': 'user-face-confirmed',
        photoId: getUuid(),
        photoUrl:
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
        faceId: getUuid(),
        'upload-family-photo': 'awaiting-upload',
        'create-first-thread': 'awaiting-input',
        'chose-beneficiaries': 'awaiting-input',
      }}
    />
  </SessionContext.Provider>
)

export const AnnotatingFamilyPhotoNoFaces = () => (
  <OnboardingHomePage
    isOnboarding
    steps={{
      'get-user-name': 'done',
      name: 'John Doe',
      personId: getUuid(),
      'upload-first-photo': 'user-face-confirmed',
      photoId: getUuid(),
      photoUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      faceId: getUuid(),
      'upload-family-photo': 'annotating-photo',
      photos: [
        {
          photoId: getUuid(),
          photoUrl:
            'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
          faces: [],
        },
      ],
      'create-first-thread': 'awaiting-input',
      'chose-beneficiaries': 'awaiting-input',
    }}
  />
)

export const AnnotatingFamilyFaceWithName = () => (
  <OnboardingHomePage
    isOnboarding
    steps={{
      'get-user-name': 'done',
      name: 'John Doe',
      personId: getUuid(),
      'upload-first-photo': 'user-face-confirmed',
      photoId: getUuid(),
      photoUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      faceId: getUuid(),
      'upload-family-photo': 'annotating-photo',
      photos: [
        {
          photoId: getUuid(),
          photoUrl:
            'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
          faces: [
            { faceId: getUuid(), stage: 'done', name: 'Pouet', personId: getUuid() },
            { faceId: getUuid(), stage: 'ignored' },
            { faceId: getUuid(), stage: 'awaiting-name' },
            // { faceId: getUuid(), stage: 'awaiting-name' },
            // { faceId: getUuid(), stage: 'done', name: 'Ping', personId: getUuid() },
            // { faceId: getUuid(), stage: 'ignored' },
            // { faceId: getUuid(), stage: 'ignored' },
          ],
        },
      ],
      'create-first-thread': 'awaiting-input',
      'chose-beneficiaries': 'awaiting-input',
    }}
  />
)

export const AnnotatingFamilyFaceWithRelation = () => (
  <OnboardingHomePage
    isOnboarding
    steps={{
      'get-user-name': 'done',
      name: 'John Doe',
      personId: getUuid(),
      'upload-first-photo': 'user-face-confirmed',
      photoId: getUuid(),
      photoUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      faceId: getUuid(),
      'upload-family-photo': 'annotating-photo',
      photos: [
        {
          photoId: getUuid(),
          photoUrl:
            'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
          faces: [{ faceId: getUuid(), stage: 'awaiting-relationship', name: 'Johnny', personId: getUuid() }],
        },
      ],
      'create-first-thread': 'awaiting-input',
      'chose-beneficiaries': 'awaiting-input',
    }}
  />
)
export const ConfirmingFamilyRelation = () => (
  <OnboardingHomePage
    isOnboarding
    steps={{
      'get-user-name': 'done',
      name: 'John Doe',
      personId: getUuid(),
      'upload-first-photo': 'user-face-confirmed',
      photoId: getUuid(),
      photoUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      faceId: getUuid(),
      'upload-family-photo': 'annotating-photo',
      photos: [
        {
          photoId: getUuid(),
          photoUrl:
            'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
          faces: [
            {
              faceId: getUuid(),
              stage: 'awaiting-relationship-confirmation',
              name: 'Johnny',
              personId: getUuid(),
              relationship: { relationship: 'mother' },
              messages: [],
              userAnswer: 'Ma mère',
            },
          ],
        },
      ],
      'create-first-thread': 'awaiting-input',
      'chose-beneficiaries': 'awaiting-input',
    }}
  />
)

const johnnyFaceId = getUuid()

export const AnnotatingMultipleFamilyPhotos = () => (
  <OnboardingHomePage
    isOnboarding
    steps={{
      'get-user-name': 'done',
      name: 'John Doe',
      personId: getUuid(),
      'upload-first-photo': 'user-face-confirmed',
      photoId: getUuid(),
      photoUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      faceId: getUuid(),
      'upload-family-photo': 'annotating-photo',
      photos: [
        {
          photoId: getUuid(),
          photoUrl:
            'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
          faces: [
            {
              faceId: getUuid(),
              stage: 'done',
              name: 'Mary',
              personId: getUuid(),
              relationship: { relationship: 'mother' },
            },
            {
              faceId: johnnyFaceId,
              stage: 'done',
              name: 'Johnny',
              personId: getUuid(),
              relationship: { relationship: 'father' },
            },
            {
              faceId: getUuid(),
              stage: 'done',
              name: "Richard Lion's heart",
              personId: getUuid(),
              relationship: { relationship: 'uncle', side: 'maternal' },
            },
          ],
        },
        {
          photoId: getUuid(),
          photoUrl:
            'https://images.unsplash.com/photo-1664575599618-8f6bd76fc670?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
          faces: [
            {
              faceId: getUuid(),
              stage: 'awaiting-name',
            },

            {
              faceId: getUuid(),
              stage: 'ignored',
            },
            {
              faceId: johnnyFaceId,
              stage: 'done',
              name: 'Johnny',
              personId: getUuid(),
              relationship: { relationship: 'mother' },
            },
            {
              faceId: getUuid(),
              stage: 'awaiting-relationship-confirmation',
              name: 'Johnny',
              personId: getUuid(),
              relationship: { relationship: 'mother' },
              messages: [],
              userAnswer: 'Ma mère',
            },
          ],
        },
        {
          photoId: getUuid(),
          photoUrl:
            'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
          faces: [
            {
              faceId: getUuid(),
              stage: 'awaiting-name',
            },
          ],
        },
      ],
      'create-first-thread': 'awaiting-input',
      'chose-beneficiaries': 'awaiting-input',
    }}
  />
)

export const MultipleFamilyPhotosAllDone = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userName: 'John Doe',
      profilePic:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      isAdmin: false,
      arePhotosEnabled: true,
      areThreadsEnabled: false,
      areVideosEnabled: false,
    }}>
    <OnboardingHomePage
      isOnboarding
      steps={{
        'get-user-name': 'done',
        name: 'John Doe',
        personId: getUuid(),
        'upload-first-photo': 'user-face-confirmed',
        photoId: getUuid(),
        photoUrl:
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
        faceId: getUuid(),
        'upload-family-photo': 'annotating-photo',
        photos: [
          {
            photoId: getUuid(),
            photoUrl:
              'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
            faces: [
              {
                faceId: getUuid(),
                stage: 'done',
                name: 'Johnny',
                personId: getUuid(),
                relationship: { relationship: 'mother' },
              },
            ],
          },

          {
            photoId: getUuid(),
            photoUrl:
              'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
            faces: [
              {
                faceId: getUuid(),
                stage: 'ignored',
              },
            ],
          },
        ],
        'create-first-thread': 'awaiting-input',
        'chose-beneficiaries': 'awaiting-input',
      }}
    />
  </SessionContext.Provider>
)

export const WaitingForFirstThread = () => (
  <OnboardingHomePage
    isOnboarding
    steps={{
      'get-user-name': 'done',
      name: 'John Doe',
      personId: getUuid(),
      'upload-first-photo': 'user-face-confirmed',
      photoId: getUuid(),
      photoUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      faceId: getUuid(),
      'upload-family-photo': 'done',

      'create-first-thread': 'awaiting-input',
      'chose-beneficiaries': 'awaiting-input',
    }}
  />
)

export const FirstThreadWritten = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userName: 'John Doe',
      profilePic:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      isAdmin: false,
      arePhotosEnabled: true,
      areThreadsEnabled: true,
      areVideosEnabled: false,
    }}>
    <OnboardingHomePage
      isOnboarding
      steps={{
        'get-user-name': 'done',
        name: 'John Doe',
        personId: getUuid(),
        'upload-first-photo': 'user-face-confirmed',
        photoId: getUuid(),
        photoUrl:
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
        faceId: getUuid(),
        'upload-family-photo': 'done',
        'create-first-thread': 'thread-written',
        threadId: getUuid(),
        message: `Je me souviens parfaitement ne jamais avoir fait de sport. Je n'étais pas sportif, je n'avais qu'une passion pour la lecture. Et jouer au ballon prisonnier la tête plongée dans un roman, ce n'est pas possible. C'est comme ça que j'ai cassé mes premières lunettes.`,
        'chose-beneficiaries': 'awaiting-input',
      }}
    />
  </SessionContext.Provider>
)

export const ChosingBeneficiaries = () => (
  <OnboardingHomePage
    isOnboarding
    steps={{
      'get-user-name': 'done',
      name: 'John Doe',
      personId: getUuid(),
      'upload-first-photo': 'user-face-confirmed',
      photoId: getUuid(),
      photoUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=3000&h=2000&q=80',
      faceId: getUuid(),
      'upload-family-photo': 'done',
      'create-first-thread': 'done',
      threadId: getUuid(),
      message: `Je me souviens parfaitement ne jamais avoir fait de sport. Je n'étais pas sportif, je n'avais qu'une passion pour la lecture. Et jouer au ballon prisonnier la tête plongée dans un roman, ce n'est pas possible. C'est comme ça que j'ai cassé mes premières lunettes.`,
      'chose-beneficiaries': 'awaiting-input',
    }}
  />
)
