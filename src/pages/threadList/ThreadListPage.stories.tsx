import * as React from 'react'
import { SessionContext } from '../_components/SessionContext'
import { ThreadListPage } from './ThreadListPage'
import { getUuid } from '../../libs/getUuid'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'

export default {
  title: 'Lister les anecdotes',
  component: ThreadListPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story: any) => {
      return (
        <SessionContext.Provider
          value={{
            isLoggedIn: true,
            userId: 'a' as AppUserId,

            userFamilies: [],
            currentFamilyId: 'a' as FamilyId,
            userName: 'toto',
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

export const PageVide = () => <ThreadListPage threads={[]} />

export const AvecFils = () => (
  <ThreadListPage
    threads={[
      {
        threadId: getUuid(),
        title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        lastUpdatedOn: Date.now(),
      },
      {
        threadId: getUuid(),
        title:
          'Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
        lastUpdatedOn: Date.now(),
      },
      {
        threadId: getUuid(),
        title: 'Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius.',
        lastUpdatedOn: Date.now(),
      },
    ]}
  />
)
