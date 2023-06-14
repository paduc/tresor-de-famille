import { postgres } from '../../dependencies/database'
import { normalizeBBOX } from '../../dependencies/face-recognition'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain'
import { getPersonByIdOrThrow } from '../_getPersonById'
import { UserUploadedPhotoToChat } from '../chat/uploadPhotoToChat/UserUploadedPhotoToChat'
import { PhotoPageProps } from './PhotoPage/PhotoPage'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto'
import { PhotoAnnotatedUsingOpenAI } from './annotatePhotoUsingOpenAI/PhotoAnnotatedUsingOpenAI'
import { PhotoAnnotationConfirmed } from './confirmPhotoAnnotation/PhotoAnnotationConfirmed'
import { AWSDetectedFacesInPhoto } from './recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'

export const getPhoto = async (photoId: UUID): Promise<PhotoPageProps> => {
  const { rows: photoRowsRes } = await postgres.query<UserUploadedPhotoToChat>(
    "SELECT * FROM history WHERE type='UserUploadedPhotoToChat' AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
    [photoId]
  )

  const photoRow = photoRowsRes[0]?.payload

  if (!photoRow) throw new Error('Unkown photo')

  const caption = await getCaptionForPhoto(photoId)

  const annotationEvents = await getAnnotationEvents(photoId)

  const personsByFaceId = await makePersonsByFacedId(annotationEvents)
  const personById = await makePersonById(annotationEvents)

  return {
    photoId,
    url: getPhotoUrlFromId(photoId),
    caption,
    personsByFaceId,
    personById,
    annotationEvents,
  }
}

async function makePersonById(
  annotationEvents: (UserAddedCaptionToPhoto | AWSDetectedFacesInPhoto | PhotoAnnotatedUsingOpenAI)[]
) {
  const personById: PhotoPageProps['personById'] = {}
  const personIds = annotationEvents
    .filter((event): event is PhotoAnnotatedUsingOpenAI => event.type === 'PhotoAnnotatedUsingOpenAI')
    .flatMap((event) => event.payload.deductions.map((d) => d.personId))

  for (const personId of personIds) {
    const person = await getPersonByIdOrThrow(personId)
    personById[personId] = {
      name: person.name,
    }
  }

  return personById
}

async function makePersonsByFacedId(
  annotationEvents: (UserAddedCaptionToPhoto | PhotoAnnotatedUsingOpenAI | AWSDetectedFacesInPhoto)[]
) {
  const personsByFaceId: PhotoPageProps['personsByFaceId'] = {}
  const recognizedFaces = annotationEvents
    .filter((event): event is AWSDetectedFacesInPhoto => event.type === 'AWSDetectedFacesInPhoto')
    .flatMap((event) => event.payload.faces)

  for (const face of recognizedFaces) {
    const personIds = await getPersonIdsForFaceId(face.faceId)

    for (const personId of personIds) {
      const person = await getPersonByIdOrThrow(personId)
      personsByFaceId[face.faceId] = [
        ...(personsByFaceId[face.faceId] || []),
        {
          personId,
          name: person.name,
        },
      ]
    }
  }
  return personsByFaceId
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

const getPersonIdsForFaceId = async (faceId: UUID): Promise<UUID[]> => {
  const { rows } = await postgres.query<PhotoAnnotationConfirmed>(
    "SELECT * FROM history WHERE type = 'PhotoAnnotationConfirmed'  AND payload->>'faceId'=$1",
    [faceId]
  )

  return rows.map((row) => row.payload.personId)
}

const getAnnotationEvents = async (photoId: UUID) => {
  const { rows } = await postgres.query<AWSDetectedFacesInPhoto | UserAddedCaptionToPhoto | PhotoAnnotatedUsingOpenAI>(
    "SELECT * FROM history WHERE type IN ('AWSDetectedFacesInPhoto', 'UserAddedCaptionToPhoto','PhotoAnnotatedUsingOpenAI') AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" ASC",
    [photoId]
  )
  return rows
}
