import { ulid } from 'ulid'
import { PersonId } from '../domain/PersonId'

export const makePersonId = (): PersonId => {
  return ulid() as PersonId
}
