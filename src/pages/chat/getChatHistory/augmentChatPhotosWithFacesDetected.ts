import { postgres } from '../../../dependencies/postgres'
import { normalizeBBOX } from '../../../dependencies/rekognition'
import { FacesRecognizedInChatPhoto } from '../FacesRecognizedInChatPhoto'
import { getPersonById } from '../getPersonById.query'
import { retrievePhotosForChat } from './retrievePhotosForChat'

export async function augmentChatPhotosWithFacesDetected(
  chatId: string,
  photoRows: Awaited<ReturnType<typeof retrievePhotosForChat>>
) {
  const { rows: faceDetectedRowsRes } = await postgres.query<FacesRecognizedInChatPhoto>(
    "SELECT * FROM events WHERE type='FacesRecognizedInChatPhoto' AND payload->>'chatId'=$1",
    [chatId]
  )

  const facesDetectedRows = faceDetectedRowsRes.map((row) => row.payload)
  for (const facesDetectedRow of facesDetectedRows) {
    const photoRow = photoRows.find((row) => row.photo.id === facesDetectedRow.photoId)

    if (!photoRow) continue

    for (const awsFace of facesDetectedRow.faces) {
      let personName = null
      if (awsFace.personId) {
        const person = await getPersonById(awsFace.personId)
        if (person) {
          personName = person.name
        }
      }

      photoRow.photo.faces = [
        ...(photoRow.photo.faces || []),
        {
          person: personName ? { name: personName } : null,
          faceId: awsFace.AWSFaceId,
          position: normalizeBBOX(awsFace.position),
        },
      ]
    }
  }
}
