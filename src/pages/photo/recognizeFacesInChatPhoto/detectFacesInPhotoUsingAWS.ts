import fs from 'node:fs'
import sharp from 'sharp'
import { addToHistory } from '../../../dependencies/addToHistory'
import { postgres } from '../../../dependencies/database'
import { UUID } from '../../../domain'
import { getUuid } from '../../../libs/getUuid'
import { AWSDetectedFacesInPhoto } from './AWSDetectedFacesInPhoto'
import { getAWSDetectedFacesInPhoto } from './getAWSDetectedFacesInPhoto'
import { getAwsRekognitionCollectionId } from '../../../dependencies/face-recognition'

type DetectFacesInChatPhotoArgs = {
  file: Express.Multer.File
  chatId: UUID
  photoId: UUID
}
export async function detectFacesInPhotoUsingAWS({ file, photoId }: DetectFacesInChatPhotoArgs) {
  const { path: originalPath } = file
  const compressedFilePath = originalPath + '-compressed.jpeg'
  await sharp(originalPath).jpeg({ quality: 30 }).toFile(compressedFilePath)

  const awsDetectedFaces = await getAWSDetectedFacesInPhoto({
    photoContents: fs.readFileSync(compressedFilePath),
    collectionId: getAwsRekognitionCollectionId(),
  })

  if (awsDetectedFaces.length) {
    const faces: AWSDetectedFacesInPhoto['payload']['faces'] = []
    for (const awsFace of awsDetectedFaces) {
      const faceId = (await getFaceIdForAWSFaceId(awsFace.awsFaceId)) || getUuid()
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
}

async function getFaceIdForAWSFaceId(awsFaceId: string): Promise<UUID | undefined> {
  const { rows } = await postgres.query<AWSDetectedFacesInPhoto>("SELECT * FROM history WHERE type='AWSDetectedFacesInPhoto'")

  // Create a AWSFaceId - faceId index
  const awsFaceIdIndex = new Map<string, UUID>()
  for (const row of rows) {
    for (const face of row.payload.faces) {
      awsFaceIdIndex.set(face.awsFaceId, face.faceId)
    }
  }

  // If we cant find it in the index, create a new one
  return awsFaceIdIndex.get(awsFaceId)
}
