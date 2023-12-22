import React, { useContext } from 'react'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'

export type Session =
  | { isSharingEnabled: boolean } & (
      | {
          isLoggedIn: false
        }
      | {
          isLoggedIn: true
          userName: string
          userId: AppUserId
          profilePic: string | null
          userFamilies: {
            familyName: string
            about: string
            familyId: FamilyId
            isUserSpace: boolean
            color: string
            shareUrl: string
          }[]
          hasFamiliesOtherThanDefault: boolean
          hasCreatedFamilies: boolean
          searchKey: string
          isAdmin: boolean
          arePhotosEnabled: boolean
          arePersonsEnabled: boolean
          areThreadsEnabled: boolean
          isFamilyPageEnabled: boolean
          areVideosEnabled: boolean
          isOnboarding: boolean
        }
    )

export const SessionContext = React.createContext<Session | undefined>(undefined)

export const useSession = () => {
  const session = useContext(SessionContext)

  if (!session) {
    throw new Error('useSession can only be used in a SessionContext Provider')
  }

  return session
}

export const useLoggedInSession = () => {
  const session = useSession()

  if (!session.isLoggedIn) {
    throw new Error('Available only for logged in users')
  }

  return session
}
