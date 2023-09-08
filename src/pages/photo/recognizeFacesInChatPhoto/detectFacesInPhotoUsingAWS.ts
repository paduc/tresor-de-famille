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

type DetectFacesInPhotosUsingAWSArgs = {
  file: Express.Multer.File
  photoId: UUID
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
      getUuid()

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

async function getFaceIdForAWSFaceIdInOtherPhotos(awsFaceId: string, userId: UUID): Promise<UUID | undefined> {
  const { rows } = await postgres.query<AWSDetectedFacesInPhoto>("SELECT * FROM history WHERE type='AWSDetectedFacesInPhoto'")

  // Create a AWSFaceId - faceId index for the given userId
  const awsFaceIdIndex = new Map<string, UUID>()
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

async function getOwnerUserIdForPhotoId(photoId: UUID): Promise<UUID | undefined> {
  const { rows } = await postgres.query<
    UserUploadedPhotoToChat | OnboardingUserUploadedPhotoOfThemself | OnboardingUserUploadedPhotoOfFamily
  >(
    "SELECT * FROM history WHERE type IN ('UserUploadedPhotoToChat','OnboardingUserUploadedPhotoOfThemself','OnboardingUserUploadedPhotoOfFamily') AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
    [photoId]
  )

  if (!rows.length) return

  return rows[0].payload.uploadedBy
}
