import { ulid } from 'ulid'
import { FaceId } from '../domain/FaceId.js'

export const makeFaceId = (): FaceId => {
  return ulid() as FaceId
}
