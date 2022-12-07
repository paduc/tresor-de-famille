import { ulid } from 'ulid'
import { UUID } from '../domain'

export const getUuid = (): UUID => {
  return ulid() as UUID
}
