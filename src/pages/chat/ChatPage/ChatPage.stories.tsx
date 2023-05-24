import * as React from 'react'
import { SessionContext } from '../../_components'

import { ChatEvent, ChatPage } from './ChatPage'
import { UUID } from '../../../domain'

import { getUuid } from '../../../libs/getUuid'

export default { title: 'Fil de souvenir', component: ChatPage, parameters: { layout: 'fullscreen' } }

const t0 = Date.now()
const HOUR = 3600 * 1000

export const Basique = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <ChatPage
      chatId={getUuid()}
      history={[
        {
          timestamp: t0 + 1 * HOUR,
          type: 'message',
          message: {
            body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
          },
        },
      ]}
    />
  </SessionContext.Provider>
)

export const AvecUnePhotoEtVisagesNonIdentifiés = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <ChatPage
      chatId={getUuid()}
      history={[
        {
          timestamp: t0,
          type: 'photo',
          photoId: 'photo123' as UUID,
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
          personsInPhoto: ['Jean', 'Marie', 'Philippe', 'Joseph', 'Helicopter', 'Banane'],
          unrecognizedFacesInPhoto: 3,
        },
      ]}
    />
  </SessionContext.Provider>
)

export const AvecUnePhotoEtVisagesTousIdentifiés = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <ChatPage
      chatId={getUuid()}
      history={[
        {
          timestamp: t0,
          type: 'photo',
          photoId: 'photo123' as UUID,
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
          personsInPhoto: ['Jean', 'Marie', 'Philippe', 'Joseph', 'Helicopter', 'Banane'],
          unrecognizedFacesInPhoto: 0,
        },
      ]}
    />
  </SessionContext.Provider>
)

export const AvecUnePhotoEtUneDescription = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <ChatPage
      chatId={getUuid()}
      history={[
        {
          timestamp: t0,
          type: 'photo',
          photoId: 'photo123' as UUID,
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
          description: 'Cette photo commence a me taper sur les nerfs.',
          personsInPhoto: ['Jean', 'Marie', 'Philippe', 'Joseph', 'Helicopter', 'Banane'],
          unrecognizedFacesInPhoto: 3,
        },
      ]}
    />
  </SessionContext.Provider>
)

export const AvecUnMelangeDePhotoEtMessage = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <ChatPage
      chatId={getUuid()}
      history={[
        {
          timestamp: t0,
          type: 'message',
          message: {
            body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
          },
        },
        {
          timestamp: t0 + 1 * HOUR,
          type: 'photo',
          photoId: 'photo123' as UUID,
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
          description: 'Cette photo commence a me taper sur les nerfs.',
          personsInPhoto: ['Jean', 'Marie', 'Philippe', 'Joseph', 'Helicopter', 'Banane'],
          unrecognizedFacesInPhoto: 0,
        },
        {
          timestamp: t0 + 2 * HOUR,
          type: 'message',
          message: {
            body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
          },
        },
        {
          timestamp: t0 + 2 * HOUR,
          type: 'message',
          message: {
            body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
          },
        },
        {
          timestamp: t0 + 1 * HOUR,
          type: 'photo',
          photoId: 'photo123' as UUID,
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
          personsInPhoto: [],
          unrecognizedFacesInPhoto: 3,
        },
        {
          timestamp: t0 + 1 * HOUR,
          type: 'photo',
          photoId: 'photo123' as UUID,
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
          personsInPhoto: [],
          unrecognizedFacesInPhoto: 0,
        },
        {
          timestamp: t0 + 2 * HOUR,
          type: 'message',
          message: {
            body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
          },
        },
      ]}
    />
  </SessionContext.Provider>
)
