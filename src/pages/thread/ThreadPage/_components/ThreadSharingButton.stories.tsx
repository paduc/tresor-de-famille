import * as React from 'react'
import { SessionContext } from '../../../_components/SessionContext.js'

import { ShareWithMultipleFamilyModal } from './ThreadSharingButton.js'

import { SearchIndex } from 'algoliasearch/lite'
import { AppUserId } from '../../../../domain/AppUserId.js'
import { FamilyId } from '../../../../domain/FamilyId.js'
import { makeFamilyId } from '../../../../libs/makeFamilyId.js'
import { makeAppUserId } from '../../../../libs/makeUserId.js'
import { FamilyColorCodes } from '../../../../libs/ssr/FamilyColorCodes.js'
import { LocationContext } from '../../../_components/LocationContext.js'
import { PersonSearchContext } from '../../../_components/usePersonSearch.js'

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
    latestUserFamilies={[
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
    ]}
  />
)
