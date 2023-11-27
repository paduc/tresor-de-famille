import * as React from 'react'
import { SessionContext } from '../../_components/SessionContext'

import { ThreadPage } from './ThreadPage'

import { Epoch } from '../../../libs/typeguards'
import { makeThreadId } from '../../../libs/makeThreadId'
import { PhotoId } from '../../../domain/PhotoId'
import { AppUserId } from '../../../domain/AppUserId'
import { FamilyId } from '../../../domain/FamilyId'
import { PersonSearchContext } from '../../_components/usePersonSearch'
import { SearchIndex } from 'algoliasearch/lite'
import { makeAppUserId } from '../../../libs/makeUserId'
import { makeFamilyId } from '../../../libs/makeFamilyId'
import { ReadOnlyThreadPage } from './ReadonlyThreadPage'
import { LocationContext } from '../../_components/LocationContext'

const fakePersonSearch = async (query: string) => {
  return {
    hits: [
      { objectID: makeAppUserId(), name: 'John Doe' },
      { objectID: makeAppUserId(), name: 'Zelda Moroney' },
      { objectID: makeAppUserId(), name: 'Claire Politi' },
    ],
  }
}

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
                familyName: 'Perso',
                about: '',
              },

              {
                familyId: 'b' as FamilyId,
                familyName: 'Famille A',
                about: 'La famille A',
              },
              {
                familyId: makeFamilyId(),
                familyName: 'Famille B',
                about: 'La famille B',
              },
              {
                familyId: makeFamilyId(),
                familyName: 'Famille C',
                about: 'La famille C',
              },
            ],
            currentFamilyId: 'a' as FamilyId,
            userName: 'Jean-Michel Trotro',
            profilePic: null,
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
              text: 'Second message',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Third message',
            },
          ],
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
export const LectureSeule = () => (
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
    />
  </LocationContext.Provider>
)
