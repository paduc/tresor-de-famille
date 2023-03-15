import Rekognition from 'aws-sdk/clients/rekognition'
import { postgres } from '../../../dependencies/postgres'
import { FacesRecognizedInChatPhoto } from '../recognizeFacesInChatPhoto/FacesRecognizedInChatPhoto'
import { UserUploadedPhotoToChat } from '../uploadPhotoToChat/UserUploadedPhotoToChat'

type PhotoFace = {
  details: {
    age?: { low: number; high: number }
    gender?: 'M' | 'F'
  }
} & (
  | {
      personId: null
      faceCode: string
    }
  | { personId: string; faceCode: null }
)

export const getLatestPhotoFaces = async (chatId: string): Promise<{ photoId: string; faces: PhotoFace[] } | null> => {
  const { rows: latestPhotos } = await postgres.query<UserUploadedPhotoToChat>(
    "SELECT * FROM events WHERE type='UserUploadedPhotoToChat' AND payload->>'chatId'=$1 ORDER BY occurred_at DESC LIMIT 1",
    [chatId]
  )

  if (!latestPhotos.length) {
    return null
  }

  const latestPhoto = latestPhotos[0].payload
  const { rows: latestPhotoFacesList } = await postgres.query<FacesRecognizedInChatPhoto>(
    "SELECT * FROM events WHERE type='FacesRecognizedInChatPhoto' AND payload->>'chatId'=$1 AND payload->>'photoId'=$2 ORDER BY occurred_at DESC LIMIT 1",
    [chatId, latestPhoto.photoId]
  )

  if (!latestPhotoFacesList.length) {
    return null
  }

  const latestPhotoFaces = latestPhotoFacesList[0].payload.faces

  const faces = latestPhotoFaces.map((face) =>
    face.personId
      ? {
          personId: face.personId,
          faceCode: null,
          details: {
            gender: getGender(face.details),
            age: getAge(face.details),
          },
        }
      : {
          personId: null,
          faceCode: face.AWSFaceId,
          details: {
            gender: getGender(face.details),
            age: getAge(face.details),
          },
        }
  )

  if (!faces.length) {
    return null
  }

  return {
    photoId: latestPhoto.photoId,
    faces,
  }
}

function getGender(faceDetail: Rekognition.FaceDetail | undefined): PhotoFace['details']['gender'] {
  if (!faceDetail || !faceDetail.Gender || !faceDetail.Gender.Confidence) return undefined

  if (faceDetail.Gender.Value && faceDetail.Gender.Confidence > 90) {
    return faceDetail.Gender.Value === 'Male' ? 'M' : faceDetail.Gender.Value === 'Female' ? 'F' : undefined
  }
}

function getAge(faceDetail: Rekognition.FaceDetail | undefined): PhotoFace['details']['age'] {
  if (!faceDetail || !faceDetail.AgeRange) return undefined

  return {
    low: faceDetail.AgeRange.Low!,
    high: faceDetail.AgeRange.High!,
  }
}
