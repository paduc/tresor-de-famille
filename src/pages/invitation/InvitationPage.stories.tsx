import * as React from 'react'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { makePersonId } from '../../libs/makePersonId'
import { SessionContext } from '../_components/SessionContext'
import { InvitationPage } from './InvitationPage'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { FamilyShareCode } from '../../domain/FamilyShareCode'

export default { title: 'Page Invitation', component: InvitationPage, parameters: { layout: 'fullscreen' } }

export const UtilisateurConnecté = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: true,
      userId: 'a' as AppUserId,
      userFamilies: [
        {
          familyId: 'a' as FamilyId,
          familyName: 'Espace personnel',
          about: '',
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
    <InvitationPage
      error={false}
      family={{
        familyId: makeFamilyId(),
        name: 'Les Duduchs',
        about: 'La famille Duchateau François avec les enfants, petits-enfants et pièces rajoutées',
      }}
      code={'a' as FamilyShareCode}
      inviterName='Pierrot La lune'
    />
  </SessionContext.Provider>
)

export const UtilisateurDéconnecté = () => (
  <SessionContext.Provider
    value={{
      isLoggedIn: false,
      isSharingEnabled: true,
    }}>
    <InvitationPage
      error={false}
      family={{
        familyId: makeFamilyId(),
        name: 'Les Duduchs',
        about: 'La famille Duchateau François avec les enfants, petits-enfants et pièces rajoutées',
      }}
      code={'a' as FamilyShareCode}
      inviterName='Pierrot La lune'
    />
  </SessionContext.Provider>
)
