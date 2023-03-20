import fs from 'node:fs'
import path from 'node:path'
import { UUID } from '../domain'

export type UploadPhotoArgs = {
  contents: NodeJS.ReadableStream
  id: UUID
}

export const localFilePath = (photoId: UUID) => path.join(__dirname, '../../temp/photos', photoId)

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

export const getPhotoUrlFromId = (photoId: UUID) => {
  return '/photos/' + photoId
}

export const getProfilePicUrlForUser = (userId: UUID) => {
  return 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'
}
