import { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { getEventList } from '../../dependencies/getEventList'
import { personsIndex } from '../../dependencies/search'
import { AppUserId } from '../../domain/AppUserId'
import { zIsPersonId } from '../../domain/PersonId'
import { RelationshipId, zIsRelationshipId } from '../../domain/RelationshipId'
import { pageRouter } from '../pageRouter'
import { FamilyPage } from './FamilyPage'
import { FamilyPageURL } from './FamilyPageURL'
import { UserCreatedNewRelationship } from './UserCreatedNewRelationship'
import { UserCreatedRelationshipWithNewPerson } from './UserCreatedRelationshipWithNewPerson'
import { UserRemovedRelationship } from './UserRemovedRelationship'
import { getFamilyPageProps } from './getFamilyPageProps'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'

pageRouter.route(FamilyPageURL()).get(requireAuth(), async (request, response) => {
  try {
    const props = await getFamilyPageProps(request.session.user!.id)
    responseAsHtml(request, response, FamilyPage(props))
  } catch (error) {
    console.error("La personne essaie d'aller sur la page famille alors qu'elle ne s'est pas encore présentée")
    response.redirect('/')
  }
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

  const currentFamilyId = request.session.currentFamilyId!

  if (newPerson) {
    await addToHistory(
      UserCreatedRelationshipWithNewPerson({
        relationship,
        newPerson,
        userId,
        familyId: currentFamilyId,
      })
    )

    try {
      const { personId, name } = newPerson
      await personsIndex.saveObject({
        objectID: personId,
        personId,
        name,
        visible_by: [`family/${currentFamilyId}`, `user/${userId}`],
      })
    } catch (error) {
      console.error('Could not add new family member to algolia index', error)
    }
  } else {
    await addToHistory(
      UserCreatedNewRelationship({
        relationship,
        userId,
        familyId: currentFamilyId,
      })
    )
  }

  if (secondaryRelationships) {
    for (const secondaryRelationship of secondaryRelationships) {
      await addToHistory(
        UserCreatedNewRelationship({
          relationship: secondaryRelationship,
          userId,
          familyId: currentFamilyId,
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
    await addToHistory(
      UserRemovedRelationship({
        relationshipId,
        userId,
        familyId: request.session.currentFamilyId!,
      })
    )
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
