import { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { getEventList } from '../../dependencies/getEventList'
import { personsIndex } from '../../dependencies/search'
import { AppUserId } from '../../domain/AppUserId'
import { zIsPersonId } from '../../domain/PersonId'
import { RelationshipId, zIsRelationshipId } from '../../domain/RelationshipId'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { FamilyPage } from './FamilyPage'
import { FamilyPageURL } from './FamilyPageURL'
import { UserCreatedNewRelationship } from './UserCreatedNewRelationship'
import { UserCreatedRelationshipWithNewPerson } from './UserCreatedRelationshipWithNewPerson'
import { UserRemovedRelationship } from './UserRemovedRelationship'
import { getFamilyPageProps } from './getFamilyPageProps'

pageRouter.route(FamilyPageURL()).get(requireAuth(), async (request, response) => {
  const props = await getFamilyPageProps(request.session.user!.id)

  responseAsHtml(request, response, FamilyPage(props))
})

const zIsRelationship = z
  .object({
    id: zIsRelationshipId,
  })
  .and(
    z.discriminatedUnion('type', [
      z.object({ type: z.literal('parent'), parentId: zIsPersonId, childId: zIsPersonId }),
      z.object({ type: z.literal('spouses'), spouseIds: z.tuple([zIsPersonId, zIsPersonId]) }),
      z.object({ type: z.literal('friends'), friendIds: z.tuple([zIsPersonId, zIsPersonId]) }),
    ])
  )

type Relationship = z.infer<typeof zIsRelationship>

pageRouter.route('/family/saveNewRelationship').post(requireAuth(), async (request, response) => {
  const userId = request.session.user!.id
  const { newPerson, relationship, secondaryRelationships } = z
    .object({
      newPerson: z.object({ personId: zIsPersonId, name: z.string() }).optional(),
      relationship: zIsRelationship,
      secondaryRelationships: z.array(zIsRelationship).optional(),
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

  if (secondaryRelationships) {
    for (const secondaryRelationship of secondaryRelationships) {
      await addToHistory(
        UserCreatedNewRelationship({
          relationship: secondaryRelationship,
          userId,
        })
      )
    }
  }

  return response.status(200).send()
})

pageRouter.route('/family/removeRelationship').post(requireAuth(), async (request, response) => {
  const userId = request.session.user!.id
  const { relationshipId } = z
    .object({
      relationshipId: zIsRelationshipId,
    })
    .parse(request.body)

  if (await relationshipExists({ userId, relationshipId })) {
    await addToHistory(UserRemovedRelationship({ relationshipId, userId }))
  }

  return response.status(200).send()
})

async function relationshipExists({ userId, relationshipId }: { userId: AppUserId; relationshipId: RelationshipId }) {
  const existingRelationships = await getEventList<UserCreatedNewRelationship | UserCreatedRelationshipWithNewPerson>(
    ['UserCreatedNewRelationship', 'UserCreatedRelationshipWithNewPerson'],
    { userId }
  )

  const existingRelationshipWithId = existingRelationships.find(({ payload }) => payload.relationship.id === relationshipId)

  return !!existingRelationshipWithId
}
