import * as React from 'react'
import { SessionContext } from '../_components'
import { ListPhotosPage } from './ListPhotosPage'
import { getUuid } from '../../libs/getUuid'

export default { title: 'Lister les Photos', component: ListPhotosPage, parameters: { layout: 'fullscreen' } }

export const PageVide = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <ListPhotosPage photos={[]} />
  </SessionContext.Provider>
)

export const AvecPhotos = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <ListPhotosPage
      photos={[
        {
          photoId: getUuid(),
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=500&q=80',
        },
        {
          photoId: getUuid(),
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=500&h=300&q=80',
        },
        {
          photoId: getUuid(),
          url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=300&h=500&q=80',
        },
      ]}
    />
  </SessionContext.Provider>
)
