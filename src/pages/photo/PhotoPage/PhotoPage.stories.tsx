import * as React from 'react'
import { SessionContext } from '../../_components'

import { ChatEvent, PhotoPage } from './PhotoPage'

export default { title: 'Ajouter une Photo', component: PhotoPage, parameters: { layout: 'fullscreen' } }

const t0 = Date.now()
const HOUR = 3600 * 1000

const starterHistory: ChatEvent[] = [
  {
    timestamp: t0,
    type: 'photo',
    profilePicUrl:
      'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
    photo: {
      id: 'photo123',
      url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
      faces: [
        {
          person: null,
          faceId: 'face123',
          position: {
            width: 0.3004770278930664,
            height: 0.39314860105514526,
            left: 0.3541097640991211,
            top: 0.24908018112182617,
          },
        },
      ],
    },
  },
  {
    timestamp: t0 + 1 * HOUR,
    type: 'message',
    profilePicUrl:
      'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
    message: {
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
    },
  },
  {
    timestamp: t0 + 1 * HOUR,
    type: 'deductions',
    deductions: [
      {
        person: {
          name: 'Toto',
        },
        faceId: 'face123',
        photo: {
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
        },
        position: {
          width: 0.3004770278930664,
          height: 0.39314860105514526,
          left: 0.3541097640991211,
          top: 0.24908018112182617,
        },
      },
    ],
  },
]

export const Démarrage = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <PhotoPage photo={null} />
  </SessionContext.Provider>
)

export const ApresUploadPhotoLarge = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <PhotoPage
      photo={{
        id: '',
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=4032&h=3024&q=80',
      }}
    />
  </SessionContext.Provider>
)
export const ApresUploadPhotoHaute = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <PhotoPage
      photo={{
        id: '',
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=3024&h=4032&q=80',
      }}
    />
  </SessionContext.Provider>
)

export const PhotoAvecVisagesInconnu = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <PhotoPage
      photo={{
        id: '',
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=4032&h=3024&q=80',
        faces: [
          {
            person: null,
            faceId: 'face123',
            position: {
              width: 0.3004770278930664,
              height: 0.39314860105514526,
              left: 0.3541097640991211,
              top: 0.24908018112182617,
            },
          },
        ],
      }}
    />
  </SessionContext.Provider>
)

export const PhotoAvecVisagesConnus = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <PhotoPage
      photo={{
        id: '',
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=4032&h=3024&q=80',
        faces: [
          {
            person: {
              name: 'Toto',
              annotatedBy: 'ai',
            },
            faceId: 'face123',
            position: {
              width: 0.3004770278930664,
              height: 0.39314860105514526,
              left: 0.3541097640991211,
              top: 0.24908018112182617,
            },
          },
          {
            person: {
              name: 'Fantome',
              annotatedBy: 'face-recognition',
            },
            faceId: 'face124',
            position: {
              width: 0.3004770278930664,
              height: 0.39314860105514526,
              left: 0,
              top: 0,
            },
          },
        ],
      }}
    />
  </SessionContext.Provider>
)
