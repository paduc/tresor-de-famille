import { Rekognition } from 'aws-sdk'
import { UUID } from '../../../domain'
import { BaseDomainEvent, makeDomainEvent } from '../../../libs/eventSourcing'

type AWSDetectedFace = {
  awsFaceId: string
  faceId: UUID
  position: Rekognition.BoundingBox
  confidence: number
  details?: Rekognition.FaceDetail | undefined
}

export type AWSFacesDetectedInChatPhoto = BaseDomainEvent & {
  type: 'AWSFacesDetectedInChatPhoto'
  payload: {
    chatId: UUID
    photoId: UUID
    faces: AWSDetectedFace[]
  }
}

export const AWSFacesDetectedInChatPhoto = (payload: AWSFacesDetectedInChatPhoto['payload']): AWSFacesDetectedInChatPhoto =>
  makeDomainEvent({
    type: 'AWSFacesDetectedInChatPhoto',
    payload,
  })
