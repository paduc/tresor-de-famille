import { BoundingBox } from 'aws-sdk/clients/rekognition'
import { throwIfUndefined } from './env'

export const awsRekognitionCollectionId = throwIfUndefined('AWS_REKOGNITION_COLLECTION_ID', true)!

throwIfUndefined('AWS_ACCESS_KEY_ID', true)!
throwIfUndefined('AWS_SECRET_ACCESS_KEY', true)!

export const normalizeBBOX = (bbox: BoundingBox) => {
  const { Width, Height, Left, Top } = bbox

  return {
    width: Width!,
    height: Height!,
    left: Left!,
    top: Top!,
  }
}
