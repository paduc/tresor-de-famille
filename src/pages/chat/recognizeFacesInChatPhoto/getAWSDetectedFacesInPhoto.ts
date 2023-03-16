import aws from 'aws-sdk'
import { BoundingBox } from 'aws-sdk/clients/rekognition'

// TODO: move this to /dependencies
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'us-east-1',
})

const rekognition = new aws.Rekognition()

const SIMILARITY_THRESHOLD = 95

// User to detect a usable face
const SHARPNESS_THRESHOLD = 8
const CONFIDENCE_THRESHOLD = 95

export type RecognizedFace = {
  AWSFaceId: string
  position: BoundingBox
  confidence: number
  details?: aws.Rekognition.FaceDetail
}

type GetDetectedFacesInPhotoArgs = {
  photoContents: Buffer
  collectionId: string
}

// TODO: inject collectionId and rekognition instance
export const getAWSDetectedFacesInPhoto = async ({
  photoContents,
  collectionId,
}: GetDetectedFacesInPhotoArgs): Promise<RecognizedFace[]> => {
  const indexFacesResult = await rekognition
    .indexFaces({
      CollectionId: collectionId,
      DetectionAttributes: ['ALL'],
      Image: {
        Bytes: photoContents,
      },
    })
    .promise()

  const facesToDelete = []
  const facesToReturn = []

  for (const faceRecord of indexFacesResult.FaceRecords!) {
    if (
      faceRecord.FaceDetail!.Quality!.Sharpness! < SHARPNESS_THRESHOLD ||
      faceRecord.FaceDetail!.Confidence! < CONFIDENCE_THRESHOLD
    ) {
      facesToDelete.push(faceRecord.Face!.FaceId!)
      continue
    }

    const matches = await rekognition
      .searchFaces({
        CollectionId: collectionId,
        FaceId: faceRecord.Face!.FaceId!,
      })
      .promise()

    if (matches.FaceMatches!.length && matches.FaceMatches![0].Similarity! > SIMILARITY_THRESHOLD) {
      const bestMatchFaceId = matches.FaceMatches![0].Face!.FaceId
      facesToDelete.push(faceRecord.Face!.FaceId!)
      faceRecord.Face!.FaceId = bestMatchFaceId
    }

    facesToReturn.push(faceRecord)
  }

  if (facesToDelete.length) {
    await rekognition.deleteFaces({ CollectionId: collectionId, FaceIds: facesToDelete }).promise()
  }

  const recognizedFaces: RecognizedFace[] =
    facesToReturn.map(({ Face, FaceDetail }) => {
      const { BoundingBox, FaceId, Confidence } = Face!
      return {
        AWSFaceId: FaceId!,
        position: BoundingBox!,
        confidence: Confidence!,
        details: FaceDetail!,
      }
    }) || []

  return recognizedFaces
}
