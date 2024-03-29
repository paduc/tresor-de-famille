import session from 'express-session'
import { User } from '../domain/User.js'
import { FamilyId } from '../domain/FamilyId.js'

declare module 'express-session' {
  export interface SessionData {
    user: User
    isOnboarding: boolean
  }
}
