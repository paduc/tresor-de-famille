import { UUID } from '../../domain'

export type RecognizedFace = {
  AWSFaceId: string
}

export const recognizeFacesInPhoto = (photoId: UUID): RecognizedFace[] => {
  return []
}
