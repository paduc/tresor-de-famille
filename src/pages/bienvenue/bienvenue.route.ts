import multer from 'multer'
import { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { zIsUUID } from '../../domain'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { BienvenuePage } from './BienvenuePage'
import { getPreviousMessages } from './getPreviousMessages'
import { onboardingUrl } from './onboardingUrl'
import { parseFirstPresentation } from './step1-userTellsAboutThemselves/parseFirstPresentation'
import { uploadUserPhotoOfThemself } from './step1-userTellsAboutThemselves/uploadUserPhotoOfThemself'
import { UserConfirmedHisFaceDuringOnboarding } from './step2-userUploadsPhoto/UserConfirmedHisFaceDuringOnboarding'
import { uploadUserPhotoOfFamily } from './step2-userUploadsPhoto/uploadUserPhotoOfFamily'
import { OnboardingUserNamedPersonInFamilyPhoto } from './step3-learnAboutUsersFamily/OnboardingUserNamedPersonInFamilyPhoto'
import { getUuid } from '../../libs/getUuid'

const FILE_SIZE_LIMIT_MB = 50
const upload = multer({
  dest: 'temp/photos',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

pageRouter
  .route(onboardingUrl)
  .get(requireAuth(), async (request, response) => {
    const props = await getPreviousMessages(request.session.user!.id)
    responseAsHtml(
      request,
      response,
      BienvenuePage({
        ...props,
      })
    )
  })
  .post(requireAuth(), upload.single('photo'), async (request, response) => {
    const { action, presentation, faceId, photoId, familyMemberName } = z
      .object({
        action: z.string(),
        presentation: z.string().optional(),
        familyMemberName: z.string().optional(),
        faceId: zIsUUID.optional(),
        photoId: zIsUUID.optional(),
      })
      .parse(request.body)

    const userId = request.session.user!.id

    if (action === 'submitPresentation' && presentation) {
      await parseFirstPresentation({ userAnswer: presentation, userId })
    } else if (action === 'userSendsPhotoOfThemself') {
      const { file } = request

      if (!file) return new Error('We did not receive any image.')

      await uploadUserPhotoOfThemself({ file, userId })
    } else if (action === 'userSendsPhotoOfFamily') {
      const { file } = request

      if (!file) return new Error('We did not receive any image.')

      await uploadUserPhotoOfFamily({ file, userId })
    } else if (action === 'confirmFaceIsUser' && faceId && photoId) {
      await addToHistory(
        UserConfirmedHisFaceDuringOnboarding({
          userId,
          photoId,
          faceId,
        })
      )
    } else if (action === 'submitFamilyMemberName' && faceId && photoId && familyMemberName) {
      await addToHistory(
        OnboardingUserNamedPersonInFamilyPhoto({
          userId,
          photoId,
          faceId,
          personId: getUuid(),
          name: familyMemberName,
        })
      )
    }

    const props = await getPreviousMessages(request.session.user!.id)

    return responseAsHtml(
      request,
      response,
      BienvenuePage({
        ...props,
      })
    )
  })
