import * as React from 'react'
import { SessionContext } from '../_components'
import { ThreadListPage } from './ThreadListPage'
import { getUuid } from '../../libs/getUuid'

export default { title: 'Lister les fils', component: ThreadListPage, parameters: { layout: 'fullscreen' } }

export const PageVide = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <ThreadListPage threads={[]} />
  </SessionContext.Provider>
)

export const AvecFils = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <ThreadListPage
      threads={[
        {
          chatId: getUuid(),
          title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          chatId: getUuid(),
          title:
            'Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
        },
        {
          chatId: getUuid(),
          title: 'Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius.',
        },
      ]}
    />
  </SessionContext.Provider>
)
