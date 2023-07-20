import multer from 'multer'
import { requireAuth } from '../../dependencies/authn'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { HomePage } from './HomePage'
import { getHomePageProps } from './getHomePageProps'
import { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { personsIndex } from '../../dependencies/search'
import { zIsUUID } from '../../domain'
import { getUuid } from '../../libs/getUuid'
import { getPersonIdForUserId } from '../_getPersonIdForUserId.query'
import { OnboardingUserNamedThemself } from '../bienvenue/step1-userTellsAboutThemselves/OnboardingUserNamedThemself'
import { uploadUserPhotoOfThemself } from '../bienvenue/step1-userTellsAboutThemselves/uploadUserPhotoOfThemself'
import { OnboardingUserConfirmedHisFace } from '../bienvenue/step2-userUploadsPhoto/OnboardingUserConfirmedHisFace'
import { uploadUserPhotoOfFamily } from '../bienvenue/step2-userUploadsPhoto/uploadUserPhotoOfFamily'
import { isValidFamilyMemberRelationship } from '../bienvenue/step3-learnAboutUsersFamily/FamilyMemberRelationship'
import { OnboardingFaceIgnoredInFamilyPhoto } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingFaceIgnoredInFamilyPhoto'
import { OnboardingUserConfirmedRelationUsingOpenAI } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingUserConfirmedRelationUsingOpenAI'
import { OnboardingUserIgnoredRelationship } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingUserIgnoredRelationship'
import { OnboardingUserNamedPersonInFamilyPhoto } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingUserNamedPersonInFamilyPhoto'
import { OnboardingUserRecognizedPersonInFamilyPhoto } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingUserRecognizedPersonInFamilyPhoto'
import { parseRelationshipUsingOpenAI } from '../bienvenue/step3-learnAboutUsersFamily/parseRelationshipUsingOpenAI'
import { OnboardingUserStartedFirstThread } from '../bienvenue/step4-start-thread/OnboardingUserStartedFirstThread'
import { OnboardingFamilyMemberAnnotationIsDone } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingFamilyMemberAnnotationIsDone'
import { OnboardingReadyForBeneficiaries } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingReadyForBeneficiaries'
import { OnboardingBeneficiariesChosen } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingBeneficiariesChosen'

const FILE_SIZE_LIMIT_MB = 50
const upload = multer({
  dest: 'temp/photos',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

pageRouter
  .route('/')
  .get(requireAuth(), async (request, response) => {
    try {
      const props = await getHomePageProps(request.session.user!.id)

      responseAsHtml(request, response, HomePage({ ...props }))
    } catch (error) {
      return response.send('Erreur de chargement de page home')
    }
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
    } else if (action === 'familyMemberAnnotationIsDone') {
      await addToHistory(
        OnboardingFamilyMemberAnnotationIsDone({
          userId,
        })
      )
    } else if (action === 'gotoTransmission') {
      await addToHistory(
        OnboardingReadyForBeneficiaries({
          userId,
        })
      )
    } else if (action === 'choseTransmissionMode') {
      try {
        const { mode, beneficiaryName, beneficiaryEmail, beneficiaryAddress } = z
          .object({
            mode: z.enum(['tdf-detection-contacts-beneficiaries', 'user-distributes-codes']),
            beneficiaryName: z.array(z.string()),
            beneficiaryEmail: z.array(z.string().email()),
            beneficiaryAddress: z.array(z.string()),
          })
          .parse(request.body)

        if (mode === 'tdf-detection-contacts-beneficiaries') {
          await addToHistory(
            OnboardingBeneficiariesChosen({
              userId,
              mode,
              beneficiaries: beneficiaryName
                .map((name, index) => ({
                  name,
                  email: beneficiaryEmail[index],
                  address: beneficiaryAddress[index],
                }))
                .filter(({ name }) => !name.length),
            })
          )
        }

        if (mode === 'user-distributes-codes') {
          await addToHistory(
            OnboardingBeneficiariesChosen({
              userId,
              mode,
            })
          )
        }
      } catch (error) {
        console.error('choseTransmissionMode', error)
        throw new Error('choseTransmissionMode could not parse result')
      }
    }

    return response.redirect('/')
  })
