import { z } from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { FamilyPage } from './FamilyPage'
import { FamilyPageURL } from './FamilyPageURL'
import { getFamilyPageProps } from './getFamilyPageProps'
import { zIsUUID } from '../../domain'
import { addToHistory } from '../../dependencies/addToHistory'
import { UserCreatedRelationshipWithNewPerson } from './UserCreatedRelationshipWithNewPerson'
import { UserCreatedNewRelationship } from './UserCreatedNewRelationship'

pageRouter.route(FamilyPageURL()).get(requireAuth(), async (request, response) => {
  // const { personId } = z.object({ personId: zIsUUID }).parse(request.params)

  const props = await getFamilyPageProps(request.session.user!.id)

  responseAsHtml(request, response, FamilyPage(props))
})

pageRouter.route('/family/saveNewRelationship').post(requireAuth(), async (request, response) => {
  const userId = request.session.user!.id
  const { newPerson, relationship } = z
    .object({
      newPerson: z.object({ personId: zIsUUID, name: z.string() }).optional(),
      relationship: z.discriminatedUnion('type', [
        z.object({ type: z.literal('parent'), parentId: zIsUUID, childId: zIsUUID }),
        z.object({ type: z.literal('spouses'), spouseIds: z.tuple([zIsUUID, zIsUUID]) }),
        z.object({ type: z.literal('friends'), friendIds: z.tuple([zIsUUID, zIsUUID]) }),
      ]),
    })
    .parse(request.body)

  if (newPerson) {
    await addToHistory(
      UserCreatedRelationshipWithNewPerson({
        relationship,
        newPerson,
        userId,
      })
    )
  } else {
    await addToHistory(
      UserCreatedNewRelationship({
        relationship,
        userId,
      })
    )
  }

  return response.status(200).send()
})
