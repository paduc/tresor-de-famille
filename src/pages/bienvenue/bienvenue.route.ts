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
import { OnboardingFaceIgnoredInFamilyPhoto } from './step3-learnAboutUsersFamily/OnboardingFaceIgnoredInFamilyPhoto'
import { getPersonIdForUserId } from '../_getPersonIdForUserId.query'
import { personsIndex } from '../../dependencies/search'
import { OnboardingUserRecognizedPersonInFamilyPhoto } from './step3-learnAboutUsersFamily/OnboardingUserRecognizedPersonInFamilyPhoto'
import { parseRelationshipUsingOpenAI } from './step3-learnAboutUsersFamily/parseRelationshipUsingOpenAI'

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
    // TODO: parse only the action and then for each action, the required args
    const { action, presentation, faceId, photoId, newFamilyMemberName, personId, userAnswer } = z
      .object({
        action: z.string(),
        presentation: z.string().optional(),
        faceId: zIsUUID.optional(),
        photoId: zIsUUID.optional(),
        personId: zIsUUID.optional(),
        newFamilyMemberName: z.string().optional(),
        userAnswer: z.string().optional(),
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
      const personId = await getPersonIdForUserId(userId)
      await addToHistory(
        UserConfirmedHisFaceDuringOnboarding({
          userId,
          photoId,
          faceId,
          personId,
        })
      )
    } else if (action === 'submitFamilyMemberName' && faceId && photoId && typeof newFamilyMemberName === 'string') {
      if (newFamilyMemberName.length > 0) {
        const personId = getUuid()
        await addToHistory(
          OnboardingUserNamedPersonInFamilyPhoto({
            userId,
            photoId,
            faceId,
            personId,
            name: newFamilyMemberName,
          })
        )

        try {
          await personsIndex.saveObject({
            objectID: personId,
            personId,
            name: newFamilyMemberName,
            visible_by: [`person/${personId}`, `user/${userId}`],
          })
        } catch (error) {
          console.error('Could not add new family member to algolia index', error)
        }
      } else {
        const { existingFamilyMemberId } = z
          .object({
            existingFamilyMemberId: zIsUUID,
          })
          .parse(request.body)
        await addToHistory(
          OnboardingUserRecognizedPersonInFamilyPhoto({
            userId,
            photoId,
            faceId,
            personId: existingFamilyMemberId,
          })
        )
      }
    } else if (action === 'ignoreFamilyMemberFaceInPhoto' && faceId && photoId) {
      await addToHistory(
        OnboardingFaceIgnoredInFamilyPhoto({
          ignoredBy: userId,
          photoId,
          faceId,
        })
      )
    } else if (action === 'submitRelationship' && faceId && personId && photoId && userAnswer) {
      await parseRelationshipUsingOpenAI({
        userId,
        faceId,
        personId,
        photoId,
        userAnswer,
      })
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
