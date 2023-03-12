import fs from 'node:fs'
import { uploadPhoto } from '../../dependencies/uploadPhoto'
import { publish } from '../../dependencies/eventStore'
import { UserUploadedPhotoToChat } from './UserUploadedPhotoToChat'
import { UUID } from '../../domain'

type SendPhotoToChatArgs = {
  file: Express.Multer.File
  photoId: UUID
  chatId: UUID
  userId: UUID
}
export async function sendPhotoToChat({ file, photoId, chatId, userId }: SendPhotoToChatArgs) {
  const { path: originalPath } = file

  await uploadPhoto({ contents: fs.createReadStream(originalPath), id: photoId })

  await publish(UserUploadedPhotoToChat({ chatId: chatId as UUID, photoId, uploadedBy: userId }))
}
