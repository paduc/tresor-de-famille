import { ulid } from 'ulid'
import { PhotoId } from '../domain/PhotoId'

export const makePhotoId = (): PhotoId => {
  return ulid() as PhotoId
}
