import * as React from 'react'
import { AppUserId } from '../../domain/AppUserId'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { makePersonId } from '../../libs/makePersonId'
import { FamilySwitcher } from '../_components/FamilySwitcher'
import { SessionContext } from '../_components/SessionContext'

export default {
  title: 'Switch de Famille',
  component: FamilySwitcher,
  parameters: { layout: 'fullscreen' },
}

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
          about: 'Les descendants de Papa Henri et leurs conjoint',
        },
        {
          familyId: makeFamilyId(),
          familyName: 'Duchateau Louis Family Duchateau Louis Family Duchateau Louis Family Duchateau Louis Family',
          about: 'Les descendants de Louis Duchateau et leurs conjoint',
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
    <div className='p-24'>
      <FamilySwitcher />
    </div>
  </SessionContext.Provider>
)
