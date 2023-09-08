import { UUID } from 'aws-sdk/clients/cloudtrail'
import { getEventList } from '../../../dependencies/getEventList'
import { getSingleEvent } from '../../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../../dependencies/photo-storage'
import { BeneficiariesChosen } from '../../../events/onboarding/BeneficiariesChosen'
import { FaceIgnoredInPhoto } from '../../../events/onboarding/FaceIgnoredInPhoto'
import { OnboardingFamilyMemberAnnotationIsDone } from '../../../events/onboarding/OnboardingFamilyMemberAnnotationIsDone'
import { OnboardingReadyForBeneficiaries } from '../../../events/onboarding/OnboardingReadyForBeneficiaries'
import { OnboardingUserStartedFirstThread } from '../../../events/onboarding/OnboardingUserStartedFirstThread'
import { OnboardingUserUploadedPhotoOfFamily } from '../../../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from '../../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { UserConfirmedHisFace } from '../../../events/onboarding/UserConfirmedHisFace'
import { UserConfirmedRelationUsingOpenAI } from '../../../events/onboarding/UserConfirmedRelationUsingOpenAI'
import { UserIgnoredRelationship } from '../../../events/onboarding/UserIgnoredRelationship'
import { UserNamedPersonInPhoto } from '../../../events/onboarding/UserNamedPersonInPhoto'
import { UserNamedThemself } from '../../../events/onboarding/UserNamedThemself'
import { UserPostedRelationUsingOpenAI } from '../../../events/onboarding/UserPostedRelationUsingOpenAI'
import { UserRecognizedPersonInPhoto } from '../../../events/onboarding/UserRecognizedPersonInPhoto'
import { getPersonByIdOrThrow, getPersonById } from '../../_getPersonById'
import { getPersonIdsForFaceId } from '../../_getPersonsIdsForFaceId'
import { AWSDetectedFacesInPhoto } from '../../photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import {
  OnboardingHomePageProps,
  UploadFirstPhoto,
  UploadFamilyPhoto,
  CreateFirstThread,
  ChoseBeneficiaries,
  GetUserName,
} from './OnboardingHomePage'

export const RELATIONSHIPS_ENABLED = false

export const getOnboardingHomePageProps = async (userId: UUID): Promise<OnboardingHomePageProps> => {
  const step1 = await getGetUserName(userId)

  const step2: UploadFirstPhoto = await getUploadFirstPhoto(userId)

  const step3: UploadFamilyPhoto = await getUploadFamilyPhoto(userId)

  const step4: CreateFirstThread = await getCreateFirstThread(userId)
  const step5: ChoseBeneficiaries = await getChoseBeneficiaries(userId)

  const isOnboarding = step5['chose-beneficiaries'] !== 'done'

  if (isOnboarding) {
    return { isOnboarding, steps: { ...step1, ...step2, ...step3, ...step4, ...step5 } }
  }

  const finishedOnboardingDate = await getFinishedOnboardingDate(userId)

  const ONE_HOUR = 3600 * 1000
  return {
    isOnboarding,
    displayFinisherCongratulations: Date.now() - finishedOnboardingDate.getTime() < ONE_HOUR,
  }
}

async function getFinishedOnboardingDate(userId: UUID): Promise<Date> {
  const beneficiariesChosen = await getSingleEvent<BeneficiariesChosen>('BeneficiariesChosen', { userId })

  if (beneficiariesChosen) {
    return beneficiariesChosen.occurredAt
  }

  return new Date()
}

async function getChoseBeneficiaries(userId: UUID): Promise<ChoseBeneficiaries> {
  const beneficiaries = await getSingleEvent<BeneficiariesChosen>('BeneficiariesChosen', { userId })

  if (beneficiaries) {
    return { 'chose-beneficiaries': 'done' }
  }

  return { 'chose-beneficiaries': 'awaiting-input' }
}

async function getCreateFirstThread(userId: UUID): Promise<CreateFirstThread> {
  const firstThread = await getSingleEvent<OnboardingUserStartedFirstThread>('OnboardingUserStartedFirstThread', { userId })

  if (firstThread) {
    const { threadId, message } = firstThread.payload

    const done = await getSingleEvent<OnboardingReadyForBeneficiaries>('OnboardingReadyForBeneficiaries', { userId })

    if (done) {
      return { 'create-first-thread': 'done', threadId, message }
    }

    return { 'create-first-thread': 'thread-written', threadId, message }
  }

  return { 'create-first-thread': 'awaiting-input' }
}

async function getUploadFamilyPhoto(userId: UUID): Promise<UploadFamilyPhoto> {
  const isAnnotatingPhotoDone = await getSingleEvent<OnboardingFamilyMemberAnnotationIsDone>(
    'OnboardingFamilyMemberAnnotationIsDone',
    { userId }
  )

  if (isAnnotatingPhotoDone) {
    return { 'upload-family-photo': 'done' }
  }

  const uploadedPhotos = await getEventList<OnboardingUserUploadedPhotoOfFamily>('OnboardingUserUploadedPhotoOfFamily', {
    uploadedBy: userId,
  })

  if (uploadedPhotos.length) {
    const photos = await Promise.all(uploadedPhotos.map(({ payload: { photoId } }) => getFamilyPhoto({ photoId, userId })))

    return {
      'upload-family-photo': 'annotating-photo',
      photos,
    }
  }

  return { 'upload-family-photo': 'awaiting-upload' }
}

type FamilyPhoto = (UploadFamilyPhoto & {
  'upload-family-photo': 'annotating-photo'
})['photos'][number]

async function getFamilyPhoto({ photoId, userId }: { photoId: UUID; userId: UUID }): Promise<FamilyPhoto> {
  const facesDetected = await getSingleEvent<AWSDetectedFacesInPhoto>('AWSDetectedFacesInPhoto', { photoId })

  const detectedFaces = facesDetected?.payload.faces || []

  const faces: FamilyPhotoMemberFace[] = detectedFaces
    ? await Promise.all(detectedFaces.map(({ faceId }) => getFamilyDetectedFace({ faceId, photoId, userId })))
    : []

  return {
    photoId,
    photoUrl: getPhotoUrlFromId(photoId),
    faces,
  }
}

type FamilyPhotoMemberFace = FamilyPhoto['faces'][number]

async function getFamilyDetectedFace(args: { faceId: UUID; photoId: UUID; userId: UUID }): Promise<FamilyPhotoMemberFace> {
  const { faceId, photoId, userId } = args

  // Has a this face been named or recognized ?
  const personNamedOrRecognized = await getSingleEvent<UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
    ['UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'],
    {
      faceId,
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

    if (RELATIONSHIPS_ENABLED) {
      // Did the user pass on naming this relationship ?
      const ignoredRelationship = await getSingleEvent<UserIgnoredRelationship>('UserIgnoredRelationship', {
        personId,
      })
      if (ignoredRelationship) {
        return {
          faceId,
          name,
          personId,
          stage: 'done',
        }
      }

      // Has a relationship been confirmed for this person ?
      const confirmedRelation = await getSingleEvent<UserConfirmedRelationUsingOpenAI>('UserConfirmedRelationUsingOpenAI', {
        personId,
      })

      if (confirmedRelation) {
        // Yes a relationship has been confirmed for this person
        const latestConfirmedRelationship = confirmedRelation.payload

        return {
          stage: 'done',
          faceId,
          personId,
          name,
          relationship: latestConfirmedRelationship.relationship,
        }
      }

      // No confirmation
      // Has there been relationship posted by user ?
      const userPostedRelationship = await getSingleEvent<UserPostedRelationUsingOpenAI>('UserPostedRelationUsingOpenAI', {
        personId,
      })

      if (userPostedRelationship) {
        // Yes, a relationship has been posted
        const { relationship, messages, userAnswer } = userPostedRelationship.payload
        return {
          faceId,
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
        faceId,
        stage: 'awaiting-relationship',
        name,
        personId,
      }
    } else {
      return {
        faceId,
        stage: 'done',
        name,
        personId,
      }
    }
  }

  // Has this face been ignored ?
  const faceIgnored = await getSingleEvent<FaceIgnoredInPhoto>('FaceIgnoredInPhoto', {
    photoId,
    faceId,
    ignoredBy: userId,
  })

  if (faceIgnored) {
    return {
      faceId,
      stage: 'ignored',
    }
  }

  // Do we recognize this face from elsewhere ?
  const persons = await getPersonIdsForFaceId(faceId)
  if (persons.length) {
    const personId = persons[0]
    const person = await getPersonById(personId)

    if (person) {
      return {
        faceId,
        stage: 'done',
        personId,
        name: person.name,
      }
    }
  }

  return {
    faceId,
    stage: 'awaiting-name',
  }
}

async function getUploadFirstPhoto(userId: UUID): Promise<UploadFirstPhoto> {
  const userFaceConfirmed = await getSingleEvent<UserConfirmedHisFace>('UserConfirmedHisFace', { userId })

  if (userFaceConfirmed) {
    const { photoId, faceId } = userFaceConfirmed.payload
    return {
      'upload-first-photo': 'user-face-confirmed',
      photoId,
      photoUrl: getPhotoUrlFromId(photoId),
      faceId,
    }
  }

  const uploadedPhoto = await getSingleEvent<OnboardingUserUploadedPhotoOfThemself>('OnboardingUserUploadedPhotoOfThemself', {
    uploadedBy: userId,
  })

  if (uploadedPhoto) {
    const { photoId } = uploadedPhoto['payload']

    const facesDetected = await getSingleEvent<AWSDetectedFacesInPhoto>('AWSDetectedFacesInPhoto', { photoId })

    return {
      'upload-first-photo': 'photo-uploaded',
      photoId,
      photoUrl: getPhotoUrlFromId(photoId),
      faces: facesDetected ? facesDetected.payload.faces.map(({ faceId }) => ({ faceId })) : [],
    }
  }

  return { 'upload-first-photo': 'pending' }
}

async function getGetUserName(userId: UUID): Promise<GetUserName> {
  const userNamedThemself = await getSingleEvent<UserNamedThemself>('UserNamedThemself', { userId })

  if (userNamedThemself) {
    const { name, personId } = userNamedThemself.payload
    return {
      'get-user-name': 'done',
      name,
      personId,
    }
  }
  return { 'get-user-name': 'pending' }
}
