import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { UserConfirmedHisFace } from '../../events/onboarding/UserConfirmedHisFace'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself'
import { AWSDetectedFacesInPhoto } from '../photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { GetUserName, HomePageProps, UploadProfilePicture } from './HomePage'

export const getHomePageProps = async (userId: UUID): Promise<HomePageProps> => {
  const step1 = await getGetUserName(userId)

  const step2: UploadProfilePicture = await getUploadProfilePicture(userId)

  const isOnboarding = step2['upload-profile-picture'] !== 'user-face-confirmed'

  if (isOnboarding) {
    return { isOnboarding, steps: { ...step1, ...step2 } }
  }

  return {
    isOnboarding,
  }
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

async function getUploadProfilePicture(userId: UUID): Promise<UploadProfilePicture> {
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

  const uploadedPhoto = await getSingleEvent<OnboardingUserUploadedPhotoOfThemself>('OnboardingUserUploadedPhotoOfThemself', {
    uploadedBy: userId,
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
