import { ulid } from 'ulid'
import { AppUserId } from '../domain/AppUserId'

export const makeAppUserId = (): AppUserId => {
  return ulid() as AppUserId
}
