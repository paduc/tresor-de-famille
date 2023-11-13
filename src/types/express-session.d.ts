import session from 'express-session'
import { User } from '../domain/User'
import { FamilyId } from '../domain/FamilyId'

declare module 'express-session' {
  export interface SessionData {
    user: User
    searchKey: string
    currentFamilyId: FamilyId
  }
}
