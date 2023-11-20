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
import { getPersonForUserInFamily } from '../_getPersonForUserInFamily'
import { PersonClonedForSharing } from './PersonClonedForSharing'
import { makePersonId } from '../../libs/makePersonId'

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
      const previousFamilyId = request.session.currentFamilyId!
      const userPerson = await getPersonForUserInFamily({ userId, familyId: previousFamilyId })
      if (userPerson) {
        await addToHistory(
          PersonClonedForSharing({
            familyId,
            userId,
            personId: makePersonId(),
            name: userPerson.name,
            clonedFrom: {
              personId: userPerson.personId,
              familyId: previousFamilyId,
            },
          })
        )
      }

      request.session.currentFamilyId = familyId

      return response.redirect('/share.html')
    }

    throw new Error('POST on share with unknown action')
  })
