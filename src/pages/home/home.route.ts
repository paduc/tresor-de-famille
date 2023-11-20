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
import { getPersonForUserInFamily } from '../_getPersonForUserInFamily'
import { uploadPhoto } from '../../dependencies/photo-storage'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { detectFacesInPhotoUsingAWS } from '../photo/recognizeFacesInChatPhoto/detectFacesInPhotoUsingAWS'
import { zIsFaceId } from '../../domain/FaceId'
import { makePersonId } from '../../libs/makePersonId'
import { zIsPhotoId } from '../../domain/PhotoId'
import { makePhotoId } from '../../libs/makePhotoId'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'

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
    const familyId = request.session.currentFamilyId!

    const currentFamilyId = request.session.currentFamilyId!
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
          familyId: currentFamilyId,
        })
      )

      request.session.user!.name = presentation

      try {
        await personsIndex.saveObject({
          objectID: personId,
          personId,
          name: presentation,
          visible_by: [`family/${currentFamilyId}`, `user/${userId}`],
        })
      } catch (error) {
        console.error('Could not add new user to algolia index', error)
      }
    } else if (action === 'userSendsPhotoOfThemself') {
      const { file } = request

      if (!file) return new Error('We did not receive any image.')

      await uploadUserPhotoOfThemself({ file, userId, familyId: currentFamilyId })
    } else if (action === 'confirmFaceIsUser') {
      const { faceId, photoId } = z
        .object({
          faceId: zIsFaceId,
          photoId: zIsPhotoId,
        })
        .parse(request.body)

      const person = await getPersonForUserInFamily({ userId, familyId })
      if (!person) {
        throw new Error("Impossible d'ajouter un visage à une personne inexistante.")
      }
      await addToHistory(
        UserConfirmedHisFace({
          userId,
          photoId,
          faceId,
          personId: person.personId,
          familyId: currentFamilyId,
        })
      )
    }
    return response.redirect('/')
  })

type UploadUserPhotoOfThemselfArgs = {
  file: Express.Multer.File
  userId: AppUserId
  familyId: FamilyId
}
async function uploadUserPhotoOfThemself({ file, userId, familyId }: UploadUserPhotoOfThemselfArgs) {
  const { path: originalPath } = file
  const photoId = makePhotoId()

  const location = await uploadPhoto({ contents: fs.createReadStream(originalPath), id: photoId })

  await addToHistory(
    OnboardingUserUploadedPhotoOfThemself({
      photoId,
      location,
      uploadedBy: userId,
      familyId,
    })
  )

  await detectFacesInPhotoUsingAWS({ file, photoId })
}
