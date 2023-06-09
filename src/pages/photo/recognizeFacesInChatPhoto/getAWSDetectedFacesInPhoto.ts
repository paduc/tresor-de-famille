import { BoundingBox } from 'aws-sdk/clients/rekognition'
import { getRekognition } from '../../../dependencies/face-recognition'

const SIMILARITY_THRESHOLD = 95

// User to detect a usable face
const SHARPNESS_THRESHOLD = 8
const CONFIDENCE_THRESHOLD = 95

export type AWSRecognizedFace = {
  awsFaceId: string
  position: BoundingBox
  confidence: number
  details?: AWS.Rekognition.FaceDetail
}

type GetDetectedFacesInPhotoArgs = {
  photoContents: Buffer
  collectionId: string
}

// TODO: inject collectionId and rekognition instance
export const getAWSDetectedFacesInPhoto = async ({
  photoContents,
  collectionId,
}: GetDetectedFacesInPhotoArgs): Promise<AWSRecognizedFace[]> => {
  const rekognition = getRekognition()

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
    // Only index faces above a certain quality
    // if (
    //   faceRecord.FaceDetail!.Quality!.Sharpness! < SHARPNESS_THRESHOLD ||
    //   faceRecord.FaceDetail!.Confidence! < CONFIDENCE_THRESHOLD
    // ) {
    //   facesToDelete.push(faceRecord.Face!.FaceId!)
    //   continue
    // }

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

  const recognizedFaces: AWSRecognizedFace[] =
    facesToReturn.map(({ Face, FaceDetail }) => {
      const { BoundingBox, FaceId, Confidence } = Face!
      return {
        awsFaceId: FaceId!,
        position: BoundingBox!,
        confidence: Confidence!,
        details: FaceDetail!,
      }
    }) || []

  return recognizedFaces
}
