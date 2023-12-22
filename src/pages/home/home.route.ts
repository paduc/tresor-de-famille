import multer from 'multer'
import fs from 'node:fs'
import { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { uploadPhoto } from '../../dependencies/photo-storage'
import { personsIndex } from '../../dependencies/search'
import { AppUserId } from '../../domain/AppUserId'
import { zIsFaceId } from '../../domain/FaceId'
import { FamilyId } from '../../domain/FamilyId'
import { zIsPhotoId } from '../../domain/PhotoId'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { UserConfirmedHisFace } from '../../events/onboarding/UserConfirmedHisFace'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself'
import { makePersonId } from '../../libs/makePersonId'
import { makePhotoId } from '../../libs/makePhotoId'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { getPersonForUser } from '../_getPersonForUser'
import { pageRouter } from '../pageRouter'
import { detectFacesInPhotoUsingAWS } from '../photo/recognizeFacesInChatPhoto/detectFacesInPhotoUsingAWS'
import { HomePage } from './HomePage'
import { getHomePageProps } from './getHomePageProps'
import { asFamilyId } from '../../libs/typeguards'

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

      if (request.session.isOnboarding && !props.isOnboarding && !props.latestThreads.length) {
        return response.redirect('/thread.html')
      }

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
    const defaultFamilyId = asFamilyId(userId)

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
          familyId: defaultFamilyId,
        })
      )

      request.session.user!.name = presentation

      try {
        await personsIndex.saveObject({
          objectID: personId,
          personId,
          name: presentation,
          familyId: defaultFamilyId,
          visible_by: [`family/${defaultFamilyId}`, `user/${userId}`],
        })
      } catch (error) {
        console.error('Could not add new user to algolia index', error)
      }
    } else if (action === 'userSendsPhotoOfThemself') {
      const { file } = request

      if (!file) return new Error('We did not receive any image.')

      await uploadUserPhotoOfThemself({ file, userId, familyId: defaultFamilyId })
    } else if (action === 'confirmFaceIsUser') {
      const { faceId, photoId } = z
        .object({
          faceId: zIsFaceId,
          photoId: zIsPhotoId,
        })
        .parse(request.body)

      const person = await getPersonForUser({ userId })
      if (!person) {
        throw new Error("Impossible d'ajouter un visage à une personne inexistante.")
      }
      await addToHistory(
        UserConfirmedHisFace({
          userId,
          photoId,
          faceId,
          personId: person.personId,
          familyId: defaultFamilyId,
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
      userId,
      familyId,
    })
  )

  await detectFacesInPhotoUsingAWS({ file, photoId })
}
