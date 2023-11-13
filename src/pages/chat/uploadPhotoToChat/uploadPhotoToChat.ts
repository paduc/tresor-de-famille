import fs from 'node:fs'
import { uploadPhoto } from '../../../dependencies/photo-storage'
import { addToHistory } from '../../../dependencies/addToHistory'
import { UserUploadedPhotoToChat } from './UserUploadedPhotoToChat'
import { UUID } from '../../../domain'
import { PhotoId } from '../../../domain/PhotoId'
import { ThreadId } from '../../../domain/ThreadId'

type UploadPhotoToChatArgs = {
  file: Express.Multer.File
  photoId: PhotoId
  chatId: ThreadId
  userId: UUID
}
export async function uploadPhotoToChat({ file, photoId, chatId, userId }: UploadPhotoToChatArgs) {
  const { path: originalPath } = file

  const location = await uploadPhoto({ contents: fs.createReadStream(originalPath), id: photoId })

  await addToHistory(UserUploadedPhotoToChat({ chatId, photoId, location, uploadedBy: userId }))
}
