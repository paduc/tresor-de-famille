import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { AppUserId } from '../../domain/AppUserId'
import { PersonId } from '../../domain/PersonId'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { UserConfirmedHisFace } from '../../events/onboarding/UserConfirmedHisFace'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself'
import { UserRecognizedPersonInPhoto } from '../../events/onboarding/UserRecognizedPersonInPhoto'
import { AWSDetectedFacesInPhoto } from '../photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { getThreadListPageProps } from '../threadList/getThreadListPageProps'
import { GetUserName, HomePageProps, UploadProfilePicture } from './HomePage'

export const getHomePageProps = async (userId: AppUserId): Promise<HomePageProps> => {
  const step1 = await getGetUserName(userId)

  const personId = step1['get-user-name'] === 'done' ? step1.personId : undefined

  // const step2: UploadProfilePicture = await getUploadProfilePicture(userId, personId)

  const isOnboarding = step1['get-user-name'] !== 'done'

  if (isOnboarding) {
    return { isOnboarding, steps: { ...step1 } }
  }

  const { threads } = await getThreadListPageProps(userId)
  const latestThreads = threads.sort((a, b) => b.lastUpdatedOn - a.lastUpdatedOn).slice(0, 3)

  return {
    isOnboarding,
    latestThreads,
  }
}

async function getGetUserName(userId: AppUserId): Promise<GetUserName> {
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

async function getUploadProfilePicture(userId: AppUserId, personId?: PersonId): Promise<UploadProfilePicture> {
  const userFaceConfirmed = await getSingleEvent<UserConfirmedHisFace>('UserConfirmedHisFace', { userId })

  if (userFaceConfirmed) {
    const { photoId, faceId } = userFaceConfirmed.payload
    return {
      'upload-profile-picture': 'user-face-confirmed',
      photoId,
      photoUrl: getPhotoUrlFromId(photoId),
      faceId,
    }
  }

  // User might have uploaded a photo of themself elsewhere
  if (personId) {
    const otherFaceEvent = await getSingleEvent<UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
      ['UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'],
      { personId }
    )

    if (otherFaceEvent) {
      const { photoId, faceId } = otherFaceEvent.payload
      return {
        'upload-profile-picture': 'user-face-confirmed',
        photoId,
        photoUrl: getPhotoUrlFromId(photoId),
        faceId,
      }
    }
  }

  const uploadedPhoto = await getSingleEvent<OnboardingUserUploadedPhotoOfThemself>('OnboardingUserUploadedPhotoOfThemself', {
    userId,
  })

  if (uploadedPhoto) {
    const { photoId } = uploadedPhoto['payload']

    const facesDetected = await getSingleEvent<AWSDetectedFacesInPhoto>('AWSDetectedFacesInPhoto', { photoId })

    return {
      'upload-profile-picture': 'photo-uploaded',
      photoId,
      photoUrl: getPhotoUrlFromId(photoId),
      faces: facesDetected ? facesDetected.payload.faces.map(({ faceId }) => ({ faceId })) : [],
    }
  }

  return { 'upload-profile-picture': 'pending' }
}
