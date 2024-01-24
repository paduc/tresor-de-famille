import { SearchIndex } from 'algoliasearch/lite'
import * as React from 'react'
import { AppUserId } from '../../../domain/AppUserId'
import { getUuid } from '../../../libs/getUuid'
import { SessionContext } from '../../_components/SessionContext'
import { PersonSearchContext } from '../../_components/usePersonSearch'
import { NewPhotoPage } from './NewPhotoPage'
import { makePhotoId } from '../../../libs/makePhotoId'
import { makePersonId } from '../../../libs/makePersonId'

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
  title: 'Nouvelle Page Photo',
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
  <NewPhotoPage faces={undefined} photoId={makePhotoId()} photoUrl={fakePhoto({ width: 1000, height: 1000 })} />
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
  />
)
