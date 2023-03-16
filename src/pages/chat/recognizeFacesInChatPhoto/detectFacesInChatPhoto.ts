import fs from 'node:fs'
import { publish } from '../../../dependencies/eventStore'
import { UUID } from '../../../domain'
import { getAWSDetectedFacesInPhoto as getAWSDetectedFacesInPhoto } from './getAWSDetectedFacesInPhoto'
import { awsRekognitionCollectionId } from '../../../dependencies/rekognition'
import { getPersonIdForFaceId } from '../getPersonIdForFaceId.query'
import { FacesDetectedInChatPhoto } from './FacesDetectedInChatPhoto'
import sharp from 'sharp'

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

  const detectedFacesAndPersons = await Promise.all(
    detectedFaces.map(async (detectedFace) => {
      const personId = await getPersonIdForFaceId(detectedFace.AWSFaceId)

      return { ...detectedFace, personId }
    })
  )

  if (detectedFacesAndPersons.length) {
    await publish(
      FacesDetectedInChatPhoto({
        chatId,
        photoId,
        faces: detectedFacesAndPersons.map((face) => ({ ...face, faceId: face.AWSFaceId })),
      })
    )
  }
}
