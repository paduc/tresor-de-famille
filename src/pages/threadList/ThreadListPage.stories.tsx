import * as React from 'react'
import { SessionContext } from '../_components'
import { ThreadListPage } from './ThreadListPage'
import { getUuid } from '../../libs/getUuid'

export default {
  title: 'Lister les fils',
  component: ThreadListPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story: any) => {
      return (
        <SessionContext.Provider
          value={{
            isLoggedIn: true,
            userName: 'toto',
            profilePic: null,
            isAdmin: false,
            arePhotosEnabled: true,
            areThreadsEnabled: true,
            areVideosEnabled: true,
          }}>
          <Story />
        </SessionContext.Provider>
      )
    },
  ],
}

export const PageVide = () => <ThreadListPage threads={[]} />

export const AvecFils = () => (
  <ThreadListPage
    threads={[
      {
        chatId: getUuid(),
        title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        lastUpdatedOn: Date.now(),
      },
      {
        chatId: getUuid(),
        title:
          'Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
        lastUpdatedOn: Date.now(),
      },
      {
        chatId: getUuid(),
        title: 'Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius.',
        lastUpdatedOn: Date.now(),
      },
    ]}
  />
)
