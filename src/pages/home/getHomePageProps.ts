import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { UUID } from '../../domain'
import { OnboardingUserNamedThemself } from '../bienvenue/step1-userTellsAboutThemselves/OnboardingUserNamedThemself'
import {
  ChoseBeneficiaries,
  CreateFirstThread,
  GetUserName,
  HomePageProps,
  UploadFamilyPhoto,
  UploadFirstPhoto,
} from './HomePage'

export const getHomePageProps = async (userId: UUID): Promise<HomePageProps> => {
  let step1: GetUserName = { 'get-user-name': 'pending' }

  const userNamedThemself = await getSingleEvent<OnboardingUserNamedThemself>('OnboardingUserNamedThemself', { userId })
  if (userNamedThemself) {
    const { name, personId } = userNamedThemself.payload
    step1 = {
      'get-user-name': 'done',
      name,
      personId,
    }

    // Check step2
  }

  let step2: UploadFirstPhoto = { 'upload-first-photo': 'pending' }

  let step3: UploadFamilyPhoto = { 'upload-family-photo': 'awaiting-upload' }
  let step4: CreateFirstThread = { 'create-first-thread': 'awaiting-input' }
  let step5: ChoseBeneficiaries = { 'chose-beneficiaries': 'awaiting-input' }

  return { steps: { ...step1, ...step2, ...step3, ...step4, ...step5 } }
}
