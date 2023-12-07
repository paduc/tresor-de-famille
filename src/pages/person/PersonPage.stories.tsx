import * as React from 'react'
import { AppUserId } from '../../domain/AppUserId'
import { makeFaceId } from '../../libs/makeFaceId'
import { makePhotoId } from '../../libs/makePhotoId'
import { SessionContext } from '../_components/SessionContext'
import { PersonPage } from './PersonPage'
import { makePersonId } from '../../libs/makePersonId'

export default { title: 'Page Personne', component: PersonPage, parameters: { layout: 'fullscreen' } }

export const AvecDesPhotos = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [],

      userName: 'toto',
      isAdmin: false,
    }}>
    <PersonPage
      person={{
        personId: makePersonId(),
        name: 'John Doe',
        familyName: 'Espace perso',
        profilePicUrl:
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=150&h=150&q=80',
      }}
      clones={[
        {
          personId: makePersonId(),
          familyName: 'Famille Duduch',
        },
        {
          personId: makePersonId(),
          familyName: 'Famille Cardi',
        },
      ]}
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
