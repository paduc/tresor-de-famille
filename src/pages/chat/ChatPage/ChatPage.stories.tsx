import * as React from 'react'
import { SessionContext } from '../../_components'

import { ChatPage } from './ChatPage'

import { Epoch } from '../../../libs/typeguards'
import { makeThreadId } from '../../../libs/makeThreadId'
import { PhotoId } from '../../../domain/PhotoId'

export default {
  title: 'Histoires et anecdotes',
  component: ChatPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story: any) => {
      return (
        <SessionContext.Provider
          value={{
            isLoggedIn: true,
            userName: 'Jean-Michel Trotro',
            profilePic: null,
            isAdmin: false,
            arePhotosEnabled: true,
            areThreadsEnabled: true,
            areVideosEnabled: true,
            arePersonsEnabled: true,
          }}>
          <Story />
        </SessionContext.Provider>
      )
    },
  ],
}

const t0 = Date.now()
const HOUR = 3600 * 1000

export const AvecUnMelangeDePhotoEtMessage = () => (
  <ChatPage
    chatId={makeThreadId()}
    lastUpdated={t0 as Epoch}
    title='Ceci est le titre'
    contentAsJSON={{
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Message',
            },
          ],
        },
        {
          type: 'photoNode',
          attrs: {
            chatId: makeThreadId(),
            photoId: 'photo123' as PhotoId,
            url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
            description: 'Ici la description',
            personsInPhoto: encodeURIComponent(JSON.stringify(['Jean', 'Marie', 'Philippe', 'Joseph', 'Helicopter', 'Banane'])),
            unrecognizedFacesInPhoto: 0,
          },
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Second message',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Third message',
            },
          ],
        },
        {
          type: 'photoNode',
          attrs: {
            chatId: makeThreadId(),
            photoId: 'photo123' as PhotoId,
            url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
            description: '',
            personsInPhoto: encodeURIComponent(JSON.stringify([])),
            unrecognizedFacesInPhoto: 10,
          },
        },
      ],
    }}
  />
)
