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

  const facesToDelete = []
  for (const faceRecord of indexFacesResult.FaceRecords!) {
    const matches = await rekognition
      .searchFaces({
        CollectionId: collectionId,
        FaceId: faceRecord.Face!.FaceId!,
      })
      .promise()

    if (matches.FaceMatches!.length) {
      const bestMatchFaceId = matches.FaceMatches![0].Face!.FaceId
      facesToDelete.push(faceRecord.Face!.FaceId!)
      faceRecord.Face!.FaceId = bestMatchFaceId
    }
  }

  if (facesToDelete.length) {
    await rekognition.deleteFaces({ CollectionId: collectionId, FaceIds: facesToDelete }).promise()
  }

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
