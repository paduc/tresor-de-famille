import { postgres } from '../dependencies/database'
import { UUID } from '../domain'
import { UserConfirmedHisFace } from './bienvenue/step2-userUploadsPhoto/UserConfirmedHisFace'
import { UserNamedPersonInPhoto } from './bienvenue/step3-learnAboutUsersFamily/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from './bienvenue/step3-learnAboutUsersFamily/UserRecognizedPersonInPhoto'
import { PhotoManuallyAnnotated } from './photo/annotateManually/PhotoManuallyAnnotated'
import { PhotoAnnotationConfirmed } from './photo/confirmPhotoAnnotation/PhotoAnnotationConfirmed'

export const getPersonIdsForFaceId = async (faceId: UUID): Promise<UUID[]> => {
  const { rows } = await postgres.query<
    | PhotoAnnotationConfirmed
    | PhotoManuallyAnnotated
    | UserConfirmedHisFace
    | UserNamedPersonInPhoto
    | UserRecognizedPersonInPhoto
  >(
    "SELECT * FROM history WHERE type IN ('PhotoAnnotationConfirmed','PhotoManuallyAnnotated', 'UserConfirmedHisFace', 'UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto') AND payload->>'faceId'=$1",
    [faceId]
  )

  return Array.from(new Set(rows.map((row) => row.payload.personId)))
}
