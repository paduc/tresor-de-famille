import { postgres } from '../../../dependencies/database'
import { getPhotoUrlFromId } from '../../../dependencies/photo-storage'
import { UUID } from '../../../domain'
import { getPersonById, getPersonByIdOrThrow } from '../../_getPersonById'
import { getPersonIdsForFaceId } from '../../_getPersonsIdsForFaceId'
import { AWSDetectedFacesInPhoto } from '../../photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { BienvenuePageProps } from './BienvenuePage'
import { UserNamedThemself } from '../../../events/onboarding/UserNamedThemself'
import { OnboardingUserUploadedPhotoOfThemself } from '../../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { OnboardingUserUploadedPhotoOfFamily } from '../../../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { UserConfirmedHisFace } from '../../../events/onboarding/UserConfirmedHisFace'
import { FaceIgnoredInPhoto } from './step3-learnAboutUsersFamily/FaceIgnoredInPhoto'
import { UserNamedPersonInPhoto } from './step3-learnAboutUsersFamily/UserNamedPersonInPhoto'
import { UserPostedRelationUsingOpenAI } from './step3-learnAboutUsersFamily/UserPostedRelationUsingOpenAI'
import { UserRecognizedPersonInPhoto } from './step3-learnAboutUsersFamily/UserRecognizedPersonInPhoto'
import { UserConfirmedRelationUsingOpenAI } from '../../../events/onboarding/UserConfirmedRelationUsingOpenAI'
import { getSingleEvent } from '../../../dependencies/getSingleEvent'
import { UserIgnoredRelationship } from './step3-learnAboutUsersFamily/UserIgnoredRelationship'
import { OnboardingUserStartedFirstThread } from '../../../events/onboarding/OnboardingUserStartedFirstThread'

export async function getBienvenuePageProps(userId: UUID): Promise<BienvenuePageProps> {
  const props: BienvenuePageProps = {
    userId,
    steps: [],
  }

  // Step 1 : User present themself
  props.steps.push(await getUserPresentsThemselfStep(userId))

  // Step 2 : User Uploads photo
  if (props.steps.at(-1)?.stage === 'done') {
    props.steps.push(await getUserUploadsHisPhotoStep(userId))
  }

  // Step 3 : User Uploads family photo

  if (props.steps.at(-1)?.stage === 'face-confirmed') {
    props.steps.push(await getUserUploadsFamilyPhotoStep(userId))
  }

  // Step 4 : User write first thread
  const userCreatedFirstThread = await getUserCreatedFirstThreadStep(userId)
  if (userCreatedFirstThread) props.steps.push(userCreatedFirstThread)

  return props
}

type FamilyPhoto = (BienvenuePageProps['steps'][number] & {
  goal: 'upload-family-photo'
} & {
  stage: 'annotating-photo'
})['photos'][number]

type FamilyMemberPhotoFace = FamilyPhoto['faces'][number]

type OnboardingStep = BienvenuePageProps['steps'][number]

async function getUserPresentsThemselfStep(userId: UUID): Promise<OnboardingStep & { goal: 'get-user-name' }> {
  // Get UserNamedThemself to have access to personId and name
  const { rows: userNamedRows } = await postgres.query<UserNamedThemself>(
    "SELECT * FROM history WHERE type='UserNamedThemself' AND payload->>'userId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
    [userId]
  )

  if (userNamedRows.length) {
    const { personId, name } = userNamedRows[0].payload

    return {
      goal: 'get-user-name',
      stage: 'done',
      personId,
      name,
    }
  }
  return {
    goal: 'get-user-name',
    stage: 'awaiting-name',
  }
}

async function getUserUploadsFamilyPhotoStep(userId: UUID): Promise<OnboardingStep & { goal: 'upload-family-photo' }> {
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

      const faces: FamilyMemberPhotoFace[] = detectedFaces
        ? await Promise.all(detectedFaces.map((detectedFace) => getFamilyDetectedFace({ detectedFace, photoId, userId })))
        : []

      photos.push({
        photoId,
        photoUrl: getPhotoUrlFromId(photoId),
        faces,
      })
    }
    return {
      goal: 'upload-family-photo',
      stage: 'annotating-photo',
      photos,
    }
  }

  return {
    goal: 'upload-family-photo',
    stage: 'awaiting-upload',
  }
}

async function getUserUploadsHisPhotoStep(userId: UUID): Promise<OnboardingStep & { goal: 'upload-first-photo' }> {
  // Has the user confirmed their face ?
  const { rows: userConfirmedFace } = await postgres.query<UserConfirmedHisFace>(
    "SELECT * FROM history WHERE type='UserConfirmedHisFace' AND payload->>'userId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
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

    return {
      goal: 'upload-first-photo',
      stage: 'face-confirmed',
      photoId,
      photoUrl: getPhotoUrlFromId(photoId),
      faces,
      confirmedFaceId: userConfirmedFace[0].payload.faceId,
    }
  }

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

    return {
      goal: 'upload-first-photo',
      stage: 'photo-uploaded',
      photoId,
      photoUrl: getPhotoUrlFromId(photoId),
      faces,
    }
  }

  // No photo uploaded
  return {
    goal: 'upload-first-photo',
    stage: 'waiting-upload',
  }
}

async function getFamilyDetectedFace(args: {
  detectedFace: AWSDetectedFacesInPhoto['payload']['faces'][number]
  photoId: UUID
  userId: UUID
}): Promise<FamilyMemberPhotoFace> {
  const { detectedFace, photoId, userId } = args

  // Has a this face been named or recognized ?
  const personNamedOrRecognized = await getSingleEvent<UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
    ['UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'],
    {
      faceId: detectedFace.faceId,
      photoId,
      userId,
    }
  )

  if (personNamedOrRecognized) {
    // Yes, the face was named or recognized
    const { type, payload } = personNamedOrRecognized
    const { personId } = payload

    let name: string
    if (type === 'UserNamedPersonInPhoto') {
      name = payload.name
    } else {
      name = (await getPersonByIdOrThrow(personId)).name
    }

    // Did the user pass on naming this relationship ?
    const ignoredRelationship = await getSingleEvent<UserIgnoredRelationship>('UserIgnoredRelationship', {
      personId,
    })
    if (ignoredRelationship) {
      return {
        stage: 'done',
        faceId: detectedFace.faceId,
        personId,
        name,
      }
    }

    // Has a relationship been confirmed for this person ?
    const { rows: confirmedRelationships } = await postgres.query<UserConfirmedRelationUsingOpenAI>(
      "SELECT * FROM history WHERE type='UserConfirmedRelationUsingOpenAI' AND payload->>'personId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
      [personId]
    )

    if (confirmedRelationships.length) {
      // Yes a relationship has been confirmed for this person
      const latestConfirmedRelationship = confirmedRelationships[0].payload

      return {
        stage: 'done',
        faceId: detectedFace.faceId,
        personId,
        name,
        relationship: latestConfirmedRelationship.relationship,
      }
    }

    // No confirmation
    // Has there been relationship posted by user ?
    const { rows: relationships } = await postgres.query<UserPostedRelationUsingOpenAI>(
      "SELECT * FROM history WHERE type='UserPostedRelationUsingOpenAI' AND payload->>'personId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
      [personId]
    )

    const latestPostedRelationship = relationships[0]?.payload

    if (latestPostedRelationship) {
      // Yes, a relationship has been posted
      const { relationship, messages, userAnswer } = latestPostedRelationship
      return {
        faceId: detectedFace.faceId,
        stage: 'awaiting-relationship-confirmation',
        name,
        personId,
        messages: messages || [],
        relationship,
        userAnswer,
      }
    }
    // No relationship by user
    return {
      faceId: detectedFace.faceId,
      stage: 'awaiting-relationship',
      name,
      personId,
    }
  }

  // Has this face been ignored ?
  const { rowCount: faceIgnored } = await postgres.query<FaceIgnoredInPhoto>(
    "SELECT * FROM history WHERE type='FaceIgnoredInPhoto' AND payload->>'faceId'=$1 AND payload->>'photoId'=$2 AND payload->>'ignoredBy'=$3 ORDER BY \"occurredAt\" DESC LIMIT 1",
    [detectedFace.faceId, photoId, userId]
  )

  if (faceIgnored) {
    return {
      faceId: detectedFace.faceId,
      stage: 'ignored',
    }
  }
  // Do we recognize this face from elsewhere ?
  const persons = await getPersonIdsForFaceId(detectedFace.faceId)
  if (persons.length) {
    const personId = persons[0]
    const person = await getPersonById(personId)

    if (person) {
      return {
        faceId: detectedFace.faceId,
        stage: 'done',
        personId,
        name: person.name,
      }
    }
  }

  return {
    faceId: detectedFace.faceId,
    stage: 'awaiting-name',
  }
}

async function getUserCreatedFirstThreadStep(
  userId: UUID
): Promise<(OnboardingStep & { goal: 'create-first-thread' }) | undefined> {
  const firstThreadCreated = await getSingleEvent<OnboardingUserStartedFirstThread>('OnboardingUserStartedFirstThread', {
    userId,
  })

  if (!firstThreadCreated) return

  const { threadId, message } = firstThreadCreated.payload

  return {
    goal: 'create-first-thread',
    stage: 'done',
    threadId,
    message,
  }
}