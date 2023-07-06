import { postgres } from '../dependencies/database'
import { UUID } from '../domain'
import { OnboardingUserConfirmedHisFace } from './bienvenue/step2-userUploadsPhoto/OnboardingUserConfirmedHisFace'
import { OnboardingUserNamedPersonInFamilyPhoto } from './bienvenue/step3-learnAboutUsersFamily/OnboardingUserNamedPersonInFamilyPhoto'
import { OnboardingUserRecognizedPersonInFamilyPhoto } from './bienvenue/step3-learnAboutUsersFamily/OnboardingUserRecognizedPersonInFamilyPhoto'
import { PhotoManuallyAnnotated } from './photo/annotateManually/PhotoManuallyAnnotated'
import { PhotoAnnotationConfirmed } from './photo/confirmPhotoAnnotation/PhotoAnnotationConfirmed'

export const getPersonIdsForFaceId = async (faceId: UUID): Promise<UUID[]> => {
  const { rows } = await postgres.query<
    | PhotoAnnotationConfirmed
    | PhotoManuallyAnnotated
    | OnboardingUserConfirmedHisFace
    | OnboardingUserNamedPersonInFamilyPhoto
    | OnboardingUserRecognizedPersonInFamilyPhoto
  >(
    "SELECT * FROM history WHERE type IN ('PhotoAnnotationConfirmed','PhotoManuallyAnnotated', 'OnboardingUserConfirmedHisFace', 'OnboardingUserNamedPersonInFamilyPhoto', 'OnboardingUserRecognizedPersonInFamilyPhoto') AND payload->>'faceId'=$1",
    [faceId]
  )

  return Array.from(new Set(rows.map((row) => row.payload.personId)))
}
