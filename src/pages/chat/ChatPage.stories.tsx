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
]

export const Basique = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <ChatPage history={starterHistory} />
  </SessionContext.Provider>
)
