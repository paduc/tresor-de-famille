import { ulid } from 'ulid'
import { ThreadId } from '../domain/ThreadId.js'

export const makeThreadId = (): ThreadId => {
  return ulid() as ThreadId
}
