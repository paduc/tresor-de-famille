import { ulid } from 'ulid'
import { MediaId } from '../domain/MediaId.js'

export const makeMediaId = (): MediaId => {
  return ulid() as MediaId
}
