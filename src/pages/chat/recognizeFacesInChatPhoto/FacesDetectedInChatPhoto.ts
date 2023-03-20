import { Rekognition } from 'aws-sdk'
import { UUID } from '../../../domain'
import { BaseDomainEvent, makeDomainEvent } from '../../../libs/eventSourcing'

type DetectedFace = {
  faceId: UUID
  position: Rekognition.BoundingBox
  confidence: number
  details?: Rekognition.FaceDetail | undefined
}

export type FacesDetectedInChatPhoto = BaseDomainEvent & {
  type: 'FacesDetectedInChatPhoto'
  payload: {
    chatId: UUID
    photoId: UUID
    faces: DetectedFace[]
  }
}

export const FacesDetectedInChatPhoto = (payload: FacesDetectedInChatPhoto['payload']): FacesDetectedInChatPhoto =>
  makeDomainEvent({
    type: 'FacesDetectedInChatPhoto',
    payload,
  })
