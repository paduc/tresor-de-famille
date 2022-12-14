import React from 'react'

export type Session =
  | {
      isLoggedIn: false
    }
  | {
      isLoggedIn: true
      userName: string
      isAdmin: boolean
    }

export const SessionContext = React.createContext<Session>({ isLoggedIn: false })
