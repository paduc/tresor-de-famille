import { SearchIndex } from 'algoliasearch/lite'
import * as React from 'react'
import { AppUserId } from '../../../domain/AppUserId.js'
import { getUuid } from '../../../libs/getUuid.js'
import { SessionContext } from '../../_components/SessionContext.js'
import { PersonSearchContext } from '../../_components/usePersonSearch.js'
import { NewPhotoPage } from './NewPhotoPage.js'
import { makePhotoId } from '../../../libs/makePhotoId.js'
import { makePersonId } from '../../../libs/makePersonId.js'
import { makeThreadId } from '../../../libs/makeThreadId.js'
import { makeFamilyId } from '../../../libs/makeFamilyId.js'

const fakePersonSearch = async (query: string) => {
  return {
    hits: [
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'Zelda', bornOn: '12/04/1985', sex: 'F' },
      { objectID: getUuid(), name: 'Mario Fernando della Cartograpfia', bornOn: '12/04/1985' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
    ],
  }
}

export default {
  title: 'Photo',
  component: NewPhotoPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story: any) => {
      return (
        <SessionContext.Provider
          value={{
            isLoggedIn: true,
            userId: 'a' as AppUserId,

            userFamilies: [],

            userName: 'Toto',
            profilePic: fakePhoto({ width: 100, height: 100 }),
            isAdmin: false,
            arePhotosEnabled: true,
            areThreadsEnabled: false,
            areVideosEnabled: false,
            arePersonsEnabled: true,
            isFamilyPageEnabled: true,
          }}>
          <PersonSearchContext.Provider value={{ search: fakePersonSearch } as unknown as SearchIndex}>
            <Story />
          </PersonSearchContext.Provider>
        </SessionContext.Provider>
      )
    },
  ],
}

const fakePhoto = ({ width, height }: { width: number; height: number }) =>
  `https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=${width}&h=${height}&q=80`

export const LittlePhoto = () => (
  <NewPhotoPage faces={[]} photoId={makePhotoId()} photoUrl={fakePhoto({ width: 250, height: 250 })} />
)

export const BigPhoto = () => (
  <NewPhotoPage faces={[]} photoId={makePhotoId()} photoUrl={fakePhoto({ width: 2500, height: 2500 })} />
)

export const WidePhoto = () => (
  <NewPhotoPage faces={[]} photoId={makePhotoId()} photoUrl={fakePhoto({ width: 2500, height: 500 })} />
)

export const TallPhoto = () => (
  <NewPhotoPage faces={[]} photoId={makePhotoId()} photoUrl={fakePhoto({ width: 500, height: 2000 })} />
)

export const PhotoWithFaces = () => (
  <NewPhotoPage
    faces={[
      { faceId: getUuid(), stage: 'done', name: 'Pierre-Antoine Duchateau', personId: getUuid() },
      { faceId: getUuid(), stage: 'done', name: 'Pierre-Antoine Duchateau', personId: getUuid() },
      { faceId: getUuid(), stage: 'ignored' },
      { faceId: getUuid(), stage: 'awaiting-name' },
      { faceId: getUuid(), stage: 'ignored' },
      { faceId: getUuid(), stage: 'awaiting-name' },
      { faceId: getUuid(), stage: 'ignored' },
      { faceId: getUuid(), stage: 'awaiting-name' },
      { faceId: getUuid(), stage: 'ignored' },
      { faceId: getUuid(), stage: 'awaiting-name' },
      // { faceId: getUuid(), stage: 'awaiting-name' },
      // { faceId: getUuid(), stage: 'done', name: 'Ping', personId: getUuid() },
      // { faceId: getUuid(), stage: 'ignored' },
      // { faceId: getUuid(), stage: 'ignored' },
    ]}
    photoId={makePhotoId()}
    photoUrl={fakePhoto({ width: 1000, height: 1000 })}
    caption='Ceci est une légende'
  />
)

export const PhotoWithoutFaces = () => (
  <NewPhotoPage faces={[]} photoId={makePhotoId()} photoUrl={fakePhoto({ width: 1000, height: 1000 })} />
)

export const PhotoPendingFaceDetection = () => (
  <NewPhotoPage
    faces={undefined}
    photoId={makePhotoId()}
    photoUrl={fakePhoto({ width: 1000, height: 1000 })}
    isPhotoAuthor={false}
  />
)

export const PhotoWithContext = () => (
  <NewPhotoPage
    faces={[
      { faceId: getUuid(), stage: 'done', name: 'Pierre-Antoine Duchateau', personId: getUuid() },
      { faceId: getUuid(), stage: 'done', name: 'Pierre-Antoine Duchateau', personId: getUuid() },
      { faceId: getUuid(), stage: 'ignored' },
      { faceId: getUuid(), stage: 'awaiting-name' },
      { faceId: getUuid(), stage: 'ignored' },
      { faceId: getUuid(), stage: 'awaiting-name' },
      { faceId: getUuid(), stage: 'ignored' },
      { faceId: getUuid(), stage: 'awaiting-name' },
      { faceId: getUuid(), stage: 'ignored' },
      { faceId: getUuid(), stage: 'awaiting-name' },
      // { faceId: getUuid(), stage: 'awaiting-name' },
      // { faceId: getUuid(), stage: 'done', name: 'Ping', personId: getUuid() },
      // { faceId: getUuid(), stage: 'ignored' },
      // { faceId: getUuid(), stage: 'ignored' },
    ]}
    photoId={makePhotoId()}
    photoUrl={fakePhoto({ width: 1000, height: 1000 })}
    caption='Ceci est une légende'
    context={{ type: 'profile', profileId: makePersonId() }}
    isPhotoAuthor={true}
    threadsContainingPhoto={[
      {
        threadId: makeThreadId(),
        familyId: makeFamilyId(),
        title: 'Ceci est un test',
        author: {
          name: 'Pedrito Valasquez',
        },
      },
      {
        threadId: makeThreadId(),
        familyId: makeFamilyId(),
        title: 'Ceci est un test. Ceci est un test. Ceci est un test',
        author: {
          name: 'Pedrito Valasquez',
        },
      },
      {
        threadId: makeThreadId(),
        familyId: makeFamilyId(),
        title: 'Ceci est un test',
        author: {
          name: 'Pedrito Valasquez',
        },
      },
    ]}
  />
)

export const PhotoWithLocation = () => (
  <NewPhotoPage
    faces={[]}
    photoId={makePhotoId()}
    photoUrl={fakePhoto({ width: 1000, height: 1000 })}
    context={{ type: 'profile', profileId: makePersonId() }}
    isPhotoAuthor={true}
    threadsContainingPhoto={[]}
    location={{
      isIrrelevant: true,
      GPSCoords: {
        exif: {
          lat: 49.46800006494457,
          long: 17.11514008755796,
        },
        userOption: 'exif',
      },
      name: {
        userProvided: '',
        mapbox: {
          exif: 'Lavaux 24, 4980 Trois-Ponts, Belgique',
        },
        userOption: 'mapboxFromExif',
      },
    }}
  />
)

export const PhotoWithDatetime = () => (
  <NewPhotoPage
    faces={[]}
    photoId={makePhotoId()}
    photoUrl={fakePhoto({ width: 1000, height: 1000 })}
    context={{ type: 'profile', profileId: makePersonId() }}
    isPhotoAuthor={true}
    threadsContainingPhoto={[]}
    location={{
      isIrrelevant: true,
      GPSCoords: {
        exif: {
          lat: 49.46800006494457,
          long: 17.11514008755796,
        },
        userOption: 'exif',
      },
      name: {
        userProvided: '',
        mapbox: {
          exif: 'Lavaux 24, 4980 Trois-Ponts, Belgique',
        },
        userOption: 'mapboxFromExif',
      },
    }}
    datetime={{ exifDatetime: '2009-05-22T11:20:47.000Z', userOption: 'exif', userProvided: 'Avril 1986' }}
  />
)
