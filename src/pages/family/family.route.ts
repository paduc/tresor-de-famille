import { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { getEventList } from '../../dependencies/getEventList'
import { personsIndex } from '../../dependencies/search'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId, zIsFamilyId } from '../../domain/FamilyId'
import { PersonId, zIsPersonId } from '../../domain/PersonId'
import { RelationshipId, zIsRelationshipId } from '../../domain/RelationshipId'
import { exhaustiveGuard } from '../../libs/exhaustiveGuard'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { asFamilyId } from '../../libs/typeguards'
import { createCloneIfOutsideOfFamily } from '../_createCloneIfOutsideOfFamily'
import { pageRouter } from '../pageRouter'
import { FamilyPage } from './FamilyPage'
import { FamilyPageURLWithFamily } from './FamilyPageURL'
import { UserCreatedNewRelationship } from './UserCreatedNewRelationship'
import { UserCreatedRelationshipWithNewPerson } from './UserCreatedRelationshipWithNewPerson'
import { UserRemovedRelationship } from './UserRemovedRelationship'
import { getFamilyPageProps, getFamilyPersons, getFamilyRelationships } from './getFamilyPageProps'
import { zIsRelationship } from './zIsRelationship'

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
        relationship: await translateRelationshipForFamily({ relationship, familyId, userId }),
        userId,
        familyId,
      })
    )
  }

  if (secondaryRelationships) {
    for (const secondaryRelationship of secondaryRelationships) {
      await addToHistory(
        UserCreatedNewRelationship({
          relationship: await translateRelationshipForFamily({
            relationship: secondaryRelationship,
            familyId,
            userId,
          }),
          userId,
          familyId,
        })
      )
    }
  }

  const persons = await getFamilyPersons({ userId, familyId })
  const relationships = await getFamilyRelationships(
    persons.map((p) => p.personId),
    familyId
  )
  return response.setHeader('Content-Type', 'application/json').status(200).send({ persons, relationships })
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

async function translateRelationshipForFamily({
  relationship,
  familyId,
  userId,
}: {
  relationship: Relationship
  familyId: FamilyId
  userId: AppUserId
}): Promise<Relationship> {
  const relationshipType = relationship.type
  switch (relationshipType) {
    case 'friends': {
      const [person1Id, person2Id] = relationship.friendIds
      const friendIds: [PersonId, PersonId] = [
        await createCloneIfOutsideOfFamily({ personId: person1Id, familyId, userId }),
        await createCloneIfOutsideOfFamily({ personId: person2Id, familyId, userId }),
      ]

      return {
        id: relationship.id,
        type: 'friends',
        friendIds,
      }
    }
    case 'spouses': {
      const [person1Id, person2Id] = relationship.spouseIds
      const spouseIds: [PersonId, PersonId] = [
        await createCloneIfOutsideOfFamily({ personId: person1Id, familyId, userId }),
        await createCloneIfOutsideOfFamily({ personId: person2Id, familyId, userId }),
      ]

      return {
        id: relationship.id,
        type: 'spouses',
        spouseIds,
      }
    }
    case 'parent': {
      const { childId, parentId } = relationship

      const newChildId = await createCloneIfOutsideOfFamily({ personId: childId, familyId, userId })
      const newParentId = await createCloneIfOutsideOfFamily({ personId: parentId, familyId, userId })

      return {
        id: relationship.id,
        type: 'parent',
        childId: newChildId,
        parentId: newParentId,
      }
    }
    default:
      exhaustiveGuard(relationshipType)
  }
}
