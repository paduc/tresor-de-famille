import { ulid } from 'ulid'
import type { UUID } from '../domain'

export const getUuid = (): UUID => {
  return ulid() as UUID
}
