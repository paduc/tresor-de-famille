import multer from 'multer'
import { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { personsIndex } from '../../dependencies/search'
import { zIsUUID } from '../../domain'
import { getUuid } from '../../libs/getUuid'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { getPersonIdForUserId } from '../_getPersonIdForUserId.query'
import { pageRouter } from '../pageRouter'
import { BienvenuePage } from './BienvenuePage'
import { getBienvenuePageProps } from './getBienvenuePageProps'
import { onboardingUrl } from './onboardingUrl'
import { OnboardingUserNamedThemself } from './step1-userTellsAboutThemselves/OnboardingUserNamedThemself'
import { uploadUserPhotoOfThemself } from './step1-userTellsAboutThemselves/uploadUserPhotoOfThemself'
import { OnboardingUserConfirmedHisFace } from './step2-userUploadsPhoto/OnboardingUserConfirmedHisFace'
import { uploadUserPhotoOfFamily } from './step2-userUploadsPhoto/uploadUserPhotoOfFamily'
import { OnboardingFaceIgnoredInFamilyPhoto } from './step3-learnAboutUsersFamily/OnboardingFaceIgnoredInFamilyPhoto'
import { OnboardingUserNamedPersonInFamilyPhoto } from './step3-learnAboutUsersFamily/OnboardingUserNamedPersonInFamilyPhoto'
import { OnboardingUserRecognizedPersonInFamilyPhoto } from './step3-learnAboutUsersFamily/OnboardingUserRecognizedPersonInFamilyPhoto'
import { parseRelationshipUsingOpenAI } from './step3-learnAboutUsersFamily/parseRelationshipUsingOpenAI'
import { OnboardingUserConfirmedRelationUsingOpenAI } from './step3-learnAboutUsersFamily/OnboardingUserConfirmedRelationUsingOpenAI'
import { isValidFamilyMemberRelationship } from './step3-learnAboutUsersFamily/FamilyMemberRelationship'
import { OnboardingUserIgnoredRelationship } from './step3-learnAboutUsersFamily/OnboardingUserIgnoredRelationship'

const FILE_SIZE_LIMIT_MB = 50
const upload = multer({
  dest: 'temp/photos',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

pageRouter
  .route(onboardingUrl)
  .get(requireAuth(), async (request, response) => {
    const props = await getBienvenuePageProps(request.session.user!.id)
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
    const { action, presentation, faceId, photoId, newFamilyMemberName, personId, userAnswer, stringifiedRelationship } = z
      .object({
        action: z.string(),
        presentation: z.string().optional(),
        faceId: zIsUUID.optional(),
        photoId: zIsUUID.optional(),
        personId: zIsUUID.optional(),
        newFamilyMemberName: z.string().optional(),
        userAnswer: z.string().optional(),
        stringifiedRelationship: z.string().optional(),
      })
      .parse(request.body)

    const userId = request.session.user!.id

    if (action === 'submitPresentation' && presentation) {
      const personId = getUuid()
      await addToHistory(
        OnboardingUserNamedThemself({
          userId,
          personId,
          name: presentation,
        })
      )

      try {
        await personsIndex.saveObject({
          objectID: personId,
          personId,
          name: presentation,
          visible_by: [`person/${personId}`, `user/${userId}`],
        })
      } catch (error) {
        console.error('Could not add new user to algolia index', error)
      }
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
        OnboardingUserConfirmedHisFace({
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
    } else if (action === 'submitRelationship' && personId && userAnswer) {
      await parseRelationshipUsingOpenAI({
        userId,
        personId,
        userAnswer,
      })
    } else if (action === 'ignoreRelationship' && personId) {
      await addToHistory(OnboardingUserIgnoredRelationship({ personId, userId }))
    } else if (action === 'confirmOpenAIRelationship' && personId && stringifiedRelationship) {
      try {
        const parsedRelation = JSON.parse(stringifiedRelationship)

        const { relationship, side, precision } = parsedRelation
        const reducedRelation = { relationship, side, precision }

        if (isValidFamilyMemberRelationship(reducedRelation)) {
          await addToHistory(
            OnboardingUserConfirmedRelationUsingOpenAI({
              personId,
              relationship: reducedRelation,
              userId,
            })
          )
        } else {
          throw new Error('confirmOpenAIRelationship found invalid relationship')
        }
      } catch (error) {
        throw new Error('confirmOpenAIRelationship could not parse stringifiedRelationship')
      }
    }

    const props = await getBienvenuePageProps(request.session.user!.id)

    return responseAsHtml(
      request,
      response,
      BienvenuePage({
        ...props,
      })
    )
  })
