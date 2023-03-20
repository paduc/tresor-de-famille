import fs from 'node:fs'
import sharp from 'sharp'
import { publish } from '../../../dependencies/eventStore'
import { postgres } from '../../../dependencies/postgres'
import { awsRekognitionCollectionId } from '../../../dependencies/rekognition'
import { UUID } from '../../../domain'
import { getUuid } from '../../../libs/getUuid'
import { AWSFacesDetectedInChatPhoto } from './AWSFacesDetectedInChatPhoto'
import { getAWSDetectedFacesInPhoto } from './getAWSDetectedFacesInPhoto'

type DetectFacesInChatPhotoArgs = {
  file: Express.Multer.File
  chatId: UUID
  photoId: UUID
}
export async function detectAWSFacesInChatPhoto({ file, chatId, photoId }: DetectFacesInChatPhotoArgs) {
  const { path: originalPath } = file
  const compressedFilePath = originalPath + '-compressed.jpeg'
  await sharp(originalPath).jpeg({ quality: 30 }).toFile(compressedFilePath)

  const awsDetectedFaces = await getAWSDetectedFacesInPhoto({
    photoContents: fs.readFileSync(compressedFilePath),
    collectionId: awsRekognitionCollectionId,
  })

  if (awsDetectedFaces.length) {
    const faces: AWSFacesDetectedInChatPhoto['payload']['faces'] = []
    for (const awsFace of awsDetectedFaces) {
      const faceId = await getFaceIdForAWSFaceId(awsFace.awsFaceId)
      faces.push({
        ...awsFace,
        faceId,
      })
    }
    await publish(
      AWSFacesDetectedInChatPhoto({
        chatId,
        photoId,
        faces,
      })
    )
  }
}

async function getFaceIdForAWSFaceId(awsFaceId: string): Promise<UUID> {
  const { rows } = await postgres.query<AWSFacesDetectedInChatPhoto>(
    "SELECT * FROM events WHERE type='AWSFacesDetectedInChatPhoto'",
    []
  )

  const awsFaceIdIndex = new Map<string, UUID>()

  for (const row of rows) {
    for (const face of row.payload.faces) {
      awsFaceIdIndex.set(face.awsFaceId, face.faceId)
    }
  }

  // If we cant find it in the index, create a new one
  return awsFaceIdIndex.get(awsFaceId) || getUuid()
}
