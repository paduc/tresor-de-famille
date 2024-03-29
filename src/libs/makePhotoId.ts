import { ulid } from 'ulid'
import { PhotoId } from '../domain/PhotoId.js'

export const makePhotoId = (): PhotoId => {
  return ulid() as PhotoId
}
