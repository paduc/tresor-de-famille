import { ulid } from 'ulid'
import { ThreadId } from '../domain/ThreadId'

export const makeThreadId = (): ThreadId => {
  return ulid() as ThreadId
}
