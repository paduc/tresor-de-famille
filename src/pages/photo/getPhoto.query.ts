import { postgres } from '../../dependencies/database'
import { normalizeBBOX } from '../../dependencies/face-recognition'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain'
import { getPersonByIdOrThrow } from '../_getPersonById'
import { FaceIdLinkedToPerson } from '../chat/FaceIdLinkedToPerson'
import { UserUploadedPhotoToChat } from '../chat/uploadPhotoToChat/UserUploadedPhotoToChat'
import { PhotoPageProps } from './PhotoPage/PhotoPage'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto'
import { AWSDetectedFacesInPhoto } from './recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'

export const getPhoto = async (photoId: UUID): Promise<PhotoPageProps> => {
  const { rows: photoRowsRes } = await postgres.query<UserUploadedPhotoToChat>(
    "SELECT * FROM history WHERE type='UserUploadedPhotoToChat' AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" DESC",
    [photoId]
  )

  const photoRow = photoRowsRes[0]?.payload

  if (!photoRow) throw new Error('Unkown photo')

  const faceDetections = await getFaceDetections(photoId)

  for (const faceDetection of faceDetections) {
    for (const face of faceDetection.faces) {
      const personId = await getPersonIdForFaceId(face.faceId)
      if (personId) {
        const person = await getPersonByIdOrThrow(personId)
        face.person = {
          name: person.name,
        }
      }
    }
  }

  const caption = await getCaptionForPhoto(photoId)

  return {
    photoId,
    url: getPhotoUrlFromId(photoId),
    caption,
    faceDetections,
  }
}

async function getFaceDetections(photoId: UUID) {
  const { rows: faceDetectedRowsRes } = await postgres.query<AWSDetectedFacesInPhoto>(
    "SELECT * FROM history WHERE type='AWSDetectedFacesInPhoto' AND payload->>'photoId'=$1",
    [photoId]
  )

  return faceDetectedRowsRes.map(({ payload, occurredAt }) => ({
    occurredAt: occurredAt.getTime(),
    faces: payload.faces.map((awsFace) => ({
      faceId: awsFace.faceId,
      position: normalizeBBOX(awsFace.position),
      person: null as null | { name: string },
    })),
  }))
}

async function getCaptionForPhoto(photoId: UUID) {
  const { rows } = await postgres.query<UserAddedCaptionToPhoto>(
    `SELECT * FROM history WHERE type='UserAddedCaptionToPhoto' AND payload->>'photoId'=$1 ORDER BY "occurredAt" DESC LIMIT 1`,
    [photoId]
  )

  return rows[0]?.payload.caption.body
}

const getPersonIdForFaceId = async (faceId: UUID): Promise<UUID | null> => {
  const { rows } = await postgres.query<FaceIdLinkedToPerson>(
    "SELECT * FROM history WHERE type = 'FaceIdLinkedToPerson'  AND payload->>'faceId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
    [faceId]
  )

  return rows[0].payload.personId || null
}
