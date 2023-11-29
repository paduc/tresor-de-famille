import { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { makeFamilyShareCode } from '../../libs/makeFamilyShareCode'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { SharePage } from './SharePage'
import { UserCreatedNewFamily } from './UserCreatedNewFamily'
import { getSharePageProps } from './getSharePageProps'
import { PersonClonedForSharing } from './PersonClonedForSharing'
import { makePersonId } from '../../libs/makePersonId'
import { getFaceAndPhotoForPerson } from '../_getProfilePicUrlForPerson'
import { FamilyId } from '../../domain/FamilyId'
import { getPersonForUser } from '../_getPersonForUser'

pageRouter
  .route('/share.html')
  .get(requireAuth(), async (request, response) => {
    const userId = request.session.user!.id
    const props = await getSharePageProps(userId)

    responseAsHtml(request, response, SharePage(props))
  })
  .post(requireAuth(), async (request, response) => {
    const { action } = z
      .object({
        action: z.string(),
      })
      .parse(request.body)

    const userId = request.session.user!.id

    if (action === 'createNewFamily') {
      const { familyName, about } = z
        .object({
          familyName: z.string(),
          about: z.string(),
        })
        .parse(request.body)

      const familyId = makeFamilyId()

      await addToHistory(
        UserCreatedNewFamily({
          familyName,
          about,
          familyId,
          shareCode: makeFamilyShareCode(familyId),
          userId,
        })
      )

      // Create a new person identical to the user's person
      const previousFamilyId = userId as string as FamilyId
      const userPerson = await getPersonForUser({ userId })
      if (userPerson) {
        let profilePicPhotoId
        let faceId

        const faceAndPhoto = await getFaceAndPhotoForPerson({ userId, personId: userPerson.personId })

        if (faceAndPhoto) {
          faceId = faceAndPhoto.faceId
          profilePicPhotoId = faceAndPhoto.photoId
        }

        await addToHistory(
          PersonClonedForSharing({
            familyId,
            userId,
            personId: makePersonId(),
            name: userPerson.name,
            profilePicPhotoId,
            faceId,
            clonedFrom: {
              personId: userPerson.personId,
              familyId: previousFamilyId,
            },
          })
        )
      }

      return response.redirect('/share.html')
    }

    throw new Error('POST on share with unknown action')
  })
