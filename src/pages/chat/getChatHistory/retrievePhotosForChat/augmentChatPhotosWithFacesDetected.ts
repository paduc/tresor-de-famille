import { BoundingBox } from 'aws-sdk/clients/rekognition'
import { postgres } from '../../../../dependencies/postgres'
import { UUID } from '../../../../domain'
import { ChatPhotoFace } from '../../ChatPage/ChatPage'
import { AWSFacesDetectedInChatPhoto } from '../../recognizeFacesInChatPhoto/AWSFacesDetectedInChatPhoto'
import { ChatPhotoEvent } from './retrievePhotosForChat'

type AugmentChatPhotosWithFacesDetectedDeps = {
  getPersonById: (personId: UUID) => Promise<ChatPhotoFace['person']>
  normalizeBBOX: (AWSBBox: BoundingBox) => { width: number; height: number; left: number; top: number }
}

export const makeAugmentChatPhotosWithFacesDetected = ({
  getPersonById,
  normalizeBBOX,
}: AugmentChatPhotosWithFacesDetectedDeps) =>
  async function augmentChatPhotosWithFacesDetected(chatId: UUID, photoRows: ChatPhotoEvent[]) {
    const { rows: faceDetectedRowsRes } = await postgres.query<AWSFacesDetectedInChatPhoto>(
      "SELECT * FROM events WHERE type='AWSFacesDetectedInChatPhoto' AND payload->>'chatId'=$1",
      [chatId]
    )

    const facesDetectedRows = faceDetectedRowsRes.map((row) => row.payload)
    for (const facesDetectedRow of facesDetectedRows) {
      const photoRow = photoRows.find((row) => row.photo.id === facesDetectedRow.photoId)

      if (!photoRow) continue

      for (const awsFace of facesDetectedRow.faces) {
        let person = null
        // if (awsFace.personId) {
        //   person = await getPersonById(awsFace.personId)
        // }

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
