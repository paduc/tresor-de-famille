import multer from 'multer'
import fs from 'node:fs'
import { z } from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { HomePage } from './HomePage'
import { getHomePageProps } from './getHomePageProps'
import { addToHistory } from '../../dependencies/addToHistory'
import { personsIndex } from '../../dependencies/search'
import { UUID, zIsUUID } from '../../domain'
import { UserConfirmedHisFace } from '../../events/onboarding/UserConfirmedHisFace'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself'
import { getUuid } from '../../libs/getUuid'
import { getPersonIdForUserId } from '../_getPersonIdForUserId.query'
import { uploadPhoto } from '../../dependencies/photo-storage'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { detectFacesInPhotoUsingAWS } from '../photo/recognizeFacesInChatPhoto/detectFacesInPhotoUsingAWS'
import { zIsFaceId } from '../../domain/FaceId'
import { makePersonId } from '../../libs/makePersonId'
import { zIsPhotoId } from '../../domain/PhotoId'
import { makePhotoId } from '../../libs/makePhotoId'

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

      responseAsHtml(request, response, HomePage(props))
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

      const personId = makePersonId()
      await addToHistory(
        UserNamedThemself({
          userId,
          personId,
          name: presentation,
        })
      )

      request.session.user!.name = presentation

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
    } else if (action === 'confirmFaceIsUser') {
      const { faceId, photoId } = z
        .object({
          faceId: zIsFaceId,
          photoId: zIsPhotoId,
        })
        .parse(request.body)

      const personId = await getPersonIdForUserId(userId)
      await addToHistory(
        UserConfirmedHisFace({
          userId,
          photoId,
          faceId,
          personId,
        })
      )
    }
    return response.redirect('/')
  })

type UploadUserPhotoOfThemselfArgs = {
  file: Express.Multer.File
  userId: UUID
}
async function uploadUserPhotoOfThemself({ file, userId }: UploadUserPhotoOfThemselfArgs) {
  const { path: originalPath } = file
  const photoId = makePhotoId()

  const location = await uploadPhoto({ contents: fs.createReadStream(originalPath), id: photoId })

  await addToHistory(
    OnboardingUserUploadedPhotoOfThemself({
      photoId,
      location,
      uploadedBy: userId,
    })
  )

  await detectFacesInPhotoUsingAWS({ file, photoId })
}

// .post(requireAuth(), upload.single('photo'), async (request, response) => {
//   const { action } = z
//     .object({
//       // TODO: check if valid action .oneOf()
//       action: z.string(),
//     })
//     .parse(request.body)

//   const userId = request.session.user!.id

//   if (action === 'submitPresentation') {
//     const { presentation } = z
//       .object({
//         presentation: z.string(),
//       })
//       .parse(request.body)

//     const personId = makePersonId()
//     await addToHistory(
//       UserNamedThemself({
//         userId,
//         personId,
//         name: presentation,
//       })
//     )

//     request.session.user!.name = presentation

//     try {
//       await personsIndex.saveObject({
//         objectID: personId,
//         personId,
//         name: presentation,
//         visible_by: [`person/${personId}`, `user/${userId}`],
//       })
//     } catch (error) {
//       console.error('Could not add new user to algolia index', error)
//     }
//   } else if (action === 'userSendsPhotoOfThemself') {
//     const { file } = request

//     if (!file) return new Error('We did not receive any image.')

//     await uploadUserPhotoOfThemself({ file, userId })
//   } else if (action === 'userSendsPhotoOfFamily') {
//     const { file } = request

//     if (!file) return new Error('We did not receive any image.')

//     await uploadUserPhotoOfFamily({ file, userId })
//   } else if (action === 'confirmFaceIsUser') {
//     const { faceId, photoId } = z
//       .object({
//         faceId: zIsFaceId,
//         photoId: zIsPhotoId,
//       })
//       .parse(request.body)

//     const personId = await getPersonIdForUserId(userId)
//     await addToHistory(
//       UserConfirmedHisFace({
//         userId,
//         photoId,
//         faceId,
//         personId,
//       })
//     )
//   } else if (action === 'submitFamilyMemberName') {
//     const { faceId, photoId, newFamilyMemberName } = z
//       .object({
//         faceId: zIsFaceId,
//         photoId: zIsPhotoId,
//         newFamilyMemberName: z.string(),
//       })
//       .parse(request.body)

//     if (newFamilyMemberName.length > 0) {
//       const personId = makePersonId()
//       await addToHistory(
//         UserNamedPersonInPhoto({
//           userId,
//           photoId,
//           faceId,
//           personId,
//           name: newFamilyMemberName,
//         })
//       )

//       try {
//         await personsIndex.saveObject({
//           objectID: personId,
//           personId,
//           name: newFamilyMemberName,
//           visible_by: [`person/${personId}`, `user/${userId}`],
//         })
//       } catch (error) {
//         console.error('Could not add new family member to algolia index', error)
//       }
//     } else {
//       const { existingFamilyMemberId } = z
//         .object({
//           existingFamilyMemberId: zIsUUID,
//         })
//         .parse(request.body)
//       await addToHistory(
//         UserRecognizedPersonInPhoto({
//           userId,
//           photoId,
//           faceId,
//           personId: existingFamilyMemberId,
//         })
//       )
//     }
//   } else if (action === 'ignoreFamilyMemberFaceInPhoto') {
//     const { faceId, photoId } = z
//       .object({
//         faceId: zIsFaceId,
//         photoId: zIsPhotoId,
//       })
//       .parse(request.body)
//     await addToHistory(
//       FaceIgnoredInPhoto({
//         ignoredBy: userId,
//         photoId,
//         faceId,
//       })
//     )
//   } else if (action === 'ignoreOtherFamilyMemberFacesInPhoto') {
//     const { photoId } = z
//       .object({
//         photoId: zIsPhotoId,
//       })
//       .parse(request.body)

//     // TODO: get un-annoted faces from the photo and ignore them all (FaceIgnoredInPhoto)
//   } else if (action === 'submitRelationship') {
//     const { personId, userAnswer } = z
//       .object({
//         personId: zIsPersonId,
//         userAnswer: z.string(),
//       })
//       .parse(request.body)
//     await parseRelationshipUsingOpenAI({
//       userId,
//       personId,
//       userAnswer,
//     })
//   } else if (action === 'ignoreRelationship') {
//     const { personId } = z
//       .object({
//         personId: zIsPersonId,
//       })
//       .parse(request.body)
//     await addToHistory(UserIgnoredRelationship({ personId, userId }))
//   } else if (action === 'startFirstThread') {
//     const { message } = z
//       .object({
//         message: z.string(),
//       })
//       .parse(request.body)
//     const threadId = getUuid()
//     await addToHistory(
//       OnboardingUserStartedFirstThread({
//         message,
//         userId,
//         threadId,
//       })
//     )
//   } else if (action === 'confirmOpenAIRelationship') {
//     try {
//       const { stringifiedRelationship, personId } = z
//         .object({
//           personId: zIsPersonId,
//           stringifiedRelationship: z.string(),
//         })
//         .parse(request.body)

//       const parsedRelation = JSON.parse(stringifiedRelationship)
//       const { relationship, side, precision } = z
//         .object({
//           relationship: z.string(),
//           side: z.string().optional(),
//           precision: z.string().optional(),
//         })
//         .parse(parsedRelation)
//       const reducedRelation = { relationship, side, precision }

//       if (isValidFamilyMemberRelationship(reducedRelation)) {
//         await addToHistory(
//           UserConfirmedRelationUsingOpenAI({
//             personId,
//             relationship: reducedRelation,
//             userId,
//           })
//         )
//       } else {
//         throw new Error('confirmOpenAIRelationship found invalid relationship')
//       }
//     } catch (error) {
//       throw new Error('confirmOpenAIRelationship could not parse stringifiedRelationship')
//     }
//   } else if (action === 'familyMemberAnnotationIsDone') {
//     await addToHistory(
//       OnboardingFamilyMemberAnnotationIsDone({
//         userId,
//       })
//     )
//   } else if (action === 'gotoTransmission') {
//     await addToHistory(
//       OnboardingReadyForBeneficiaries({
//         userId,
//       })
//     )
//   } else if (action === 'choseTransmissionMode') {
//     try {
//       const { mode } = z
//         .object({
//           mode: z.enum(['tdf-detection-contacts-beneficiaries', 'user-distributes-codes']),
//         })
//         .parse(request.body)

//       if (mode === 'tdf-detection-contacts-beneficiaries') {
//         const { beneficiaryName, beneficiaryEmail, beneficiaryAddress } = request.body
//         let index = 0

//         const beneficiaries = []
//         if (Array.isArray(beneficiaryName)) {
//           for (const name of beneficiaryName) {
//             const trimmedName = name?.trim()
//             if (!trimmedName || !trimmedName.length) continue
//             beneficiaries.push({
//               name: trimmedName,
//               email: beneficiaryEmail[index]?.trim(),
//               address: beneficiaryAddress[index]?.trim(),
//             })
//           }
//         } else {
//           beneficiaries.push({
//             name: beneficiaryName,
//             email: beneficiaryEmail,
//             address: beneficiaryAddress,
//           })
//         }

//         const safeBeneficiaries = z
//           .array(
//             z.object({
//               name: z.string(),
//               email: z.string().optional(),
//               address: z.string().optional(),
//             })
//           )
//           .parse(beneficiaries)

//         await addToHistory(
//           BeneficiariesChosen({
//             userId,
//             mode,
//             // @ts-ignore
//             beneficiaries: safeBeneficiaries,
//           })
//         )
//       }

//       if (mode === 'user-distributes-codes') {
//         await addToHistory(
//           BeneficiariesChosen({
//             userId,
//             mode,
//           })
//         )
//       }
//     } catch (error) {
//       console.error('choseTransmissionMode', error)
//       throw new Error('choseTransmissionMode could not parse result')
//     }
//   }

//   return response.redirect('/')
// })
