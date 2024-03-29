import { resetDatabase } from '../../dependencies/__test__/resetDatabase.js'
import { addToHistory } from '../../dependencies/addToHistory.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself.js'
import { getUuid } from '../../libs/getUuid.js'
import { makePersonId } from '../../libs/makePersonId.js'
import { makeRelationshipId } from '../../libs/makeRelationshipId.js'
import { makeAppUserId } from '../../libs/makeUserId.js'
import { UserCreatedNewRelationship } from './UserCreatedNewRelationship.js'
import { UserCreatedRelationshipWithNewPerson } from './UserCreatedRelationshipWithNewPerson.js'
import { UserRemovedRelationship } from './UserRemovedRelationship.js'
import { getFamilyPageProps } from './getFamilyPageProps.js'

describe('getFamilyProps', () => {
  const userId = makeAppUserId()
  const personId = makePersonId()

  describe('getFamilyRelationships', () => {
    describe('when UserCreatedRelationshipWithNewPerson with type parent and parentId = personId', () => {
      const newPersonId = makePersonId()
      const relationshipId = makeRelationshipId()

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          UserNamedThemself({
            userId,
            personId,
            name: 'person',
            familyId: '' as FamilyId,
          })
        )
        await addToHistory(
          UserCreatedRelationshipWithNewPerson({
            userId,
            familyId: '' as FamilyId,
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
            familyId: '' as FamilyId,
            newPerson: {
              personId: newPersonId,
              name: 'new name',
            },
            relationship: { id: makeRelationshipId(), type: 'parent', parentId: makePersonId(), childId: newPersonId },
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
      const newPersonId = makePersonId()
      const relationshipId = makeRelationshipId()

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          UserNamedThemself({
            userId,
            familyId: '' as FamilyId,
            personId,
            name: 'person',
          })
        )
        await addToHistory(
          UserCreatedRelationshipWithNewPerson({
            userId,
            familyId: '' as FamilyId,
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
            familyId: '' as FamilyId,
            newPerson: {
              personId: newPersonId,
              name: 'new name',
            },
            relationship: { id: makeRelationshipId(), type: 'spouses', spouseIds: [makePersonId(), newPersonId] },
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
      const newPersonId = makePersonId()
      const relationshipId = makeRelationshipId()

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          UserNamedThemself({
            userId,
            familyId: '' as FamilyId,
            personId,
            name: 'person',
          })
        )
        await addToHistory(
          UserCreatedRelationshipWithNewPerson({
            userId,
            familyId: '' as FamilyId,
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
            familyId: '' as FamilyId,
            newPerson: {
              personId: newPersonId,
              name: 'new name',
            },
            relationship: { id: makeRelationshipId(), type: 'friends', friendIds: [makePersonId(), newPersonId] },
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
      const newPersonId = makePersonId()
      const friendRelationshipId = makeRelationshipId()
      const spouseRelId = makeRelationshipId()

      const parentRelId = makeRelationshipId()
      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          UserNamedThemself({
            userId,
            familyId: '' as FamilyId,
            personId,
            name: 'person',
          })
        )
        await addToHistory(
          UserNamedThemself({
            userId,
            familyId: '' as FamilyId,
            personId: newPersonId,
            name: 'new name',
          })
        )
        await addToHistory(
          UserCreatedNewRelationship({
            userId,
            familyId: '' as FamilyId,
            relationship: { id: friendRelationshipId, type: 'friends', friendIds: [personId, newPersonId] },
          })
        )

        await addToHistory(
          UserCreatedNewRelationship({
            userId,
            familyId: '' as FamilyId,
            relationship: { id: spouseRelId, type: 'spouses', spouseIds: [personId, newPersonId] },
          })
        )

        await addToHistory(
          UserCreatedNewRelationship({
            userId,
            familyId: '' as FamilyId,
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
      const newPersonId = makePersonId()
      const removedRelationshipId = makeRelationshipId()

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          UserNamedThemself({
            userId,
            familyId: '' as FamilyId,
            personId,
            name: 'person',
          })
        )
        await addToHistory(
          UserNamedThemself({
            userId,
            familyId: '' as FamilyId,
            personId: newPersonId,
            name: 'new name',
          })
        )

        await addToHistory(
          UserCreatedNewRelationship({
            userId,
            familyId: '' as FamilyId,
            relationship: { id: removedRelationshipId, type: 'parent', parentId: personId, childId: newPersonId },
          })
        )

        // this one should not be removed
        await addToHistory(
          UserCreatedNewRelationship({
            userId,
            familyId: '' as FamilyId,
            relationship: { id: makeRelationshipId(), type: 'spouses', spouseIds: [personId, newPersonId] },
          })
        )

        await addToHistory(
          UserRemovedRelationship({
            userId,
            familyId: '' as FamilyId,
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
