import * as React from 'react'
import { SessionContext } from '../_components/SessionContext.js'
import { ThreadListPage } from './ThreadListPage.js'
import { getUuid } from '../../libs/getUuid.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { makeThreadId } from '../../libs/makeThreadId.js'
import { makeFamilyId } from '../../libs/makeFamilyId.js'
import { PersonSearchContext } from '../_components/usePersonSearch.js'
import { makeAppUserId } from '../../libs/makeUserId.js'
import { SearchIndex } from 'algoliasearch/lite'
import { asFamilyId } from '../../libs/typeguards.js'

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
                isUserSpace: true,
                shareUrl: '',
              },
              {
                familyId: familyABCId,
                familyName: 'Famille ABC',
                about: 'La famille qui connait le début de son alphabet',
                color: 'bg-red-50 text-red-700 ring-red-600/10',
                isUserSpace: false,
                shareUrl: '',
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
        authors: [
          {
            name: 'Philip McMuffin',
            // profilePicUrl: fakeProfilePicUrl,
          },
        ],

        familyIds: ['a' as FamilyId],
        thumbnails: [],
        title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        contents: '',
        lastUpdatedOn: Date.now(),
        commentCount: 0,
      },
      {
        threadId: makeThreadId(),
        authors: [
          {
            name: 'Philip McMuffin',
            // profilePicUrl: fakeProfilePicUrl,
          },
        ],
        familyIds: ['a' as FamilyId],
        thumbnails: [
          {
            type: 'video',
            url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          },
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          },
          {
            type: 'video',
            url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          },
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          },
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          },
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          },
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          },
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          },
        ],
        title: undefined,
        contents:
          'Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
        lastUpdatedOn: Date.now(),
        commentCount: 1,
      },
      {
        threadId: makeThreadId(),
        authors: [
          {
            name: 'Philip McMuffin',
            // profilePicUrl: fakeProfilePicUrl,
          },
          {
            name: 'Philip McMuffin',
            // profilePicUrl: fakeProfilePicUrl,
          },
          {
            name: 'Philip McMuffin',
            // profilePicUrl: fakeProfilePicUrl,
          },
        ],
        familyIds: [asFamilyId('a'), familyABCId, familyABCId, familyABCId, familyABCId, familyABCId],
        thumbnails: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          },
        ],
        title: undefined,
        contents: 'Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius.',
        lastUpdatedOn: Date.now(),
        commentCount: 12,
      },
    ]}
  />
)
