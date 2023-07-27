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
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => {
      return (
        <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
          <PersonSearchContext.Provider value={{ search: fakePersonSearch } as unknown as SearchIndex}>
            <div className='text-red-600 text-xl bg-red-200 p-6'>DEPRECATED</div>
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
        stage: 'awaiting-name',
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
        name: 'Pierre-Antoine',
        personId: getUuid(),
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

        name: 'Pierre-Antoine',
        personId: getUuid(),
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

        name: 'Pierre-Antoine',
        personId: getUuid(),
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

        name: 'Pierre-Antoine',
        personId: getUuid(),
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

        name: 'Pierre-Antoine',
        personId: getUuid(),
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

        name: 'Pierre-Antoine',
        personId: getUuid(),
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

        name: 'Pierre-Antoine',
        personId: getUuid(),
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

        name: 'Pierre-Antoine',
        personId: getUuid(),
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
        name: 'Pierre-Antoine',
        personId: getUuid(),
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
              // {
              //   faceId: getUuid(),
              //   stage: 'done',
              //   messages: [],
              //   result: {
              //     personId: getUuid(),
              //     name: 'John Doe',
              //   },
              // },
              // { faceId: getUuid(), stage: 'awaiting-name' },
              { faceId: getUuid(), stage: 'awaiting-relationship', name: 'John Doe', personId: getUuid() },
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

        name: 'Pierre-Antoine',
        personId: getUuid(),
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
                personId: getUuid(),
                name: 'John Doe',
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
                personId: getUuid(),
                name: 'John Doe',
              },
              { faceId: getUuid(), stage: 'awaiting-name' },
            ],
          },
        ],
      },
    ]}
  />
)
export const Step3AwaitingRelationship = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'done',

        name: 'Pierre-Antoine',
        personId: getUuid(),
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
                stage: 'awaiting-relationship',
                personId: getUuid(),
                name: 'John Doe',
              },
              { faceId: getUuid(), stage: 'done', name: 'fart', personId: getUuid() },
              { faceId: getUuid(), stage: 'awaiting-name' },
            ],
          },
        ],
      },
    ]}
  />
)
export const Step3RelationshipInProgress = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'done',

        name: 'Pierre-Antoine',
        personId: getUuid(),
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
                stage: 'awaiting-relationship-confirmation',
                messages: [
                  {
                    role: 'user',
                    content: 'mon frère',
                  },
                  {
                    role: 'assistant',
                    content: null,
                    function_call: {
                      name: 'save_relationship',
                      arguments: '{  "relationship": "brother" }',
                    },
                  },
                ],
                personId: getUuid(),
                name: 'John Doe',
                userAnswer: 'mon frère',
                relationship: {
                  relationship: 'coworker',
                  precision: 'chez Foncia',
                },
              },
              { faceId: getUuid(), stage: 'done', name: 'fart', personId: getUuid() },
              { faceId: getUuid(), stage: 'awaiting-name' },
            ],
          },
        ],
      },
    ]}
  />
)

export const Step3Done = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'done',

        name: 'Pierre-Antoine',
        personId: getUuid(),
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
                personId: getUuid(),
                name: 'John Doe',
                relationship: {
                  relationship: 'coworker',
                  precision: 'chez Foncia',
                },
              },
            ],
          },
        ],
      },
    ]}
  />
)

export const Step4Done = () => (
  <BienvenuePage
    userId={getUuid()}
    steps={[
      {
        goal: 'get-user-name',
        stage: 'done',

        name: 'Pierre-Antoine',
        personId: getUuid(),
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
                personId: getUuid(),
                name: 'John Doe',
                relationship: {
                  relationship: 'coworker',
                  precision: 'chez Foncia',
                },
              },
            ],
          },
        ],
      },
      {
        goal: 'create-first-thread',
        stage: 'done',
        message: `Je me souviens parfaitement ne jamais avoir fait de sport. Je n'étais pas sportif, je n'avais qu'une passion pour la lecture. Et jouer au ballon prisonnier la tête plongée dans un roman, ce n'est pas possible. C'est comme ça que j'ai cassé mes premières lunettes.`,
        threadId: getUuid(),
      },
    ]}
  />
)
