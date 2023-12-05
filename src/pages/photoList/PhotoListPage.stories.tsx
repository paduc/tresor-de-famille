import * as React from 'react'
import { makePhotoId } from '../../libs/makePhotoId'
import { SessionContext } from '../_components/SessionContext'
import { PhotoListPage } from './PhotoListPage'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'

export default { title: 'Lister les Photos', component: PhotoListPage, parameters: { layout: 'fullscreen' } }

export const PageVide = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [],

      userName: 'toto',
      isAdmin: false,
    }}>
    <PhotoListPage photos={[]} />
  </SessionContext.Provider>
)

export const AvecPhotos = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [
        {
          familyName: 'Famille 1',
          about: '',
          familyId: '1' as FamilyId,
        },
      ],

      userName: 'toto',
      isAdmin: false,
    }}>
    <PhotoListPage
      currentFamilyId={'1' as FamilyId}
      photos={[
        {
          photoId: makePhotoId(),
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
        },
        {
          photoId: makePhotoId(),
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=300&q=80',
        },
        {
          photoId: makePhotoId(),
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=300&h=500&q=80',
        },
      ]}
    />
  </SessionContext.Provider>
)

export const AvecPhotosPlusieursFamilles = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [
        {
          familyName: 'Famille 1',
          about: "C'est la famille 1, la number #1 quoi.",
          familyId: '1' as FamilyId,
        },
        {
          familyName: 'Famille 2',
          about: '',
          familyId: '2' as FamilyId,
        },
      ],

      userName: 'toto',
      isAdmin: false,
    }}>
    <PhotoListPage
      currentFamilyId={'1' as FamilyId}
      photos={[
        {
          photoId: makePhotoId(),
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
        },
        {
          photoId: makePhotoId(),
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=300&q=80',
        },
        {
          photoId: makePhotoId(),
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=300&h=500&q=80',
        },
      ]}
    />
  </SessionContext.Provider>
)
