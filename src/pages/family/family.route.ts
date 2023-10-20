import { z } from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { FamilyPage } from './FamilyPage'
import { FamilyPageURL } from './FamilyPageURL'
import { getFamilyPageProps } from './getFamilyPageProps'
import { UUID, zIsUUID } from '../../domain'
import { addToHistory } from '../../dependencies/addToHistory'
import { UserCreatedRelationshipWithNewPerson } from './UserCreatedRelationshipWithNewPerson'
import { UserCreatedNewRelationship } from './UserCreatedNewRelationship'
import { personsIndex } from '../../dependencies/search'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { getUuid } from '../../libs/getUuid'
import { getEventList } from '../../dependencies/getEventList'
import { UserRemovedRelationship } from './UserRemovedRelationship'

pageRouter.route(FamilyPageURL()).get(requireAuth(), async (request, response) => {
  // const { personId } = z.object({ personId: zIsUUID }).parse(request.params)

  const props = await getFamilyPageProps(request.session.user!.id)

  responseAsHtml(request, response, FamilyPage(props))
})

const zIsRelationship = z
  .object({
    id: zIsUUID,
  })
  .and(
    z.discriminatedUnion('type', [
      z.object({ type: z.literal('parent'), parentId: zIsUUID, childId: zIsUUID }),
      z.object({ type: z.literal('spouses'), spouseIds: z.tuple([zIsUUID, zIsUUID]) }),
      z.object({ type: z.literal('friends'), friendIds: z.tuple([zIsUUID, zIsUUID]) }),
    ])
  )

type Relationship = z.infer<typeof zIsRelationship>

pageRouter.route('/family/saveNewRelationship').post(requireAuth(), async (request, response) => {
  const userId = request.session.user!.id
  const { newPerson, relationship, secondaryRelationship } = z
    .object({
      newPerson: z.object({ personId: zIsUUID, name: z.string() }).optional(),
      relationship: zIsRelationship,
      secondaryRelationship: zIsRelationship.optional(),
    })
    .parse(request.body)

  if (await relationshipExists({ userId, relationshipId: relationship.id })) {
    return response.status(403).send()
  }

  if (newPerson) {
    await addToHistory(
      UserCreatedRelationshipWithNewPerson({
        relationship,
        newPerson,
        userId,
      })
    )

    try {
      const { personId, name } = newPerson
      await personsIndex.saveObject({
        objectID: personId,
        personId,
        name,
        visible_by: [`person/${personId}`, `user/${userId}`],
      })
    } catch (error) {
      console.error('Could not add new family member to algolia index', error)
    }
  } else {
    await addToHistory(
      UserCreatedNewRelationship({
        relationship,
        userId,
      })
    )
  }

  if (secondaryRelationship) {
    await addToHistory(
      UserCreatedNewRelationship({
        relationship: secondaryRelationship,
        userId,
      })
    )
  }

  return response.status(200).send()
})

pageRouter.route('/family/removeRelationship').post(requireAuth(), async (request, response) => {
  const userId = request.session.user!.id
  const { relationshipId } = z
    .object({
      relationshipId: zIsUUID,
    })
    .parse(request.body)

  if (await relationshipExists({ userId, relationshipId })) {
    await addToHistory(UserRemovedRelationship({ relationshipId, userId }))
  }

  return response.status(200).send()
})

async function relationshipExists({ userId, relationshipId }: { userId: UUID; relationshipId: UUID }) {
  const existingRelationships = await getEventList<UserCreatedNewRelationship | UserCreatedRelationshipWithNewPerson>(
    ['UserCreatedNewRelationship', 'UserCreatedRelationshipWithNewPerson'],
    { userId }
  )

  const existingRelationshipWithId = existingRelationships.find(({ payload }) => payload.relationship.id === relationshipId)

  return !!existingRelationshipWithId
}
