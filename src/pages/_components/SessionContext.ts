import React from 'react'
import { PersonId } from '../../domain/PersonId'
import { FamilyId } from '../../domain/FamilyId'
import { AppUserId } from '../../domain/AppUserId'

export type Session =
  | { isSharingEnabled: boolean } & (
      | {
          isLoggedIn: false
        }
      | {
          isLoggedIn: true
          userName: string
          userId: AppUserId
          personId: PersonId | undefined
          profilePic: string | null
          userFamilies: {
            familyName: string
            about: string
            familyId: FamilyId
          }[]
          currentFamilyId: FamilyId
          isAdmin: boolean
          arePhotosEnabled: boolean
          arePersonsEnabled: boolean
          areThreadsEnabled: boolean
          isFamilyPageEnabled: boolean
          areVideosEnabled: boolean
        }
    )

export const SessionContext = React.createContext<Session>({ isLoggedIn: false, isSharingEnabled: false })
