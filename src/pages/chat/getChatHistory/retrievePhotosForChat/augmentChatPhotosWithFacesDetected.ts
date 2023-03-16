import { BoundingBox } from 'aws-sdk/clients/rekognition'
import { postgres } from '../../../../dependencies/postgres'
import { ChatPhotoFace } from '../../ChatPage/ChatPage'
import { FacesDetectedInChatPhoto } from '../../recognizeFacesInChatPhoto/FacesDetectedInChatPhoto'
import { ChatPhotoEvent } from './retrievePhotosForChat'

type AugmentChatPhotosWithFacesDetectedDeps = {
  getPersonById: (personId: string) => Promise<ChatPhotoFace['person']>
  normalizeBBOX: (AWSBBox: BoundingBox) => { width: number; height: number; left: number; top: number }
}

export const makeAugmentChatPhotosWithFacesDetected = ({
  getPersonById,
  normalizeBBOX,
}: AugmentChatPhotosWithFacesDetectedDeps) =>
  async function augmentChatPhotosWithFacesDetected(chatId: string, photoRows: ChatPhotoEvent[]) {
    const { rows: faceDetectedRowsRes } = await postgres.query<FacesDetectedInChatPhoto>(
      "SELECT * FROM events WHERE type='FacesDetectedInChatPhoto' AND payload->>'chatId'=$1",
      [chatId]
    )

    const facesDetectedRows = faceDetectedRowsRes.map((row) => row.payload)
    for (const facesDetectedRow of facesDetectedRows) {
      const photoRow = photoRows.find((row) => row.photo.id === facesDetectedRow.photoId)

      if (!photoRow) continue

      for (const awsFace of facesDetectedRow.faces) {
        let person = null
        if (awsFace.personId) {
          person = await getPersonById(awsFace.personId)
        }

        photoRow.photo.faces = [
          ...(photoRow.photo.faces || []),
          {
            person,
            faceId: awsFace.faceId,
            position: normalizeBBOX(awsFace.position),
          },
        ]
      }
    }
  }
