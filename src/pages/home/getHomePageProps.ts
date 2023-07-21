import { PayloadPropertyMap, getSingleEvent } from '../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain'
import { OnboardingUserNamedThemself } from '../bienvenue/step1-userTellsAboutThemselves/OnboardingUserNamedThemself'
import { OnboardingUserUploadedPhotoOfThemself } from '../bienvenue/step1-userTellsAboutThemselves/OnboardingUserUploadedPhotoOfThemself'
import { OnboardingUserConfirmedHisFace } from '../bienvenue/step2-userUploadsPhoto/OnboardingUserConfirmedHisFace'
import { AWSDetectedFacesInPhoto } from '../photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import {
  ChoseBeneficiaries,
  CreateFirstThread,
  GetUserName,
  HomePageProps,
  UploadFamilyPhoto,
  UploadFirstPhoto,
} from './HomePage'

export const getHomePageProps = async (userId: UUID): Promise<HomePageProps> => {
  const step1 = await getGetUserName(userId)

  const step2: UploadFirstPhoto = await getUploadFirstPhoto(userId)

  const step3: UploadFamilyPhoto = { 'upload-family-photo': 'awaiting-upload' }
  const step4: CreateFirstThread = { 'create-first-thread': 'awaiting-input' }
  const step5: ChoseBeneficiaries = { 'chose-beneficiaries': 'awaiting-input' }

  return { steps: { ...step1, ...step2, ...step3, ...step4, ...step5 } }
}

async function getUploadFirstPhoto(userId: UUID): Promise<UploadFirstPhoto> {
  const userFaceConfirmed = await getSingleEvent<OnboardingUserConfirmedHisFace>('OnboardingUserConfirmedHisFace', { userId })

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
  const userNamedThemself = await getSingleEvent<OnboardingUserNamedThemself>('OnboardingUserNamedThemself', { userId })

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
