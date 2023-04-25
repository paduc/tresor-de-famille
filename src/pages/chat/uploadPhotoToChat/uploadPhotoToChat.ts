import fs from 'node:fs'
import { uploadPhoto } from '../../../dependencies/photo-storage'
import { addToHistory } from '../../../dependencies/addToHistory'
import { UserUploadedPhotoToChat } from './UserUploadedPhotoToChat'
import { UUID } from '../../../domain'

type UploadPhotoToChatArgs = {
  file: Express.Multer.File
  photoId: UUID
  chatId: UUID
  userId: UUID
}
export async function uploadPhotoToChat({ file, photoId, chatId, userId }: UploadPhotoToChatArgs) {
  const { path: originalPath } = file

  await uploadPhoto({ contents: fs.createReadStream(originalPath), id: photoId })

  await addToHistory(UserUploadedPhotoToChat({ chatId: chatId as UUID, photoId, uploadedBy: userId }))
}
