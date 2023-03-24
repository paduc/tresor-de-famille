import aws from 'aws-sdk'
import { BoundingBox } from 'aws-sdk/clients/rekognition'
import { throwIfUndefined } from './env'

// NB: these variables are inside a getter so we can switch them later
// NB2: throwIfUndefined are meant to check env vars at startup, not during runtime

const awsRekognitionCollectionId = throwIfUndefined('AWS_REKOGNITION_COLLECTION_ID')
export const getAwsRekognitionCollectionId = () => {
  return awsRekognitionCollectionId
}

const credentials = new aws.Credentials(throwIfUndefined('AWS_ACCESS_KEY_ID'), throwIfUndefined('AWS_SECRET_ACCESS_KEY'))

const rekognition = new aws.Rekognition({ credentials, region: 'us-east-1' })
export const getRekognition = () => {
  return rekognition
}

export const normalizeBBOX = (bbox: BoundingBox) => {
  const { Width, Height, Left, Top } = bbox

  return {
    width: Width!,
    height: Height!,
    left: Left!,
    top: Top!,
  }
}
