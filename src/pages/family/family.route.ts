import { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory.js'
import { requireAuth } from '../../dependencies/authn.js'
import { getEventList } from '../../dependencies/getEventList.js'
import { addFamilyVisibilityToIndex, personsIndex } from '../../dependencies/search.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId, zIsFamilyId } from '../../domain/FamilyId.js'
import { PersonId, zIsPersonId } from '../../domain/PersonId.js'
import { RelationshipId, zIsRelationshipId } from '../../domain/RelationshipId.js'
import { exhaustiveGuard } from '../../libs/exhaustiveGuard.js'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml.js'
import { asFamilyId } from '../../libs/typeguards.js'
import { isPersonSharedWithFamily } from '../_isPersonSharedWithFamily.js'
import { pageRouter } from '../pageRouter.js'
import { PersonAutoSharedWithRelationship } from '../share/PersonAutoSharedWithRelationship.js'
import { FamilyPage } from './FamilyPage.js'
import { FamilyPageURL, FamilyPageURLWithFamily } from './FamilyPageURL.js'
import { UserCreatedNewRelationship } from './UserCreatedNewRelationship.js'
import { UserCreatedRelationshipWithNewPerson } from './UserCreatedRelationshipWithNewPerson.js'
import { UserRemovedRelationship } from './UserRemovedRelationship.js'
import { getFamilyPageProps } from './getFamilyPageProps.js'
import { getFamilyTreeRelationships } from './getFamilyTreeRelationships.js'
import { getFamilyTreePersons } from './getFamilyTreePersons.js'
import { zIsRelationship } from './zIsRelationship.js'
import { OtherFamilyPage } from './OtherFamilyPage.js'
import { makePersonId } from '../../libs/makePersonId.js'
import { UserSetFamilyTreeOrigin } from './UserSetFamilyTreeOrigin.js'
import { SetOriginPersonForFamilyTreeURL } from './SetOriginPersonForFamilyTreeURL.js'
import { getUserFamilies } from '../_getUserFamilies.js'

pageRouter.route(FamilyPageURLWithFamily()).get(requireAuth(), async (request, response, next) => {
  try {
    const userId = request.session.user!.id
    const { familyId } = z.object({ familyId: zIsFamilyId }).parse(request.params)

    try {
      const props = await getFamilyPageProps({
        userId,
        familyId,
      })

      // TODO: fetch origin person from familyId (only user family has user person as origin)
      responseAsHtml(request, response, OtherFamilyPage(props))
    } catch (error) {
      console.error("La personne essaie d'aller sur la page famille alors qu'elle ne s'est pas encore présentée", error)
      response.redirect('/')
    }
  } catch (error) {
    next(error)
  }
})

pageRouter.route(FamilyPageURL()).get(requireAuth(), async (request, response, next) => {
  try {
    const userId = request.session.user!.id

    try {
      const props = await getFamilyPageProps({
        userId: request.session.user!.id,
        familyId: asFamilyId(userId),
      })

      if (props.initialPersons.length === 1) {
        // Look for family with a family tree (more than one person)
        const userFamilies = await getUserFamilies(userId)
        for (const family of userFamilies) {
          if (family.familyId !== asFamilyId(userId)) {
            const familyProps = await getFamilyPageProps({
              userId,
              familyId: family.familyId,
            })

            if (familyProps.initialPersons.length > 1) {
              return response.redirect(FamilyPageURLWithFamily(family.familyId))
            }
          }
        }
      }

      responseAsHtml(request, response, FamilyPage(props))
    } catch (error) {
      console.error("La personne essaie d'aller sur la page famille alors qu'elle ne s'est pas encore présentée", error)
      response.redirect('/')
    }
  } catch (error) {
    next(error)
  }
})

type Relationship = z.infer<typeof zIsRelationship>

pageRouter.route('/family/saveNewRelationship').post(requireAuth(), async (request, response, next) => {
  try {
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
      return response.status(200).send()
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
          visible_by: [`family/${familyId}`, `family/${userId}`],
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

      await sharePersonsInRelationshipWithFamily({ relationship, familyId })
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

        await sharePersonsInRelationshipWithFamily({
          relationship: secondaryRelationship,
          familyId,
        })
      }
    }

    const persons = await getFamilyTreePersons({ userId, familyId })
    const relationships = await getFamilyTreeRelationships(
      persons.map((p) => p.personId),
      familyId
    )
    return response.setHeader('Content-Type', 'application/json').status(200).send({ persons, relationships })
  } catch (error) {
    next(error)
  }
})

pageRouter.route('/family/removeRelationship').post(requireAuth(), async (request, response, next) => {
  try {
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
  } catch (error) {
    next(error)
  }
})

pageRouter.route(SetOriginPersonForFamilyTreeURL()).post(requireAuth(), async (request, response, next) => {
  try {
    const userId = request.session.user!.id
    const { name, familyId } = z
      .object({
        name: z.string().nonempty(),
        familyId: zIsFamilyId,
      })
      .parse(request.body)

    const personId = makePersonId()

    await addToHistory(
      UserSetFamilyTreeOrigin({
        newPerson: {
          name,
          personId,
        },
        userId,
        familyId,
      })
    )

    try {
      await personsIndex.saveObject({
        objectID: personId,
        personId,
        name,
        familyId,
        visible_by: [`family/${familyId}`, `family/${userId}`],
      })
    } catch (error) {
      console.error('Could not add new family member to algolia index', error)
      throw error
    }

    return response.status(200).json({ personId, name })
  } catch (error) {
    next(error)
  }
})

async function relationshipExists({ userId, relationshipId }: { userId: AppUserId; relationshipId: RelationshipId }) {
  const existingRelationships = await getEventList<UserCreatedNewRelationship | UserCreatedRelationshipWithNewPerson>(
    ['UserCreatedNewRelationship', 'UserCreatedRelationshipWithNewPerson'],
    { userId }
  )

  const existingRelationshipWithId = existingRelationships.find(({ payload }) => payload.relationship.id === relationshipId)

  return !!existingRelationshipWithId
}

async function sharePersonsInRelationshipWithFamily({
  relationship,
  familyId,
}: {
  relationship: Relationship
  familyId: FamilyId
}): Promise<void> {
  const relationshipType = relationship.type
  const relationshipId = relationship.id
  switch (relationshipType) {
    case 'friends': {
      const [person1Id, person2Id] = relationship.friendIds
      await sharePersonIfOutsideOfFamily({ personId: person1Id, familyId, relationshipId })
      await sharePersonIfOutsideOfFamily({ personId: person2Id, familyId, relationshipId })
      return
    }
    case 'spouses': {
      const [person1Id, person2Id] = relationship.spouseIds
      await sharePersonIfOutsideOfFamily({ personId: person1Id, familyId, relationshipId })
      await sharePersonIfOutsideOfFamily({ personId: person2Id, familyId, relationshipId })
      return
    }
    case 'parent': {
      const { childId, parentId } = relationship
      await sharePersonIfOutsideOfFamily({ personId: childId, familyId, relationshipId })
      await sharePersonIfOutsideOfFamily({ personId: parentId, familyId, relationshipId })
      return
    }
    default:
      exhaustiveGuard(relationshipType)
  }
}

async function sharePersonIfOutsideOfFamily({
  personId,
  familyId,
  relationshipId,
}: {
  personId: PersonId
  familyId: FamilyId
  relationshipId: RelationshipId
}): Promise<void> {
  if (await isPersonSharedWithFamily({ personId, familyId })) {
    return
  }

  await addToHistory(
    PersonAutoSharedWithRelationship({
      personId,
      familyId,
      relationshipId,
    })
  )

  await addFamilyVisibilityToIndex({ personId, familyId })
}
