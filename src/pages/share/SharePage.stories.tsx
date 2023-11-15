import * as React from 'react'
import { SessionContext } from '../_components/SessionContext'
import { SharePage } from './SharePage'
import { makePersonId } from '../../libs/makePersonId'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { FamilyId } from '../../domain/FamilyId'
import { AppUserId } from '../../domain/AppUserId'

export default { title: 'Partage', component: SharePage, parameters: { layout: 'fullscreen' } }

export const PremiereNouvelleFamille = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [
        {
          familyId: 'a' as FamilyId,
          familyName: 'Espace personnel',
        },
      ],
      currentFamilyId: 'a' as FamilyId,
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

const familyId = makeFamilyId()
export const UneFamilleExistante = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [
        {
          familyId,
          familyName: 'Ma famille avec un nom trop trop trop trop long',
        },
      ],
      currentFamilyId: familyId,
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

export const UneFamilleCréée = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [
        {
          familyId: 'a' as FamilyId,
          familyName: 'Espace personnel',
        },
        {
          familyId: familyId,
          familyName: 'Ma famille',
        },
      ],
      currentFamilyId: familyId,
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

const henriFamilyId = makeFamilyId()
export const PlusieursFamilleExistantes = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [
        {
          familyId: henriFamilyId,
          familyName: 'Duchateau Henri Family',
        },
        {
          familyId: makeFamilyId(),
          familyName: 'Duchateau Louis Family',
        },
      ],
      currentFamilyId: henriFamilyId,
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
          name: 'Duchateau Louis Family',
          about: 'Les descendants de Louis Duchateau et leurss proches',
          shareUrl: 'https://tresordefamille.org/?famille=CB5ACD2D3EF689A8FBEC4D06C576371834689673',
        },
      ]}
    />
  </SessionContext.Provider>
)
