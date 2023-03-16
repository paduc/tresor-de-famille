import fs from 'node:fs'
import sharp from 'sharp'
import { publish } from '../../../dependencies/eventStore'
import { awsRekognitionCollectionId } from '../../../dependencies/rekognition'
import { UUID } from '../../../domain'
import { FacesDetectedInChatPhoto } from './FacesDetectedInChatPhoto'
import { getAWSDetectedFacesInPhoto } from './getAWSDetectedFacesInPhoto'

type DetectFacesInChatPhotoArgs = {
  file: Express.Multer.File
  chatId: UUID
  photoId: UUID
}
export async function detectFacesInChatPhoto({ file, chatId, photoId }: DetectFacesInChatPhotoArgs) {
  const { path: originalPath } = file
  const compressedFilePath = originalPath + '-compressed.jpeg'
  await sharp(originalPath).jpeg({ quality: 30 }).toFile(compressedFilePath)

  const detectedFaces = await getAWSDetectedFacesInPhoto({
    photoContents: fs.readFileSync(compressedFilePath),
    collectionId: awsRekognitionCollectionId,
  })

  if (detectedFaces.length) {
    await publish(
      FacesDetectedInChatPhoto({
        chatId,
        photoId,
        faces: detectedFaces,
      })
    )
  }
}
