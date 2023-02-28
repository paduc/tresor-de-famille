import { UUID } from '../../domain'
import aws from 'aws-sdk'
import { BoundingBox } from 'aws-sdk/clients/rekognition'
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'us-east-1',
})

const rekognition = new aws.Rekognition()

export type RecognizedFace = {
  AWSFaceId: string
  position: BoundingBox
  confidence: number
}

type RecognizeFacesInPhotoArgs = {
  photoContents: Buffer
  collectionId: string
}

export const recognizeFacesInPhoto = async ({
  photoContents,
  collectionId,
}: RecognizeFacesInPhotoArgs): Promise<RecognizedFace[]> => {
  const indexFacesResult = await rekognition
    .indexFaces({
      CollectionId: collectionId,
      DetectionAttributes: [],
      Image: {
        Bytes: photoContents,
      },
    })
    .promise()

  const recognizedFaces: RecognizedFace[] =
    indexFacesResult.FaceRecords?.map(({ Face }) => {
      const { BoundingBox, FaceId, Confidence } = Face!
      return {
        AWSFaceId: FaceId!,
        position: BoundingBox!,
        confidence: Confidence!,
      }
    }) || []

  return recognizedFaces
}
