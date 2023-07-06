import * as React from 'react'
import { SessionContext } from '../_components'
import { BienvenuePage } from './BienvenuePage'
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

export default {
  title: 'Onboarding',
  component: BienvenuePage,
  decorators: [
    (Story) => {
      return (
        <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
          <PersonSearchContext.Provider value={{ search: fakePersonSearch } as unknown as SearchIndex}>
            <Story />
          </PersonSearchContext.Provider>
        </SessionContext.Provider>
      )
    },
  ],
}

export const Step1Start = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'in-progress',
        messages: [
          {
            role: 'assistant',
            content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
          },
        ],
      },
    ]}
  />
)
export const Step1InProgress = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'in-progress',
        messages: [
          {
            role: 'assistant',
            content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
          },
          {
            role: 'user',
            content: 'Bonjour, je suis un homme de 37ans.',
          },
          {
            role: 'assistant',
            content: "Bonjour ! Je suis ravi de te rencontrer. Pourriez-vous me dire votre prénom s'il vous plaît ?",
          },
        ],
      },
    ]}
  />
)

export const Step1Done = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'done',
        result: {
          name: 'Pierre-Antoine',
          personId: getUuid(),
        },
        messages: [
          {
            role: 'assistant',
            content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
          },
          {
            role: 'user',
            content: 'Bonjour, je suis un homme de 37ans.',
          },
          {
            role: 'assistant',
            content: "Bonjour ! Je suis ravi de te rencontrer. Pourriez-vous me dire votre prénom s'il vous plaît ?",
          },
          {
            role: 'user',
            content: 'Pierre-Antoine.',
          },
        ],
      },
    ]}
  />
)

export const Step2Start = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'done',
        result: {
          name: 'Pierre-Antoine',
          personId: getUuid(),
        },
        messages: [
          {
            role: 'assistant',
            content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
          },
          {
            role: 'user',
            content: 'Pierre-Antoine.',
          },
        ],
      },
      {
        goal: 'upload-first-photo',
        stage: 'waiting-upload',
      },
    ]}
  />
)

export const Step2PhotoWithNoFaces = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'done',
        result: {
          name: 'Pierre-Antoine',
          personId: getUuid(),
        },
        messages: [
          {
            role: 'assistant',
            content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
          },
          {
            role: 'user',
            content: 'Pierre-Antoine.',
          },
        ],
      },
      {
        goal: 'upload-first-photo',
        stage: 'photo-uploaded',
        photoId: getUuid(),
        photoUrl:
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=2560&h=2560&q=80',
        faces: [],
      },
    ]}
  />
)

export const Step2PhotoWith1Face = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'done',
        result: {
          name: 'Pierre-Antoine',
          personId: getUuid(),
        },
        messages: [
          {
            role: 'assistant',
            content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
          },
          {
            role: 'user',
            content: 'Pierre-Antoine.',
          },
        ],
      },
      {
        goal: 'upload-first-photo',
        stage: 'photo-uploaded',
        photoId: getUuid(),
        photoUrl:
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=2560&h=2560&q=80',
        faces: [{ faceId: getUuid() }],
      },
    ]}
  />
)

export const Step2PhotoWith1FaceConfirmed = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'done',
        result: {
          name: 'Pierre-Antoine',
          personId: getUuid(),
        },
        messages: [
          {
            role: 'assistant',
            content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
          },
          {
            role: 'user',
            content: 'Pierre-Antoine.',
          },
        ],
      },
      {
        goal: 'upload-first-photo',
        stage: 'face-confirmed',
        confirmedFaceId: getUuid(),
        photoId: getUuid(),
        photoUrl:
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=2560&h=2560&q=80',
        faces: [{ faceId: getUuid() }],
      },
    ]}
  />
)

export const Step2PhotoWithMultipleFaces = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'done',
        result: {
          name: 'Pierre-Antoine',
          personId: getUuid(),
        },
        messages: [
          {
            role: 'assistant',
            content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
          },
          {
            role: 'user',
            content: 'Pierre-Antoine.',
          },
        ],
      },
      {
        goal: 'upload-first-photo',
        stage: 'photo-uploaded',
        photoId: getUuid(),
        photoUrl:
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=2560&h=2560&q=80',
        faces: [{ faceId: getUuid() }, { faceId: getUuid() }, { faceId: getUuid() }],
      },
    ]}
  />
)

const confirmedFaceId = getUuid()
export const Step2PhotoWithMultipleFacesConfirmed = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'done',
        result: {
          name: 'Pierre-Antoine',
          personId: getUuid(),
        },
        messages: [
          {
            role: 'assistant',
            content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
          },
          {
            role: 'user',
            content: 'Pierre-Antoine.',
          },
        ],
      },
      {
        goal: 'upload-first-photo',
        stage: 'face-confirmed',
        confirmedFaceId,
        photoId: getUuid(),
        photoUrl:
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=2560&h=2560&q=80',
        faces: [{ faceId: getUuid() }, { faceId: confirmedFaceId }, { faceId: getUuid() }],
      },
    ]}
  />
)

export const Step3Start = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'done',
        result: {
          name: 'Pierre-Antoine',
          personId: getUuid(),
        },
        messages: [
          {
            role: 'assistant',
            content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
          },
          {
            role: 'user',
            content: 'Pierre-Antoine.',
          },
        ],
      },
      {
        goal: 'upload-first-photo',
        stage: 'face-confirmed',
        confirmedFaceId: getUuid(),
        photoId: getUuid(),
        photoUrl:
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=2560&h=2560&q=80',
        faces: [{ faceId: getUuid() }],
      },
      {
        goal: 'upload-family-photo',
        stage: 'awaiting-upload',
      },
    ]}
  />
)
export const Step3AnnotatingPhotoFirstPhoto = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'done',
        result: {
          name: 'Pierre-Antoine',
          personId: getUuid(),
        },
        messages: [
          {
            role: 'assistant',
            content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
          },
          {
            role: 'user',
            content: 'Pierre-Antoine.',
          },
        ],
      },
      {
        goal: 'upload-first-photo',
        stage: 'face-confirmed',
        confirmedFaceId: getUuid(),
        photoId: getUuid(),
        photoUrl:
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=2560&h=2560&q=80',
        faces: [{ faceId: getUuid() }],
      },
      {
        goal: 'upload-family-photo',
        stage: 'annotating-photo',
        photos: [
          {
            photoId: getUuid(),
            photoUrl:
              'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=2560&h=2560&q=80',
            faces: [
              { faceId: getUuid(), stage: 'ignored' },
              {
                faceId: getUuid(),
                stage: 'done',
                messages: [],
                result: {
                  personId: getUuid(),
                  name: 'John Doe',
                },
              },
              // { faceId: getUuid(), stage: 'awaiting-name' },
            ],
          },
        ],
      },
    ]}
  />
)
export const Step3AnnotatingPhotoSecondPhoto = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'done',
        result: {
          name: 'Pierre-Antoine',
          personId: getUuid(),
        },
        messages: [
          {
            role: 'assistant',
            content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
          },
          {
            role: 'user',
            content: 'Pierre-Antoine.',
          },
        ],
      },
      {
        goal: 'upload-first-photo',
        stage: 'face-confirmed',
        confirmedFaceId: getUuid(),
        photoId: getUuid(),
        photoUrl:
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=2560&h=2560&q=80',
        faces: [{ faceId: getUuid() }],
      },
      {
        goal: 'upload-family-photo',
        stage: 'annotating-photo',
        photos: [
          {
            photoId: getUuid(),
            photoUrl:
              'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=2560&h=2560&q=80',
            faces: [
              { faceId: getUuid(), stage: 'ignored' },
              {
                faceId: getUuid(),
                stage: 'done',
                messages: [],
                result: {
                  personId: getUuid(),
                  name: 'John Doe',
                },
              },
            ],
          },
          {
            photoId: getUuid(),
            photoUrl:
              'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=2560&h=2560&q=80',
            faces: [
              { faceId: getUuid(), stage: 'ignored' },
              {
                faceId: getUuid(),
                stage: 'done',
                messages: [],
                result: {
                  personId: getUuid(),
                  name: 'John Doe',
                },
              },
              { faceId: getUuid(), stage: 'awaiting-name' },
            ],
          },
        ],
      },
    ]}
  />
)
export const Step3AnnotatingWithIgnoredPhoto = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'done',
        result: {
          name: 'Pierre-Antoine',
          personId: getUuid(),
        },
        messages: [
          {
            role: 'assistant',
            content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
          },
          {
            role: 'user',
            content: 'Pierre-Antoine.',
          },
        ],
      },
      {
        goal: 'upload-first-photo',
        stage: 'face-confirmed',
        confirmedFaceId: getUuid(),
        photoId: getUuid(),
        photoUrl:
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=2560&h=2560&q=80',
        faces: [{ faceId: getUuid() }],
      },
      {
        goal: 'upload-family-photo',
        stage: 'annotating-photo',
        photos: [
          {
            photoId: getUuid(),
            photoUrl:
              'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=2560&h=2560&q=80',
            faces: [],
          },
          {
            photoId: getUuid(),
            photoUrl:
              'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=2560&h=2560&q=80',
            faces: [
              { faceId: getUuid(), stage: 'ignored' },
              {
                faceId: getUuid(),
                stage: 'done',
                messages: [],
                result: {
                  personId: getUuid(),
                  name: 'John Doe',
                },
              },
              { faceId: getUuid(), stage: 'awaiting-name' },
            ],
          },
        ],
      },
    ]}
  />
)
