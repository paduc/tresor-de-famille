import aws from 'aws-sdk'
import zod, { unknown } from 'zod'
import fs from 'node:fs'
import path from 'node:path'
import { UUID } from '../domain'
import { throwIfUndefined } from './env'
import { PhotoId } from '../domain/PhotoId'
import { AppUserId } from '../domain/AppUserId'

const { PHOTO_STORAGE } = zod.object({ PHOTO_STORAGE: zod.enum(['S3', 'local']) }).parse(process.env)

type PhotoLocation =
  | {
      type: 'S3'
      bucket: string
      endpoint: string
      key: string
    }
  | { type: 'localfile' }

let downloadPhoto: (photoId: PhotoId) => NodeJS.ReadableStream = downloadPhotoLocally
let uploadPhoto: (args: UploadPhotoArgs) => Promise<PhotoLocation> = uploadPhotoLocally

if (PHOTO_STORAGE === 'S3') {
  const PHOTO_ACCESS_KEY_ID = throwIfUndefined('PHOTO_ACCESS_KEY_ID')
  const PHOTO_SECRET_ACCESS_KEY = throwIfUndefined('PHOTO_SECRET_ACCESS_KEY')
  const PHOTO_ENDPOINT = throwIfUndefined('PHOTO_ENDPOINT')
  const PHOTO_BUCKET = throwIfUndefined('PHOTO_BUCKET')

  const credentials = new aws.Credentials(PHOTO_ACCESS_KEY_ID, PHOTO_SECRET_ACCESS_KEY)

  const s3client = new aws.S3({ credentials, endpoint: PHOTO_ENDPOINT })

  downloadPhoto = (photoId: PhotoId) => {
    return s3client.getObject({ Bucket: PHOTO_BUCKET, Key: photoId }).createReadStream()
  }

  uploadPhoto = async ({ contents, id }: UploadPhotoArgs) => {
    await s3client.upload({ Bucket: PHOTO_BUCKET, Key: id, Body: contents }).promise()

    return {
      type: 'S3',
      bucket: PHOTO_BUCKET,
      endpoint: PHOTO_ENDPOINT,
      key: id,
    }
  }
}

export { downloadPhoto, uploadPhoto }

const localFilePath = (photoId: PhotoId) => path.join(__dirname, '../../temp/photos', photoId)

function downloadPhotoLocally(photoId: PhotoId) {
  return fs.createReadStream(localFilePath(photoId))
}

type UploadPhotoArgs = {
  contents: NodeJS.ReadableStream
  id: PhotoId
}
async function uploadPhotoLocally({ contents, id }: UploadPhotoArgs) {
  const filePath = localFilePath(id)
  await new Promise((resolve, reject) => {
    const uploadWriteStream = fs.createWriteStream(filePath, {
      autoClose: true,
    })
    uploadWriteStream.on('error', reject)
    uploadWriteStream.on('close', resolve)
    contents.pipe(uploadWriteStream)
  })

  return { type: 'localfile' as const }
}

export const getPhotoUrlFromId = (photoId: PhotoId) => {
  return '/photos/' + photoId
}
