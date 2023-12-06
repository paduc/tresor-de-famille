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
import { FamilyPageURL, FamilyPageURLWithFamily } from './FamilyPageURL'
import { UserCreatedNewRelationship } from './UserCreatedNewRelationship'
import { UserCreatedRelationshipWithNewPerson } from './UserCreatedRelationshipWithNewPerson'
import { UserRemovedRelationship } from './UserRemovedRelationship'
import { getFamilyPageProps } from './getFamilyPageProps'
import { FamilyId, zIsFamilyId } from '../../domain/FamilyId'
import { asFamilyId } from '../../libs/typeguards'

pageRouter.route(FamilyPageURLWithFamily()).get(requireAuth(), async (request, response) => {
  const { familyId } = z.object({ familyId: zIsFamilyId.optional() }).parse(request.params)
  const userId = request.session.user!.id

  try {
    const props = await getFamilyPageProps({
      userId: request.session.user!.id,
      familyId: familyId || asFamilyId(userId),
    })
    responseAsHtml(request, response, FamilyPage(props))
  } catch (error) {
    console.error("La personne essaie d'aller sur la page famille alors qu'elle ne s'est pas encore présentée", error)
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
  const { newPerson, relationship, secondaryRelationships, familyId } = z
    .object({
      newPerson: z.object({ personId: zIsPersonId, name: z.string() }).optional(),
      relationship: zIsRelationship,
      secondaryRelationships: z.array(zIsRelationship).optional(),
      familyId: zIsFamilyId,
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
        familyId,
      })
    )

    try {
      const { personId, name } = newPerson
      await personsIndex.saveObject({
        objectID: personId,
        personId,
        name,
        familyId,
        visible_by: [`family/${familyId}}`, `user/${userId}`],
      })
    } catch (error) {
      console.error('Could not add new family member to algolia index', error)
    }
  } else {
    await addToHistory(
      UserCreatedNewRelationship({
        relationship,
        userId,
        familyId,
      })
    )
  }

  if (secondaryRelationships) {
    for (const secondaryRelationship of secondaryRelationships) {
      await addToHistory(
        UserCreatedNewRelationship({
          relationship: secondaryRelationship,
          userId,
          familyId,
        })
      )
    }
  }

  return response.status(200).send()
})

pageRouter.route('/family/removeRelationship').post(requireAuth(), async (request, response) => {
  const userId = request.session.user!.id
  const defaultFamilyId = userId as string as FamilyId
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
        familyId: defaultFamilyId,
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
