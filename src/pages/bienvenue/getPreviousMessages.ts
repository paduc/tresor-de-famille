import { postgres } from '../../dependencies/database'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain'
import { getPersonById, getPersonByIdOrThrow } from '../_getPersonById'
import { getPersonIdsForFaceId } from '../_getPersonsIdsForFaceId'
import { AWSDetectedFacesInPhoto } from '../photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { BienvenuePageProps } from './BienvenuePage'
import { OnboardingUserNamedThemself } from './step1-userTellsAboutThemselves/OnboardingUserNamedThemself'
import { OnboardingUserUploadedPhotoOfThemself } from './step1-userTellsAboutThemselves/OnboardingUserUploadedPhotoOfThemself'
import { OnboardingUserUploadedPhotoOfFamily } from './step2-userUploadsPhoto/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserConfirmedHisFace } from './step2-userUploadsPhoto/OnboardingUserConfirmedHisFace'
import { OnboardingFaceIgnoredInFamilyPhoto } from './step3-learnAboutUsersFamily/OnboardingFaceIgnoredInFamilyPhoto'
import { OnboardingUserNamedPersonInFamilyPhoto } from './step3-learnAboutUsersFamily/OnboardingUserNamedPersonInFamilyPhoto'
import { OnboardingUserPostedRelationUsingOpenAI } from './step3-learnAboutUsersFamily/OnboardingUserPostedRelationUsingOpenAI'
import { OnboardingUserRecognizedPersonInFamilyPhoto } from './step3-learnAboutUsersFamily/OnboardingUserRecognizedPersonInFamilyPhoto'
import { OnboardingUserConfirmedRelationUsingOpenAI } from './step3-learnAboutUsersFamily/OnboardingUserConfirmedRelationUsingOpenAI'

export async function getPreviousMessages(userId: UUID): Promise<BienvenuePageProps> {
  const props: BienvenuePageProps = {
    userId,
    steps: [],
  }

  // Step 1 : User present themself

  // Get OnboardingUserNamedThemself to have access to personId and name
  const { rows: userNamedRows } = await postgres.query<OnboardingUserNamedThemself>(
    "SELECT * FROM history WHERE type='OnboardingUserNamedThemself' AND payload->>'userId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
    [userId]
  )

  if (userNamedRows.length) {
    const { personId, name } = userNamedRows[0].payload

    props.steps.push({
      goal: 'get-user-name',
      stage: 'done',
      personId,
      name,
    })
  } else {
    props.steps.push({
      goal: 'get-user-name',
      stage: 'awaiting-name',
    })
  }

  // Step 2 : User Uploads photo

  if (props.steps.at(-1)?.stage === 'done') {
    // Onboarding is a special chat thread with chatId = userId

    // 1) Has user confirmed face ?
    // 2) Has user uploaded photo ?
    // 3) Do we have faces ?

    // Has the user confirmed their face ?
    const { rows: userConfirmedFace } = await postgres.query<OnboardingUserConfirmedHisFace>(
      "SELECT * FROM history WHERE type='OnboardingUserConfirmedHisFace' AND payload->>'userId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
      [userId]
    )

    if (userConfirmedFace.length) {
      // User confirmed his face, we are DONE

      const { photoId } = userConfirmedFace[0].payload

      const { rows: facesDetected } = await postgres.query<AWSDetectedFacesInPhoto>(
        "SELECT * FROM history WHERE type='AWSDetectedFacesInPhoto' AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
        [photoId]
      )
      const faces = facesDetected[0]?.payload.faces.map(({ faceId }) => ({ faceId }))

      props.steps.push({
        goal: 'upload-first-photo',
        stage: 'face-confirmed',
        photoId,
        photoUrl: getPhotoUrlFromId(photoId),
        faces,
        confirmedFaceId: userConfirmedFace[0].payload.faceId,
      })
    } else {
      // Has the user uploaded a photo ?

      const { rows: userUploadedPhoto } = await postgres.query<OnboardingUserUploadedPhotoOfThemself>(
        "SELECT * FROM history WHERE type='OnboardingUserUploadedPhotoOfThemself' AND payload->>'uploadedBy'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
        [userId]
      )

      if (userUploadedPhoto.length) {
        // At least one photo has been uploaded

        const { photoId } = userUploadedPhoto[0].payload

        // Do we have faces ?
        const { rows: facesDetected } = await postgres.query<AWSDetectedFacesInPhoto>(
          "SELECT * FROM history WHERE type='AWSDetectedFacesInPhoto' AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
          [photoId]
        )

        const faces = facesDetected[0]?.payload.faces.map(({ faceId }) => ({ faceId }))

        props.steps.push({
          goal: 'upload-first-photo',
          stage: 'photo-uploaded',
          photoId,
          photoUrl: getPhotoUrlFromId(photoId),
          faces,
        })
      } else {
        // No photo uploaded

        props.steps.push({
          goal: 'upload-first-photo',
          stage: 'waiting-upload',
        })
      }
    }
  }

  // Step 3 : User Uploads family photo

  if (props.steps.at(-1)?.stage === 'face-confirmed') {
    const { rows: userUploadedPhotoRows } = await postgres.query<OnboardingUserUploadedPhotoOfFamily>(
      "SELECT * FROM history WHERE type='OnboardingUserUploadedPhotoOfFamily' AND payload->>'uploadedBy'=$1 ORDER BY \"occurredAt\" ASC",
      [userId]
    )

    const userUploadedPhotos = userUploadedPhotoRows.map((row) => row.payload)

    if (userUploadedPhotos.length) {
      const photos: FamilyPhoto[] = []
      for (const userUploadedPhoto of userUploadedPhotos) {
        const { photoId } = userUploadedPhoto

        const { rows: facesDetected } = await postgres.query<AWSDetectedFacesInPhoto>(
          "SELECT * FROM history WHERE type='AWSDetectedFacesInPhoto' AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
          [photoId]
        )

        // Get facesDetected
        const detectedFaces = facesDetected.map(({ payload }) => payload.faces).shift()

        const faces: FamilyMemberPhotoFace[] = []
        if (detectedFaces) {
          for (const detectedFace of detectedFaces) {
            // Do we recognize this face ?
            const persons = await getPersonIdsForFaceId(detectedFace.faceId)
            if (persons.length) {
              const personId = persons[0]
              const person = await getPersonById(personId)

              if (person) {
                faces.push({
                  faceId: detectedFace.faceId,
                  stage: 'done',
                  personId,
                  name: person.name,
                })
                continue
              }
            }

            // Has a this face been named or recognized ?
            const { rows: personNamedRows } = await postgres.query<
              OnboardingUserNamedPersonInFamilyPhoto | OnboardingUserRecognizedPersonInFamilyPhoto
            >(
              "SELECT * FROM history WHERE type IN ('OnboardingUserNamedPersonInFamilyPhoto', 'OnboardingUserRecognizedPersonInFamilyPhoto') AND payload->>'faceId'=$1 AND payload->>'photoId'=$2 AND payload->>'userId'=$3 ORDER BY \"occurredAt\" DESC LIMIT 1",
              [detectedFace.faceId, photoId, userId]
            )

            if (personNamedRows.length) {
              // Yes, the face was named or recognized
              const { type, payload } = personNamedRows[0]
              const { personId } = payload

              let name: string
              if (type === 'OnboardingUserNamedPersonInFamilyPhoto') {
                name = payload.name
              } else {
                name = (await getPersonByIdOrThrow(personId)).name
              }

              // Has a relationship been confirmed for this person ?
              const { rows: confirmedRelationships } = await postgres.query<OnboardingUserConfirmedRelationUsingOpenAI>(
                "SELECT * FROM history WHERE type='OnboardingUserConfirmedRelationUsingOpenAI' AND payload->>'personId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
                [personId]
              )

              if (confirmedRelationships.length) {
                // Yes a relationship has been confirmed for this person

                const latestConfirmedRelationship = confirmedRelationships[0].payload

                faces.push({
                  stage: 'done',
                  faceId: detectedFace.faceId,
                  personId,
                  name,
                  relationship: latestConfirmedRelationship.relationship,
                })
              } else {
                // No confirmation

                // Has there been relationship posted by user ?
                const { rows: relationships } = await postgres.query<OnboardingUserPostedRelationUsingOpenAI>(
                  "SELECT * FROM history WHERE type='OnboardingUserPostedRelationUsingOpenAI' AND payload->>'photoId'=$1 AND payload->>'faceId'=$2 AND payload->>'personId'=$3 ORDER BY \"occurredAt\" DESC LIMIT 1",
                  [photoId, detectedFace.faceId, personId]
                )

                const latestPostedRelationship = relationships[0]?.payload

                if (latestPostedRelationship) {
                  // Yes, a relationship has been posted
                  const { relationship, messages, userAnswer } = latestPostedRelationship
                  faces.push({
                    faceId: detectedFace.faceId,
                    stage: 'awaiting-relationship-confirmation',
                    name,
                    personId,
                    messages: messages || [],
                    relationship,
                    userAnswer,
                  })
                } else {
                  // No relationship by user
                  faces.push({
                    faceId: detectedFace.faceId,
                    stage: 'awaiting-relationship',
                    name,
                    personId,
                  })
                }
              }
            } else {
              // Has this face been ignored ?

              const { rowCount: faceIgnored } = await postgres.query<OnboardingFaceIgnoredInFamilyPhoto>(
                "SELECT * FROM history WHERE type='OnboardingFaceIgnoredInFamilyPhoto' AND payload->>'faceId'=$1 AND payload->>'photoId'=$2 AND payload->>'ignoredBy'=$3 ORDER BY \"occurredAt\" DESC LIMIT 1",
                [detectedFace.faceId, photoId, userId]
              )

              if (faceIgnored) {
                faces.push({
                  faceId: detectedFace.faceId,
                  stage: 'ignored',
                })
              } else {
                faces.push({
                  faceId: detectedFace.faceId,
                  stage: 'awaiting-name',
                })
              }
            }
          }
        }

        photos.push({
          photoId,
          photoUrl: getPhotoUrlFromId(photoId),
          faces,
        })
      }
      props.steps.push({
        goal: 'upload-family-photo',
        stage: 'annotating-photo',
        photos,
      })
    } else {
      props.steps.push({
        goal: 'upload-family-photo',
        stage: 'awaiting-upload',
      })
    }
  }

  return props
}

type FamilyPhoto = (BienvenuePageProps['steps'][number] & {
  goal: 'upload-family-photo'
} & {
  stage: 'annotating-photo'
})['photos'][number]

type FamilyMemberPhotoFace = FamilyPhoto['faces'][number]
