import { postgres } from '../../dependencies/database'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain'
import { UserUploadedPhotoToChat } from '../chat/uploadPhotoToChat/UserUploadedPhotoToChat'
import { AWSDetectedFacesInPhoto } from '../photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { BienvenuePageProps } from './BienvenuePage'
import { OnboardingUserUploadedPhotoOfThemself } from './step1-userTellsAboutThemselves/OnboardingUserUploadedPhotoOfThemself'
import { UserPresentedThemselfUsingOpenAI } from './step1-userTellsAboutThemselves/UserPresentedThemselfUsingOpenAI'
import { UserProgressedUsingOpenAIToPresentThemself } from './step1-userTellsAboutThemselves/UserProgressedUsingOpenAIToPresentThemself'
import { initialMessages } from './step1-userTellsAboutThemselves/parseFirstPresentation'
import { OnboardingUserUploadedPhotoOfFamily } from './step2-userUploadsPhoto/OnboardingUserUploadedPhotoOfFamily'
import { UserConfirmedHisFaceDuringOnboarding } from './step2-userUploadsPhoto/UserConfirmedHisFaceDuringOnboarding'

export async function getPreviousMessages(userId: UUID): Promise<BienvenuePageProps> {
  const props: BienvenuePageProps = {
    userId,
    steps: [],
  }

  // Step 1 : User present themself

  // Get UserPresentedThemselfUsingOpenAI to have access to personId and name
  const { rows: userPresentRows } = await postgres.query<UserPresentedThemselfUsingOpenAI>(
    "SELECT * FROM history WHERE type='UserPresentedThemselfUsingOpenAI' AND payload->>'userId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
    [userId]
  )

  if (userPresentRows.length) {
    const { personId, name, messages } = userPresentRows[0].payload

    props.steps.push({
      goal: 'get-user-name',
      stage: 'done',
      messages,
      result: {
        personId,
        name,
      },
    })
  } else {
    // Get the latest onboarding progress event
    const { rows: messageRow } = await postgres.query<UserProgressedUsingOpenAIToPresentThemself>(
      "SELECT * FROM history WHERE type='UserProgressedUsingOpenAIToPresentThemself' AND payload->>'userId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
      [userId]
    )

    // Revert to initialMessages if no progress event
    const messages = messageRow.length ? messageRow[0].payload.messages : [...initialMessages]

    props.steps.push({
      goal: 'get-user-name',
      stage: 'in-progress',
      messages,
    })
  }

  // Step 2 : User Uploads photo

  if (props.steps.at(-1)?.stage === 'done') {
    // Onboarding is a special chat thread with chatId = userId

    // 1) Has user confirmed face ?
    // 2) Has user uploaded photo ?
    // 3) Do we have faces ?

    // Has the user confirmed their face ?
    const { rows: userConfirmedFace } = await postgres.query<UserConfirmedHisFaceDuringOnboarding>(
      "SELECT * FROM history WHERE type='UserConfirmedHisFaceDuringOnboarding' AND payload->>'userId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
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
    const { rows: latestUserUploadedPhoto } = await postgres.query<OnboardingUserUploadedPhotoOfFamily>(
      "SELECT * FROM history WHERE type='OnboardingUserUploadedPhotoOfFamily' AND payload->>'uploadedBy'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
      [userId]
    )

    const { photoId } = latestUserUploadedPhoto[0].payload

    if (latestUserUploadedPhoto.length) {
      // Has the user annotated a face ?
      const { rows: facesDetected } = await postgres.query<AWSDetectedFacesInPhoto>(
        "SELECT * FROM history WHERE type='AWSDetectedFacesInPhoto' AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
        [photoId]
      )

      // Get facesDetected
      const faces = facesDetected.map(({ payload }) => payload.faces).shift()

      if (faces) {
        for (const face of faces) {
          //             | {
          //       stage: 'awaiting-name'
          //     }
          //   | { stage: 'awaiting-relationship'; name: string }
          //   | {
          //       stage: 'relationship-in-progress'
          //       messages: OpenAIMessage[]
          //       name: string
          //     }
          //   | {
          //       stage: 'done'
          //       messages: OpenAIMessage[]
          //       result: {
          //         personId: UUID
          //         name: string
          //         relationship?: {}
          //       }
          //     }
          // )
        }
      }

      props.steps.push({
        goal: 'upload-family-photo',
        stage: 'annotating-photo',
        photoId,
        photoUrl: getPhotoUrlFromId(photoId),
        faces: [],
      })
    } else {
      // No the user has not uploaded another photo for his family
      props.steps.push({
        goal: 'upload-family-photo',
        stage: 'awaiting-upload',
      })
    }
  }

  return props
}
