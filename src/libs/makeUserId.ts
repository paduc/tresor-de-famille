import { ulid } from 'ulid'
import { AppUserId } from '../domain/AppUserId.js'

export const makeAppUserId = (): AppUserId => {
  return ulid() as AppUserId
}
