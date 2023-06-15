import { postgres } from '../../../dependencies/database'
import { getPhotoUrlFromId } from '../../../dependencies/photo-storage'
import { UUID } from '../../../domain'
import { ChatEvent } from '../ChatPage/ChatPage'
import { AWSDetectedFacesInPhoto } from '../../photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { UserUploadedPhotoToChat } from '../uploadPhotoToChat/UserUploadedPhotoToChat'
import { PhotoAnnotationConfirmed } from '../../photo/confirmPhotoAnnotation/PhotoAnnotationConfirmed'
import { getPersonById } from '../../_getPersonById'

export type ChatPhotoEvent = ChatEvent & { type: 'photo' }
export async function retrievePhotosForChat(chatId: UUID): Promise<ChatPhotoEvent[]> {
  const photoRows = await getPhotoRows(chatId)

  const photoEvents: ChatPhotoEvent[] = []

  for (const { occurredAt, payload } of photoRows) {
    const { photoId } = payload

    const detectedFaceIds = await getDetectedFacesIds(photoId)
    const confirmedPersons = await getConfirmedPersons(photoId)

    const unconfirmedFaceIds = new Set(detectedFaceIds)
    const personsInPhoto: string[] = []

    for (const confirmedPerson of confirmedPersons) {
      unconfirmedFaceIds.delete(confirmedPerson.faceId)

      const person = await getPersonById(confirmedPerson.personId)
      personsInPhoto.push(person?.name || 'N/A')
    }

    photoEvents.push({
      type: 'photo',
      timestamp: occurredAt.getTime(),
      photoId,
      url: getPhotoUrlFromId(photoId),
      description: undefined,
      personsInPhoto,
      unrecognizedFacesInPhoto: unconfirmedFaceIds.size,
    })
  }

  return photoEvents
}
async function getPhotoRows(chatId: UUID): Promise<UserUploadedPhotoToChat[]> {
  const { rows } = await postgres.query<UserUploadedPhotoToChat>(
    "SELECT * FROM history WHERE type='UserUploadedPhotoToChat' AND payload->>'chatId'=$1",
    [chatId]
  )

  return rows
}

async function getConfirmedPersons(photoId: UUID) {
  const { rows: confirmedAnnotationRows } = await postgres.query<PhotoAnnotationConfirmed>(
    "SELECT * FROM history WHERE type = 'PhotoAnnotationConfirmed'  AND payload->>'photoId'=$1",
    [photoId]
  )

  const confirmedPersons = confirmedAnnotationRows.flatMap(({ payload: { faceId, personId } }) => ({ faceId, personId }))
  return confirmedPersons
}

async function getDetectedFacesIds(photoId: UUID) {
  const { rows: faceDetectedRows } = await postgres.query<AWSDetectedFacesInPhoto>(
    "SELECT * FROM history WHERE type='AWSDetectedFacesInPhoto' AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
    [photoId]
  )

  const detectedFaceIds = faceDetectedRows[0].payload.faces.map((face) => face.faceId)
  return detectedFaceIds
}
