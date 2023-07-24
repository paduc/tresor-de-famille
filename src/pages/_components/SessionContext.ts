import React from 'react'

export type Session =
  | {
      isLoggedIn: false
    }
  | {
      isLoggedIn: true
      userName: string
      profilePic: string | null
      isAdmin: boolean
      arePhotosEnabled: boolean
      areThreadsEnabled: boolean
      areVideosEnabled: boolean
    }

export const SessionContext = React.createContext<Session>({ isLoggedIn: false })
