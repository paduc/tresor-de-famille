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

const familyABCId = makeFamilyId()
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

            userFamilies: [
              {
                familyId: 'a' as FamilyId,
                familyName: 'Espace personnel',
                about: '',
                color: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10',
              },
              {
                familyId: familyABCId,
                familyName: 'Famille ABC',
                about: 'La famille qui connait le début de son alphabet',
                color: 'bg-red-50 text-red-700 ring-red-600/10',
              },
            ],
            hasFamiliesOtherThanDefault: true,

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

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'
export const AvecFils = () => (
  <ThreadListPage
    threads={[
      {
        threadId: makeThreadId(),
        author: {
          name: 'Philip McMuffin',
          // profilePicUrl: fakeProfilePicUrl,
        },

        familyId: 'a' as FamilyId,
        thumbnails: [],
        title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        lastUpdatedOn: Date.now(),
      },
      {
        threadId: makeThreadId(),
        author: {
          name: 'Philip McMuffin',
          // profilePicUrl: fakeProfilePicUrl,
        },
        familyId: 'a' as FamilyId,
        thumbnails: [
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
        ],
        title:
          'Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
        lastUpdatedOn: Date.now(),
      },
      {
        threadId: makeThreadId(),
        author: {
          name: 'Philip McMuffin',
          // profilePicUrl: fakeProfilePicUrl,
        },
        familyId: familyABCId,
        thumbnails: [
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
        ],
        title: 'Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius.',
        lastUpdatedOn: Date.now(),
      },
    ]}
  />
)
