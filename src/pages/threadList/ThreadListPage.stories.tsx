import * as React from 'react'
import { SessionContext } from '../_components/SessionContext'
import { ThreadListPage } from './ThreadListPage'
import { getUuid } from '../../libs/getUuid'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { makeThreadId } from '../../libs/makeThreadId'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { PersonSearchContext } from '../_components/usePersonSearch'
import { makeAppUserId } from '../../libs/makeUserId'
import { SearchIndex } from 'algoliasearch/lite'

const fakePersonSearch = async (query: string) => {
  return {
    hits: [
      { objectID: makeAppUserId(), name: 'John Doe' },
      { objectID: makeAppUserId(), name: 'Zelda Moroney' },
      { objectID: makeAppUserId(), name: 'Claire Politi' },
      ,
    ],
  }
}

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
            hasFamiliesOtherThanDefault: true,
            currentFamilyId: 'a' as FamilyId,
            userName: 'toto',
            profilePic: null,
            isAdmin: false,
            arePhotosEnabled: true,
            areThreadsEnabled: true,
            areVideosEnabled: true,
            arePersonsEnabled: true,
          }}>
          <PersonSearchContext.Provider value={{ search: fakePersonSearch } as unknown as SearchIndex}>
            <Story />
          </PersonSearchContext.Provider>
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
        threadId: makeThreadId(),
        family: {
          familyId: makeFamilyId(),
          name: 'Famille A',
        },
        title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        lastUpdatedOn: Date.now(),
      },
      {
        threadId: makeThreadId(),
        family: {
          familyId: makeFamilyId(),
          name: 'Famille B',
        },
        title:
          'Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
        lastUpdatedOn: Date.now(),
      },
      {
        threadId: makeThreadId(),
        family: {
          familyId: 'a' as FamilyId,
          name: undefined,
        },
        title: 'Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius.',
        lastUpdatedOn: Date.now(),
      },
    ]}
  />
)
