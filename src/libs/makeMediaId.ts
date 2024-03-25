import { ulid } from 'ulid'
import { MediaId } from '../domain/MediaId'

export const makeMediaId = (): MediaId => {
  return ulid() as MediaId
}
