import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/addToHistory'

type AWSBoundingBox = {
  /**
   * Width of the bounding box as a ratio of the overall image width.
   */
  Width?: number
  /**
   * Height of the bounding box as a ratio of the overall image height.
   */
  Height?: number
  /**
   * Left coordinate of the bounding box as a ratio of overall image width.
   */
  Left?: number
  /**
   * Top coordinate of the bounding box as a ratio of overall image height.
   */
  Top?: number
}

type AWSDetectedFace = {
  awsFaceId: string
  faceId: UUID
  position: AWSBoundingBox
  confidence: number
  // See more in Rekognition.FaceDetail
  details?: {
    /**
     * The estimated age range, in years, for the face. Low represents the lowest estimated age and High represents the highest estimated age.
     */
    AgeRange?: {
      /**
       * The lowest estimated age.
       */
      Low?: number
      /**
       * The highest estimated age.
       */
      High?: number
    }
    /**
     * The predicted gender of a detected face.
     */
    Gender?: {
      /**
       * The predicted gender of the face.
       */
      Value?: 'Male' | 'Female' | string
      /**
       * Level of confidence in the prediction (0 to 1)
       */
      Confidence?: number
    }
  }
}

export type AWSFacesDetectedInChatPhoto = DomainEvent<
  'AWSFacesDetectedInChatPhoto',
  {
    chatId: UUID
    photoId: UUID
    faces: AWSDetectedFace[]
  }
>

export const AWSFacesDetectedInChatPhoto = makeDomainEvent<AWSFacesDetectedInChatPhoto>('AWSFacesDetectedInChatPhoto')
