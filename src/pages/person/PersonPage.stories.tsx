import * as React from 'react'
import { PersonPage } from './PersonPage'
import { SessionContext } from '../_components/SessionContext'
import { getUuid } from '../../libs/getUuid'
import { makePhotoId } from '../../libs/makePhotoId'
import { makeFaceId } from '../../libs/makeFaceId'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'

export default { title: 'Page Personne', component: PersonPage, parameters: { layout: 'fullscreen' } }

export const AvecDesPhotos = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [],
      currentFamilyId: 'a' as FamilyId,
      userName: 'toto',
      isAdmin: false,
    }}>
    <PersonPage
      person={{
        name: 'John Doe',
        profilePicUrl:
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=150&h=150&q=80',
      }}
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
    />
  </SessionContext.Provider>
)
