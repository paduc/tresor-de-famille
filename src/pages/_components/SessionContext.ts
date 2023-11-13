import React from 'react'
import { UUID } from '../../domain/UUID'
import { PersonId } from '../../domain/PersonId'

export type Session =
  | {
      isLoggedIn: false
    }
  | {
      isLoggedIn: true
      userName: string
      personId: PersonId | undefined
      profilePic: string | null
      isAdmin: boolean
      arePhotosEnabled: boolean
      arePersonsEnabled: boolean
      areThreadsEnabled: boolean
      isFamilyPageEnabled: boolean
      areVideosEnabled: boolean
    }

export const SessionContext = React.createContext<Session>({ isLoggedIn: false })
