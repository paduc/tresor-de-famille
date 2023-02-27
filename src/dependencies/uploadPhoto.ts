import fs from 'node:fs'
import path from 'node:path'

export type UploadPhotoArgs = {
  contents: NodeJS.ReadableStream
  id: string
}

export const localFilePath = (photoId: string) => path.join(__dirname, '../../temp/photos', photoId)

const uploadPhotoLocally = async ({ contents, id }: UploadPhotoArgs) => {
  const filePath = localFilePath(id)
  return new Promise((resolve, reject) => {
    const uploadWriteStream = fs.createWriteStream(filePath, {
      autoClose: true,
    })
    uploadWriteStream.on('error', reject)
    uploadWriteStream.on('close', resolve)
    contents.pipe(uploadWriteStream)
  })
}

export const uploadPhoto = uploadPhotoLocally

export const getPhotoUrlFromId = (photoId: string) => {
  return '/photos/' + photoId
}
