import { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { personsIndex } from '../../dependencies/search'
import { AppUserId } from '../../domain/AppUserId'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { makeFamilyShareCode } from '../../libs/makeFamilyShareCode'
import { FamilyColorCodes } from '../../libs/ssr/FamilyColorCodes'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { LoggedInSession } from '../_components/SessionContext'
import { getPersonForUser } from '../_getPersonForUser'
import { getUserFamilies } from '../_getUserFamilies'
import { pageRouter } from '../pageRouter'
import { InvitationWithCodeUrl } from './InvitationWithCodeUrl'
import { PersonAutoShareWithFamilyCreation } from './PersonAutoShareWithFamilyCreation'
import { SharePage } from './SharePage'
import { UserCreatedNewFamily } from './UserCreatedNewFamily'
import { getSharePageProps } from './getSharePageProps'
import { getFamiliesWithAccessToPerson } from '../_getFamiliesWithAccessToPerson'

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

      await createNewFamily({ userId, familyName, about })

      return response.redirect('/share.html')
    } else if (action === 'createNewFamilyClientSide') {
      const { familyName, about } = z
        .object({
          familyName: z.string(),
          about: z.string(),
        })
        .parse(request.body)

      await createNewFamily({ userId, familyName, about })

      const newUserFamilies: LoggedInSession['userFamilies'] = (await getUserFamilies(userId)).map(
        ({ familyId, familyName, about, shareCode }, index) => ({
          familyId,
          familyName,
          about,
          isUserSpace: (familyId as string) === (userId as string),
          color: FamilyColorCodes[index % FamilyColorCodes.length],
          shareUrl: InvitationWithCodeUrl(familyId, shareCode),
        })
      )

      return response.setHeader('Content-Type', 'application/json').status(200).send({
        newUserFamilies,
      })
    }

    throw new Error('POST on share with unknown action')
  })

async function createNewFamily({ userId, familyName, about }: { userId: AppUserId; familyName: string; about: string }) {
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

  const userPerson = await getPersonForUser({ userId })
  if (!userPerson) return

  const personId = userPerson.personId
  await addToHistory(
    PersonAutoShareWithFamilyCreation({
      personId,
      familyId,
    })
  )
  try {
    const personFamilies = await getFamiliesWithAccessToPerson({ personId })
    await personsIndex.partialUpdateObject({
      objectID: personId,
      visible_by: personFamilies.map((familyId) => `family/${familyId}`),
    })
  } catch (error) {
    console.error('Could not add person to algolia index', error)
  }
}
