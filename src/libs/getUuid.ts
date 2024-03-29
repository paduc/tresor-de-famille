import { ulid } from 'ulid'
import type { UUID } from '../domain/UUID.js'

export const getUuid = (): UUID => {
  return ulid() as UUID
}
