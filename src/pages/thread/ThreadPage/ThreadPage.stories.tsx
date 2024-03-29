import * as React from 'react'
import { SessionContext } from '../../_components/SessionContext.js'

import { ThreadPage } from './ThreadPage.js'

import { Epoch } from '../../../libs/typeguards.js'
import { makeThreadId } from '../../../libs/makeThreadId.js'
import { PhotoId } from '../../../domain/PhotoId.js'
import { AppUserId } from '../../../domain/AppUserId.js'
import { FamilyId } from '../../../domain/FamilyId.js'
import { PersonSearchContext } from '../../_components/usePersonSearch.js'
import { SearchIndex } from 'algoliasearch/lite'
import { makeAppUserId } from '../../../libs/makeUserId.js'
import { makeFamilyId } from '../../../libs/makeFamilyId.js'
import { ReadOnlyThreadPage } from './ReadonlyThreadPage.js'
import { LocationContext } from '../../_components/LocationContext.js'
import { FamilyColorCodes } from '../../../libs/ssr/FamilyColorCodes.js'
import { makeCommentId } from '../../../libs/makeCommentId.js'

const fakePersonSearch = async (query: string) => {
  return {
    hits: [
      { objectID: makeAppUserId(), name: 'John Doe' },
      { objectID: makeAppUserId(), name: 'Zelda Moroney' },
      { objectID: makeAppUserId(), name: 'Claire Politi' },
    ],
  }
}

const fakeProfileUrl =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'

export default {
  title: 'Histoires et anecdotes',
  component: ThreadPage,
  parameters: {
    layout: 'fullscreen',
  },
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
                familyName: 'Votre espace personnel',
                about: '',
                color: FamilyColorCodes[0],
                isUserSpace: true,
              },
              {
                familyId: 'b' as FamilyId,
                familyName: 'Famille A',
                about: 'La famille A',
                color: FamilyColorCodes[1],
                isUserSpace: false,
              },
              {
                familyId: makeFamilyId(),
                familyName: 'Famille B',
                about: 'La famille B',
                color: FamilyColorCodes[2],
                isUserSpace: false,
              },
              {
                familyId: makeFamilyId(),
                familyName: 'Famille C',
                about: 'La famille C',
                color: FamilyColorCodes[3],
                isUserSpace: false,
              },
            ],

            userName: 'Jean-Michel Trotro',
            profilePic: fakeProfileUrl,
            isAdmin: false,
            arePhotosEnabled: true,
            areThreadsEnabled: true,
            areVideosEnabled: true,
            arePersonsEnabled: true,
          }}>
          <LocationContext.Provider value={window.location.href}>
            <PersonSearchContext.Provider value={{ search: fakePersonSearch } as unknown as SearchIndex}>
              <Story />
            </PersonSearchContext.Provider>
          </LocationContext.Provider>
        </SessionContext.Provider>
      )
    },
  ],
}

const t0 = Date.now()
const HOUR = 3600 * 1000

export const AvecUnMelangeDePhotoEtMessage = () => (
  <ThreadPage
    threadId={makeThreadId()}
    familyId={'a' as FamilyId}
    lastUpdated={t0 as Epoch}
    isAuthor={true}
    // title='Ceci est le titre'
    title=''
    contentAsJSON={{
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Message',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Message',
            },
          ],
        },
        {
          type: 'photoNode',
          attrs: {
            threadId: makeThreadId(),
            photoId: 'photo123' as PhotoId,
            url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
            // url: 'http://localhost:6006/img.jpeg',
            description: 'Ici la description',
            personsInPhoto: encodeURIComponent(JSON.stringify(['Jean', 'Marie', 'Philippe', 'Joseph', 'Helicopter', 'Banane'])),
            unrecognizedFacesInPhoto: 0,
          },
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Message',
            },
          ],
        },
        {
          type: 'photoNode',
          attrs: {
            threadId: makeThreadId(),
            photoId: 'photo123' as PhotoId,
            url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1500&h=200&q=80',
            description: '',
            personsInPhoto: encodeURIComponent(JSON.stringify([])),
            unrecognizedFacesInPhoto: 10,
          },
        },
        {
          type: 'photoNode',
          attrs: {
            threadId: makeThreadId(),
            photoId: 'photo123' as PhotoId,
            url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
            description: '',
            personsInPhoto: encodeURIComponent(JSON.stringify([])),
            unrecognizedFacesInPhoto: 10,
          },
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Message',
            },
          ],
        },
      ],
    }}
  />
)

export const Personnel = () => (
  <ThreadPage
    threadId={makeThreadId()}
    familyId={'a' as FamilyId}
    isAuthor={true}
    lastUpdated={t0 as Epoch}
    title='Ceci est le titre'
    contentAsJSON={{
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Message',
            },
          ],
        },
      ],
    }}
  />
)

export const PasEncoreDeFamilles = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [
        {
          familyId: 'a' as FamilyId,
          familyName: 'Perso',
          about: '',
          color: FamilyColorCodes[0],
          isUserSpace: true,
        },
      ],

      userName: 'Jean-Michel Trotro',
      profilePic: null,
      isAdmin: false,
      arePhotosEnabled: true,
      areThreadsEnabled: true,
      areVideosEnabled: true,
      arePersonsEnabled: true,
    }}>
    <ThreadPage
      threadId={makeThreadId()}
      familyId={'a' as FamilyId}
      isAuthor={true}
      lastUpdated={t0 as Epoch}
      title='Ceci est le titre'
      contentAsJSON={{
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Message',
              },
            ],
          },
        ],
      }}
    />
  </SessionContext.Provider>
)

export const PartagéNonAuteur = () => (
  <ThreadPage
    threadId={makeThreadId()}
    familyId={'b' as FamilyId}
    isAuthor={false}
    lastUpdated={t0 as Epoch}
    title='Ceci est le titre'
    contentAsJSON={{
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Message',
            },
          ],
        },
      ],
    }}
  />
)
export const PartagéAuteur = () => (
  <ThreadPage
    threadId={makeThreadId()}
    familyId={'b' as FamilyId}
    isAuthor={true}
    lastUpdated={t0 as Epoch}
    title='Ceci est le titre'
    contentAsJSON={{
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Message',
            },
          ],
        },
      ],
    }}
  />
)
export const LectureSeuleSansCommentaire = () => (
  <LocationContext.Provider value={window.location.href}>
    <ReadOnlyThreadPage
      threadId={makeThreadId()}
      familyId={'b' as FamilyId}
      isAuthor={true}
      lastUpdated={t0 as Epoch}
      title='Ceci est le titre'
      contentAsJSON={{
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Message',
              },
            ],
          },
        ],
      }}
      comments={[]}
      user={{
        userId: makeAppUserId(),
        profilePicUrl: fakeProfileUrl,
      }}
    />
  </LocationContext.Provider>
)

export const LectureSeuleAvecCommentaires = () => (
  <LocationContext.Provider value={window.location.href}>
    <ReadOnlyThreadPage
      threadId={makeThreadId()}
      familyId={'b' as FamilyId}
      isAuthor={false}
      authorName='Pierrot la lune'
      lastUpdated={t0 as Epoch}
      title='Ceci est le titre'
      contentAsJSON={{
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Message',
              },
            ],
          },
        ],
      }}
      user={{
        userId: makeAppUserId(),
        profilePicUrl: fakeProfileUrl,
      }}
      comments={[
        {
          commentId: makeCommentId(),
          author: {
            name: 'John Doe',
            profilePicUrl: fakeProfileUrl,
          },
          body: 'Lorem ipsum !',
          dateTime: '2023-01-23T15:56',
        },
        {
          commentId: makeCommentId(),
          author: {
            name: 'John Doe',
            profilePicUrl: fakeProfileUrl,
          },
          body: 'Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
          dateTime: '2023-01-23T15:56',
        },
        {
          commentId: makeCommentId(),
          author: {
            name: 'John Doe',
            profilePicUrl: fakeProfileUrl,
          },
          body: 'Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
          dateTime: '2023-01-23T15:56',
        },
      ]}
    />
  </LocationContext.Provider>
)
