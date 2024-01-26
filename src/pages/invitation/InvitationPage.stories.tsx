import * as React from 'react'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { makePersonId } from '../../libs/makePersonId'
import { SessionContext } from '../_components/SessionContext'
import { InvitationPage } from './InvitationPage'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { FamilyShareCode } from '../../domain/FamilyShareCode'
import { SearchIndex } from 'algoliasearch'
import { getUuid } from '../../libs/getUuid'
import { PersonSearchContext } from '../_components/usePersonSearch'

export default {
  title: 'Page Invitation',
  component: InvitationPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story: any) => {
      return (
        <PersonSearchContext.Provider value={{ search: fakePersonSearch } as unknown as SearchIndex}>
          <Story />
        </PersonSearchContext.Provider>
      )
    },
  ],
}

const fakePersonSearch = async (query: string) => {
  return {
    hits: [
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
    ],
  }
}

const familyABCId = makeFamilyId()

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
