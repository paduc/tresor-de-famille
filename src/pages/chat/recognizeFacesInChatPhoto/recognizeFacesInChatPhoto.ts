import fs from 'node:fs'
import { publish } from '../../../dependencies/eventStore'
import { UUID } from '../../../domain'
import { getDetectedFacesInPhoto as getDetectedFacesInPhoto } from './getDetectedFacesInPhoto'
import { awsRekognitionCollectionId } from '../../../dependencies/rekognition'
import { getPersonIdForFaceId } from '../getPersonIdForFaceId.query'
import { FacesRecognizedInChatPhoto } from '../FacesRecognizedInChatPhoto'
import sharp from 'sharp'

type RecognizeFacesInChatPhotoArgs = {
  file: Express.Multer.File
  chatId: UUID
  photoId: UUID
}
export async function recognizeFacesInChatPhoto({ file, chatId, photoId }: RecognizeFacesInChatPhotoArgs) {
  const { path: originalPath } = file
  const compressedFilePath = originalPath + '-compressed.jpeg'
  await sharp(originalPath).jpeg({ quality: 30 }).toFile(compressedFilePath)

  const detectedFaces = await getDetectedFacesInPhoto({
    photoContents: fs.readFileSync(compressedFilePath),
    collectionId: awsRekognitionCollectionId,
  })

  const detectedFacesAndPersons = await Promise.all(
    detectedFaces.map(async (detectedFace) => {
      const personId = await getPersonIdForFaceId(detectedFace.AWSFaceId)

      return { ...detectedFace, personId }
    })
  )

  if (detectedFacesAndPersons.length) {
    await publish(
      FacesRecognizedInChatPhoto({
        chatId,
        photoId,
        faces: detectedFacesAndPersons,
      })
    )
  }
}
