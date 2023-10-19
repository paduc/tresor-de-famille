import { resetDatabase } from '../../dependencies/__test__/resetDatabase'
import { addToHistory } from '../../dependencies/addToHistory'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself'
import { getUuid } from '../../libs/getUuid'
import { UserCreatedNewRelationship } from './UserCreatedNewRelationship'
import { UserCreatedRelationshipWithNewPerson } from './UserCreatedRelationshipWithNewPerson'
import { UserRemovedRelationship } from './UserRemovedRelationship'
import { getFamilyPageProps } from './getFamilyPageProps'

describe('getFamilyProps', () => {
  const userId = getUuid()
  const personId = getUuid()

  describe('getFamilyRelationships', () => {
    describe('when UserCreatedRelationshipWithNewPerson with type parent and parentId = personId', () => {
      const newPersonId = getUuid()
      const relationshipId = getUuid()

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          UserNamedThemself({
            userId,
            personId,
            name: 'person',
          })
        )
        await addToHistory(
          UserCreatedRelationshipWithNewPerson({
            userId,
            newPerson: {
              personId: newPersonId,
              name: 'new name',
            },
            relationship: { id: relationshipId, type: 'parent', parentId: personId, childId: newPersonId },
          })
        )

        // Add another to check
        await addToHistory(
          UserCreatedRelationshipWithNewPerson({
            userId,
            newPerson: {
              personId: newPersonId,
              name: 'new name',
            },
            relationship: { id: getUuid(), type: 'parent', parentId: getUuid(), childId: newPersonId },
          })
        )
      })

      it('should return a unique parent-child relationship', async () => {
        const res = await getFamilyPageProps(userId)

        expect(res.initialPersons).toMatchObject([
          { personId, name: 'person', profilePicUrl: null },
          { personId: newPersonId, name: 'new name', profilePicUrl: null },
        ])

        expect(res.initialRelationships).toHaveLength(1)

        expect(res.initialRelationships).toMatchObject([
          {
            id: relationshipId,
            type: 'parent',
            parentId: personId,
            childId: newPersonId,
          },
        ])
      })
    })

    describe('when UserCreatedRelationshipWithNewPerson with type spouses and spouseIds[0] = personId', () => {
      const newPersonId = getUuid()
      const relationshipId = getUuid()

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          UserNamedThemself({
            userId,
            personId,
            name: 'person',
          })
        )
        await addToHistory(
          UserCreatedRelationshipWithNewPerson({
            userId,
            newPerson: {
              personId: newPersonId,
              name: 'new name',
            },
            relationship: { id: relationshipId, type: 'spouses', spouseIds: [personId, newPersonId] },
          })
        )

        // Add another to check
        await addToHistory(
          UserCreatedRelationshipWithNewPerson({
            userId,
            newPerson: {
              personId: newPersonId,
              name: 'new name',
            },
            relationship: { id: getUuid(), type: 'spouses', spouseIds: [getUuid(), newPersonId] },
          })
        )
      })

      it('should return a unique spouses relationship', async () => {
        const res = await getFamilyPageProps(userId)

        expect(res.initialPersons).toMatchObject([
          { personId, name: 'person', profilePicUrl: null },
          { personId: newPersonId, name: 'new name', profilePicUrl: null },
        ])

        expect(res.initialRelationships).toHaveLength(1)

        expect(res.initialRelationships).toMatchObject([
          {
            id: relationshipId,
            type: 'spouses',
            spouseIds: [personId, newPersonId],
          },
        ])
      })
    })

    describe('when UserCreatedRelationshipWithNewPerson with type friends and friendIds[0] = personId', () => {
      const newPersonId = getUuid()
      const relationshipId = getUuid()

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          UserNamedThemself({
            userId,
            personId,
            name: 'person',
          })
        )
        await addToHistory(
          UserCreatedRelationshipWithNewPerson({
            userId,
            newPerson: {
              personId: newPersonId,
              name: 'new name',
            },
            relationship: { id: relationshipId, type: 'friends', friendIds: [personId, newPersonId] },
          })
        )

        // Add another to check
        await addToHistory(
          UserCreatedRelationshipWithNewPerson({
            userId,
            newPerson: {
              personId: newPersonId,
              name: 'new name',
            },
            relationship: { id: getUuid(), type: 'friends', friendIds: [getUuid(), newPersonId] },
          })
        )
      })

      it('should return a unique friends relationship', async () => {
        const res = await getFamilyPageProps(userId)

        expect(res.initialPersons).toMatchObject([
          { personId, name: 'person', profilePicUrl: null },
          { personId: newPersonId, name: 'new name', profilePicUrl: null },
        ])

        expect(res.initialRelationships).toHaveLength(1)

        expect(res.initialRelationships).toMatchObject([
          {
            id: relationshipId,
            type: 'friends',
            friendIds: [personId, newPersonId],
          },
        ])
      })
    })

    describe('when the same happens from UserCreatedNewRelationship', () => {
      const newPersonId = getUuid()
      const friendRelationshipId = getUuid()
      const spouseRelId = getUuid()

      const parentRelId = getUuid()
      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          UserNamedThemself({
            userId,
            personId,
            name: 'person',
          })
        )
        await addToHistory(
          UserNamedThemself({
            userId,
            personId: newPersonId,
            name: 'new name',
          })
        )
        await addToHistory(
          UserCreatedNewRelationship({
            userId,
            relationship: { id: friendRelationshipId, type: 'friends', friendIds: [personId, newPersonId] },
          })
        )

        await addToHistory(
          UserCreatedNewRelationship({
            userId,
            relationship: { id: spouseRelId, type: 'spouses', spouseIds: [personId, newPersonId] },
          })
        )

        await addToHistory(
          UserCreatedNewRelationship({
            userId,
            relationship: { id: parentRelId, type: 'parent', parentId: personId, childId: newPersonId },
          })
        )
      })

      it('should return the same relationships', async () => {
        const res = await getFamilyPageProps(userId)

        expect(res.initialPersons).toMatchObject([
          { personId, name: 'person', profilePicUrl: null },
          { personId: newPersonId, name: 'new name', profilePicUrl: null },
        ])

        expect(res.initialRelationships).toHaveLength(3)

        expect(res.initialRelationships).toMatchObject([
          {
            id: parentRelId,
            type: 'parent',
            parentId: personId,
            childId: newPersonId,
          },
          {
            id: spouseRelId,
            type: 'spouses',
            spouseIds: [personId, newPersonId],
          },
          {
            id: friendRelationshipId,
            type: 'friends',
            friendIds: [personId, newPersonId],
          },
        ])
      })
    })
    describe('when the same happens after UserRemovedRelationship', () => {
      const newPersonId = getUuid()
      const removedRelationshipId = getUuid()

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          UserNamedThemself({
            userId,
            personId,
            name: 'person',
          })
        )
        await addToHistory(
          UserNamedThemself({
            userId,
            personId: newPersonId,
            name: 'new name',
          })
        )

        await addToHistory(
          UserCreatedNewRelationship({
            userId,
            relationship: { id: removedRelationshipId, type: 'parent', parentId: personId, childId: newPersonId },
          })
        )

        // this one should not be removed
        await addToHistory(
          UserCreatedNewRelationship({
            userId,
            relationship: { id: getUuid(), type: 'spouses', spouseIds: [personId, newPersonId] },
          })
        )

        await addToHistory(
          UserRemovedRelationship({
            userId,
            relationshipId: removedRelationshipId,
          })
        )
      })

      it('should return the same relationships', async () => {
        const res = await getFamilyPageProps(userId)

        expect(res.initialPersons).toMatchObject([
          { personId, name: 'person', profilePicUrl: null },
          { personId: newPersonId, name: 'new name', profilePicUrl: null },
        ])

        expect(res.initialRelationships).toHaveLength(1)

        expect(res.initialRelationships).toMatchObject([
          {
            type: 'spouses',
            spouseIds: [personId, newPersonId],
          },
        ])
      })
    })
  })
})
