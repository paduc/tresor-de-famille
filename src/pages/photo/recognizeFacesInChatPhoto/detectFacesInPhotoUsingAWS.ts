import fs from 'node:fs'
import sharp from 'sharp'
import { addToHistory } from '../../../dependencies/addToHistory'
import { postgres } from '../../../dependencies/database'
import { UUID } from '../../../domain'
import { getUuid } from '../../../libs/getUuid'
import { AWSDetectedFacesInPhoto } from './AWSDetectedFacesInPhoto'
import { getAWSDetectedFacesInPhoto } from './getAWSDetectedFacesInPhoto'
import { getAwsRekognitionCollectionId } from '../../../dependencies/face-recognition'
import { UserUploadedPhotoToChat } from '../../chat/uploadPhotoToChat/UserUploadedPhotoToChat'
import { OnboardingUserUploadedPhotoOfThemself } from '../../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { OnboardingUserUploadedPhotoOfFamily } from '../../../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { UserInsertedPhotoInRichTextThread } from '../../chat/UserInsertedPhotoInRichTextThread'
import { getSingleEvent } from '../../../dependencies/getSingleEvent'
import { FaceId } from '../../../domain/FaceId'
import { makeFaceId } from '../../../libs/makeFaceId'
import { PhotoId } from '../../../domain/PhotoId'

type DetectFacesInPhotosUsingAWSArgs = {
  file: Express.Multer.File
  photoId: PhotoId
}
export async function detectFacesInPhotoUsingAWS({ file, photoId }: DetectFacesInPhotosUsingAWSArgs) {
  const { path: originalPath } = file
  const compressedFilePath = originalPath + '-compressed.jpeg'
  await sharp(originalPath).jpeg({ quality: 30 }).toFile(compressedFilePath)

  const awsDetectedFaces = await getAWSDetectedFacesInPhoto({
    photoContents: fs.readFileSync(compressedFilePath),
    collectionId: getAwsRekognitionCollectionId(),
  })

  const ownerUserId = await getOwnerUserIdForPhotoId(photoId)
  if (!ownerUserId) {
    console.error('detectFacesInPhotoUsingAWS for a photoId without owner')
    return
  }

  if (!awsDetectedFaces.length) {
    return
  }

  const faces: AWSDetectedFacesInPhoto['payload']['faces'] = []

  function findFaceInPhotoWithSameAwsFaceId(awsFaceId: string) {
    const faceWithSameAwsFaceId = faces.find((face) => face.awsFaceId === awsFaceId)

    return faceWithSameAwsFaceId?.faceId
  }

  for (const awsFace of awsDetectedFaces) {
    const faceId =
      findFaceInPhotoWithSameAwsFaceId(awsFace.awsFaceId) ||
      (await getFaceIdForAWSFaceIdInOtherPhotos(awsFace.awsFaceId, ownerUserId)) ||
      makeFaceId()

    faces.push({
      ...awsFace,
      faceId,
    })
  }
  await addToHistory(
    AWSDetectedFacesInPhoto({
      photoId,
      faces,
    })
  )
}

async function getFaceIdForAWSFaceIdInOtherPhotos(awsFaceId: string, userId: UUID): Promise<FaceId | undefined> {
  const { rows } = await postgres.query<AWSDetectedFacesInPhoto>("SELECT * FROM history WHERE type='AWSDetectedFacesInPhoto'")

  // Create a AWSFaceId - faceId index for the given userId
  const awsFaceIdIndex = new Map<string, FaceId>()
  for (const row of rows) {
    const photoUserId = await getOwnerUserIdForPhotoId(row.payload.photoId)
    if (photoUserId && photoUserId === userId) {
      for (const face of row.payload.faces) {
        awsFaceIdIndex.set(face.awsFaceId, face.faceId)
      }
    }
  }

  return awsFaceIdIndex.get(awsFaceId)
}

async function getOwnerUserIdForPhotoId(photoId: PhotoId): Promise<UUID | undefined> {
  const latestForPhoto = await getSingleEvent<
    | UserUploadedPhotoToChat
    | OnboardingUserUploadedPhotoOfThemself
    | OnboardingUserUploadedPhotoOfFamily
    | UserInsertedPhotoInRichTextThread
  >(
    [
      'UserInsertedPhotoInRichTextThread',
      'OnboardingUserUploadedPhotoOfFamily',
      'OnboardingUserUploadedPhotoOfThemself',
      'UserUploadedPhotoToChat',
    ],
    { photoId }
  )

  if (!latestForPhoto) return

  if (latestForPhoto.type === 'UserInsertedPhotoInRichTextThread') {
    return latestForPhoto.payload.userId
  }
  return latestForPhoto.payload.uploadedBy
}
