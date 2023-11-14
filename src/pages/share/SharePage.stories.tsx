import * as React from 'react'
import { SessionContext } from '../_components/SessionContext'
import { SharePage } from './SharePage'
import { makePersonId } from '../../libs/makePersonId'
import { makeFamilyId } from '../../libs/makeFamilyId'

export default { title: 'Partage', component: SharePage, parameters: { layout: 'fullscreen' } }

export const PremiereNouvelleFamille = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userName: 'John Doe Adear',
      profilePic:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
      isAdmin: false,
      arePhotosEnabled: true,
      areThreadsEnabled: true,
      areVideosEnabled: false,
      arePersonsEnabled: true,
      isSharingEnabled: true,
      isFamilyPageEnabled: true,
      personId: makePersonId(),
    }}>
    <SharePage userFamilies={[]} />
  </SessionContext.Provider>
)

export const UneFamilleExistante = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userName: 'John Doe Adear',
      profilePic:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
      isAdmin: false,
      arePhotosEnabled: true,
      areThreadsEnabled: true,
      areVideosEnabled: false,
      arePersonsEnabled: true,
      isSharingEnabled: true,
      isFamilyPageEnabled: true,
      personId: makePersonId(),
    }}>
    <SharePage
      userFamilies={[
        {
          familyId: makeFamilyId(),
          name: 'Duchateau Henri Family',
          about: 'Les descendants de Henri Duchateau et les proches',
          shareUrl: 'https://tresordefamille.org/?famille=CB5ACD2D3EF689A8FBEC4D06C576371834689673',
        },
      ]}
    />
  </SessionContext.Provider>
)

export const PlusieursFamilleExistantes = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userName: 'John Doe Adear',
      profilePic:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
      isAdmin: false,
      arePhotosEnabled: true,
      areThreadsEnabled: true,
      areVideosEnabled: false,
      arePersonsEnabled: true,
      isSharingEnabled: true,
      isFamilyPageEnabled: true,
      personId: makePersonId(),
    }}>
    <SharePage
      userFamilies={[
        {
          familyId: makeFamilyId(),
          name: 'Duchateau Henri Family',
          about: 'Les descendants de Henri Duchateau et les proches',
          shareUrl: 'https://tresordefamille.org/?famille=CB5ACD2D3EF689A8FBEC4D06C576371834689673',
        },
        {
          familyId: makeFamilyId(),
          name: 'Duchateau Henri Family',
          about: 'Les descendants de Henri Duchateau et les proches',
          shareUrl: 'https://tresordefamille.org/?famille=CB5ACD2D3EF689A8FBEC4D06C576371834689673',
        },
      ]}
    />
  </SessionContext.Provider>
)
