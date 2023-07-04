import * as React from 'react'
import { SessionContext } from '../_components'
import { BienvenuePage } from './BienvenuePage'
import { getUuid } from '../../libs/getUuid'

export default { title: 'Onboarding', component: BienvenuePage }

export const Step1Start = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
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
  </SessionContext.Provider>
)
export const Step1InProgress = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
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
  </SessionContext.Provider>
)

export const Step1Done = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
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
  </SessionContext.Provider>
)

export const Step2Start = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
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
  </SessionContext.Provider>
)

export const Step2PhotoWithNoFaces = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
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
  </SessionContext.Provider>
)

export const Step2PhotoWith1Face = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
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
  </SessionContext.Provider>
)

export const Step2PhotoWith1FaceConfirmed = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
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
  </SessionContext.Provider>
)

export const Step2PhotoWithMultipleFaces = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
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
  </SessionContext.Provider>
)

const confirmedFaceId = getUuid()
export const Step2PhotoWithMultipleFacesConfirmed = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
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
  </SessionContext.Provider>
)

export const Step3Start = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
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
  </SessionContext.Provider>
)
export const Step3AnnotatingPhoto = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
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
          photoId: getUuid(),
          photoUrl:
            'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=2560&h=2560&q=80',
          faces: [
            // {
            //   faceId: getUuid(),
            //   stage: 'in-progress',
            //   messages: [
            //     {
            //       role: 'assistant',
            //       content: 'Qui est cette personne ?',
            //     },
            //   ],
            // },
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
      ]}
    />
  </SessionContext.Provider>
)
