import * as React from 'react'
import { SessionContext } from '../../_components/SessionContext'

import { ShareWithMultipleFamilyModal } from './ThreadSharingButton'

import { Epoch } from '../../../libs/typeguards'
import { makeThreadId } from '../../../libs/makeThreadId'
import { PhotoId } from '../../../domain/PhotoId'
import { AppUserId } from '../../../domain/AppUserId'
import { FamilyId } from '../../../domain/FamilyId'
import { PersonSearchContext } from '../../_components/usePersonSearch'
import { SearchIndex } from 'algoliasearch/lite'
import { makeAppUserId } from '../../../libs/makeUserId'
import { makeFamilyId } from '../../../libs/makeFamilyId'
import { ReadOnlyThreadPage } from './ReadonlyThreadPage'
import { LocationContext } from '../../_components/LocationContext'
import { FamilyColorCodes } from '../../../libs/ssr/FamilyColorCodes'

const fakePersonSearch = async (query: string) => {
  return {
    hits: [
      { objectID: makeAppUserId(), name: 'John Doe' },
      { objectID: makeAppUserId(), name: 'Zelda Moroney' },
      { objectID: makeAppUserId(), name: 'Claire Politi' },
    ],
  }
}

export default {
  title: 'Bouton Partager',
  component: ShareWithMultipleFamilyModal,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story: any) => {
      return (
        <SessionContext.Provider
          value={{
            isLoggedIn: true,
            userId: 'a' as AppUserId,
            userFamilies: [
              {
                familyId: 'a' as FamilyId,
                familyName: 'Votre espace personnel',
                about: '',
                color: FamilyColorCodes[0],
                isUserSpace: true,
                shareUrl: '',
              },
              {
                familyId: 'b' as FamilyId,
                familyName: 'Famille A',
                about: 'La famille A',
                color: FamilyColorCodes[1],
                isUserSpace: false,
                shareUrl: '',
              },
              {
                familyId: makeFamilyId(),
                familyName: 'Famille B',
                about: 'La famille B',
                color: FamilyColorCodes[2],
                isUserSpace: false,
                shareUrl: '',
              },
            ],

            userName: 'Jean-Michel Trotro',
            profilePic: null,
            isAdmin: false,
            arePhotosEnabled: true,
            areThreadsEnabled: true,
            areVideosEnabled: true,
            arePersonsEnabled: true,
          }}>
          <LocationContext.Provider value={window.location.href}>
            <PersonSearchContext.Provider value={{ search: fakePersonSearch } as unknown as SearchIndex}>
              <Story />
            </PersonSearchContext.Provider>
          </LocationContext.Provider>
        </SessionContext.Provider>
      )
    },
  ],
}

export const Base = () => (
  <ShareWithMultipleFamilyModal
    isOpen={true}
    onClose={() => {}}
    onNewFamily={() => {}}
    currentFamilyIds={[]}
    userFamilies={[
      {
        familyId: 'a' as FamilyId,
        familyName: 'Votre espace personnel',
        about: '',
        color: FamilyColorCodes[0],
        isUserSpace: true,
        shareUrl: '',
      },
      {
        familyId: 'b' as FamilyId,
        familyName: 'Famille A',
        about: 'La famille A',
        color: FamilyColorCodes[1],
        isUserSpace: false,
        shareUrl: '',
      },
      {
        familyId: makeFamilyId(),
        familyName: 'Famille B',
        about: 'La famille B',
        color: FamilyColorCodes[2],
        isUserSpace: false,
        shareUrl: '',
      },
    ]}
  />
)
