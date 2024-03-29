import { ulid } from 'ulid'
import { PersonId } from '../domain/PersonId.js'

export const makePersonId = (): PersonId => {
  return ulid() as PersonId
}
