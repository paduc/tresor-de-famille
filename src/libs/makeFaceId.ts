import { ulid } from 'ulid'
import { FaceId } from '../domain/FaceId'

export const makeFaceId = (): FaceId => {
  return ulid() as FaceId
}
