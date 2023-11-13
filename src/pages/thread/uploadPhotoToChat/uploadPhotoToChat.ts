import fs from 'node:fs'
import { addToHistory } from '../../../dependencies/addToHistory'
import { uploadPhoto } from '../../../dependencies/photo-storage'
import { AppUserId } from '../../../domain/AppUserId'
import { PhotoId } from '../../../domain/PhotoId'
import { ThreadId } from '../../../domain/ThreadId'
import { UserUploadedPhotoToChat } from './UserUploadedPhotoToChat'

type UploadPhotoToChatArgs = {
  file: Express.Multer.File
  photoId: PhotoId
  chatId: ThreadId
  userId: AppUserId
}
export async function uploadPhotoToChat({ file, photoId, chatId, userId }: UploadPhotoToChatArgs) {
  const { path: originalPath } = file

  const location = await uploadPhoto({ contents: fs.createReadStream(originalPath), id: photoId })

  await addToHistory(UserUploadedPhotoToChat({ chatId, photoId, location, uploadedBy: userId }))
}
