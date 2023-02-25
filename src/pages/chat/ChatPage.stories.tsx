import * as React from 'react'
import { SessionContext } from '../_components'

import { ChatEvent, ChatPage } from './ChatPage'

export default { title: 'Chat avec IA', component: ChatPage }

const starterHistory: ChatEvent[] = [
  {
    type: 'photo',
    photoId: 'photo123',
    url: 'url',
  },
  {
    type: 'message',
    message: {
      authorName: 'Vous',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
    },
  },
]

export const Basique = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <ChatPage history={starterHistory} />
  </SessionContext.Provider>
)
