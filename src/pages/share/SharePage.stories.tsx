import * as React from 'react'
import { SessionContext } from '../_components/SessionContext'
import { SharePage } from './SharePage'
import { makePersonId } from '../../libs/makePersonId'

export default { title: 'Partage', component: SharePage, parameters: { layout: 'fullscreen' } }

export const PageVide = () => (
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
    <SharePage />
  </SessionContext.Provider>
)
