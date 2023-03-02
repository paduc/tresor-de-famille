import * as React from 'react'
import { SessionContext } from '../_components'

import { ChatEvent, ChatPage } from './ChatPage'

export default { title: 'Chat avec IA', component: ChatPage }

const starterHistory: ChatEvent[] = [
  {
    type: 'photo',
    profilePicUrl:
      'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
    photo: {
      id: 'photo123',
      url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
      faces: [
        {
          personName: null,
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
    type: 'message',
    profilePicUrl:
      'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
    message: {
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
    },
  },
]

export const Basique = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <ChatPage
      userProfilePicUrl='https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'
      history={starterHistory}
    />
  </SessionContext.Provider>
)
