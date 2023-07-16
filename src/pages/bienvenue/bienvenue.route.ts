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
import { OnboardingUserStartedFirstThread } from './step4-start-thread/OnboardingUserStartedFirstThread'

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
    const { action } = z
      .object({
        // TODO: check if valid action .oneOf()
        action: z.string(),
      })
      .parse(request.body)

    const userId = request.session.user!.id

    if (action === 'submitPresentation') {
      const { presentation } = z
        .object({
          presentation: z.string(),
        })
        .parse(request.body)

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
    } else if (action === 'confirmFaceIsUser') {
      const { faceId, photoId } = z
        .object({
          faceId: zIsUUID,
          photoId: zIsUUID,
        })
        .parse(request.body)

      const personId = await getPersonIdForUserId(userId)
      await addToHistory(
        OnboardingUserConfirmedHisFace({
          userId,
          photoId,
          faceId,
          personId,
        })
      )
    } else if (action === 'submitFamilyMemberName') {
      const { faceId, photoId, newFamilyMemberName } = z
        .object({
          faceId: zIsUUID,
          photoId: zIsUUID,
          newFamilyMemberName: z.string(),
        })
        .parse(request.body)

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
    } else if (action === 'ignoreFamilyMemberFaceInPhoto') {
      const { faceId, photoId } = z
        .object({
          faceId: zIsUUID,
          photoId: zIsUUID,
        })
        .parse(request.body)
      await addToHistory(
        OnboardingFaceIgnoredInFamilyPhoto({
          ignoredBy: userId,
          photoId,
          faceId,
        })
      )
    } else if (action === 'submitRelationship') {
      const { personId, userAnswer } = z
        .object({
          personId: zIsUUID,
          userAnswer: z.string(),
        })
        .parse(request.body)
      await parseRelationshipUsingOpenAI({
        userId,
        personId,
        userAnswer,
      })
    } else if (action === 'ignoreRelationship') {
      const { personId } = z
        .object({
          personId: zIsUUID,
        })
        .parse(request.body)
      await addToHistory(OnboardingUserIgnoredRelationship({ personId, userId }))
    } else if (action === 'startFirstThread') {
      const { message } = z
        .object({
          message: z.string(),
        })
        .parse(request.body)
      const threadId = getUuid()
      await addToHistory(
        OnboardingUserStartedFirstThread({
          message,
          userId,
          threadId,
        })
      )
    } else if (action === 'confirmOpenAIRelationship') {
      try {
        const { stringifiedRelationship: parsedRelation, personId } = z
          .object({
            personId: zIsUUID,
            stringifiedRelationship: z.object({
              relationship: z.string(),
              side: z.string().optional(),
              precision: z.string().optional(),
            }),
          })
          .parse(request.body)

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
