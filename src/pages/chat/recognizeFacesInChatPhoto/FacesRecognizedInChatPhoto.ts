import { Rekognition } from 'aws-sdk'
import { UUID } from '../../../domain'
import { BaseDomainEvent, makeDomainEvent } from '../../../libs/eventSourcing'

type DetectedFace = {
  personId: string | null
  AWSFaceId: string
  position: Rekognition.BoundingBox
  confidence: number
  details?: Rekognition.FaceDetail | undefined
}

export type FacesRecognizedInChatPhoto = BaseDomainEvent & {
  type: 'FacesRecognizedInChatPhoto'
  payload: {
    chatId: UUID
    photoId: UUID
    faces: DetectedFace[]
  }
}

export const FacesRecognizedInChatPhoto = (payload: FacesRecognizedInChatPhoto['payload']): FacesRecognizedInChatPhoto =>
  makeDomainEvent({
    type: 'FacesRecognizedInChatPhoto',
    payload,
  })
