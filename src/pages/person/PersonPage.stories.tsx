import * as React from 'react'
import { AppUserId } from '../../domain/AppUserId'
import { makeFaceId } from '../../libs/makeFaceId'
import { makePhotoId } from '../../libs/makePhotoId'
import { SessionContext } from '../_components/SessionContext'
import { PersonPage } from './PersonPage'
import { makePersonId } from '../../libs/makePersonId'
import { SearchIndex } from 'algoliasearch'
import { FamilyId } from '../../domain/FamilyId'
import { makeAppUserId } from '../../libs/makeUserId'
import { PersonSearchContext } from '../_components/usePersonSearch'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { asFamilyId } from '../../libs/typeguards'
import { makeThreadId } from '../../libs/makeThreadId'
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
  title: 'Page Personne',
  component: PersonPage,
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
                isUserSpace: true,
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

export const AvecDesPhotos = () => (
  <PersonPage
    person={{
      personId: makePersonId(),
      name: 'John Doe',
      familyId: familyABCId,
      profilePicUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=150&h=150&q=80',
    }}
    sharedWithFamilies={[]}
    alternateProfilePics={[
      {
        faceId: makeFaceId(),
        photoId: makePhotoId(),
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=151&h=151&q=80',
      },
      {
        faceId: makeFaceId(),
        photoId: makePhotoId(),
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=150&h=150&q=80',
      },
      {
        faceId: makeFaceId(),
        photoId: makePhotoId(),
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=151&h=150&q=80',
      },
    ]}
    photos={[
      {
        photoId: makePhotoId(),
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=3024&h=4032&q=80',
      },
      {
        photoId: makePhotoId(),
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=3024&h=4032&q=80',
      },
      {
        photoId: makePhotoId(),
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=3024&h=4032&q=80',
      },
      {
        photoId: makePhotoId(),
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=3024&h=4032&q=80',
      },
      {
        photoId: makePhotoId(),
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=3024&h=4032&q=80',
      },
      {
        photoId: makePhotoId(),
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=3024&h=4032&q=80',
      },
      {
        photoId: makePhotoId(),
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=3024&h=4032&q=80',
      },
      {
        photoId: makePhotoId(),
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=3024&h=4032&q=80',
      },
      {
        photoId: makePhotoId(),
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=3024&h=4032&q=80',
      },
      {
        photoId: makePhotoId(),
        url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=3024&h=4032&q=80',
      },
    ]}
    threadsTheyAppearIn={[
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
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
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
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
        ],
        title: undefined,
        contents: 'Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius.',
        lastUpdatedOn: Date.now(),
        commentCount: 12,
      },
    ]}
    threadsTheyWrote={[
      {
        threadId: makeThreadId(),
        authors: [
          {
            name: 'John Doe',
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
    ]}
  />
)
