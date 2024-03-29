import { resetDatabase } from './dependencies/__test__/resetDatabase.js'
import { addToHistory } from './dependencies/addToHistory.js'
import { postgres } from './dependencies/database.js'
import { getEventList } from './dependencies/getEventList.js'
import { getSingleEvent } from './dependencies/getSingleEvent.js'
import { UserRegisteredWithEmailAndPassword } from './events/UserRegisteredWithEmailAndPassword.js'
import { UserNamedThemself } from './events/onboarding/UserNamedThemself.js'
import { UserRecognizedPersonInPhoto } from './events/onboarding/UserRecognizedPersonInPhoto.js'
import { makeFaceId } from './libs/makeFaceId.js'
import { makeFamilyId } from './libs/makeFamilyId.js'
import { makePersonId } from './libs/makePersonId.js'
import { makePhotoId } from './libs/makePhotoId.js'
import { makeRelationshipId } from './libs/makeRelationshipId.js'
import { makeAppUserId } from './libs/makeUserId.js'
import { UserCreatedNewRelationship } from './pages/family/UserCreatedNewRelationship.js'
import { UserCreatedRelationshipWithNewPerson } from './pages/family/UserCreatedRelationshipWithNewPerson.js'
import { PersonAutoSharedWithPhotoFace } from './pages/share/PersonAutoSharedWithPhotoFace.js'
import { PersonAutoSharedWithRelationship } from './pages/share/PersonAutoSharedWithRelationship.js'
import { PersonClonedForSharing } from './pages/share/PersonClonedForSharing.js'
import { personCloneMigration } from './personCloneMigration.js'

describe('personCloneMigration', () => {
  describe('when a UserRecognizedPersonInPhoto points to a person clone', () => {
    const originalPersonFamily = makeFamilyId()
    const originalPersonId = makePersonId()
    const clonePersonId = makePersonId()
    const cloneFamilyId = makeFamilyId()
    const faceId = makeFaceId()
    const photoId = makePhotoId()
    let targetEvent: UserRecognizedPersonInPhoto

    beforeAll(async () => {
      await resetDatabase()

      const userId = makeAppUserId()

      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId: userId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId,
          name: 'John Doe',
          familyId: originalPersonFamily,
          personId: originalPersonId,
        })
      )

      await addToHistory(
        PersonClonedForSharing({
          personId: clonePersonId,
          familyId: cloneFamilyId,
          name: '',
          userId,
          clonedFrom: {
            personId: originalPersonId,
            familyId: originalPersonFamily,
          },
        })
      )

      targetEvent = UserRecognizedPersonInPhoto({
        faceId: faceId,
        personId: clonePersonId,
        photoId: photoId,
        userId,
      })
      await addToHistory(targetEvent)

      await personCloneMigration()
    })

    it('should update the event, with the clones original person', async () => {
      const { rows } = await postgres.query<UserRecognizedPersonInPhoto>('SELECT * FROM history WHERE id=$1', [targetEvent.id])

      expect(rows).toHaveLength(1)

      expect(rows[0].payload).toMatchObject({ ...targetEvent.payload, personId: originalPersonId })
    })

    it('should share the person with the clone family', async () => {
      const shareEvents = await getEventList<PersonAutoSharedWithPhotoFace>('PersonAutoSharedWithPhotoFace')

      expect(shareEvents).toHaveLength(1)

      expect(shareEvents[0].payload).toMatchObject({
        familyId: cloneFamilyId,
        personId: originalPersonId,
        photoId,
        faceId,
      })
    })
  })

  describe('when a UserCreatedNewRelationship of type friends points to a person clone', () => {
    const originalPersonFamily = makeFamilyId()
    const originalPersonId1 = makePersonId()
    const originalPersonId2 = makePersonId()
    const clonePersonId1 = makePersonId()
    const clonePersonId2 = makePersonId()
    const cloneFamilyId = makeFamilyId()
    let targetEvent: UserCreatedNewRelationship

    beforeAll(async () => {
      await resetDatabase()

      const userId = makeAppUserId()

      // Make the first person
      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId,
          name: 'John Doe',
          familyId: originalPersonFamily,
          personId: originalPersonId1,
        })
      )

      await addToHistory(
        PersonClonedForSharing({
          personId: clonePersonId1,
          familyId: cloneFamilyId,
          name: '',
          userId,
          clonedFrom: {
            personId: originalPersonId1,
            familyId: originalPersonFamily,
          },
        })
      )

      // Make the second person
      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId,
          name: 'John Doe 2',
          familyId: originalPersonFamily,
          personId: originalPersonId2,
        })
      )

      await addToHistory(
        PersonClonedForSharing({
          personId: clonePersonId2,
          familyId: cloneFamilyId,
          name: '',
          userId,
          clonedFrom: {
            personId: originalPersonId2,
            familyId: originalPersonFamily,
          },
        })
      )

      targetEvent = UserCreatedNewRelationship({
        familyId: cloneFamilyId,
        userId,
        relationship: {
          type: 'friends',
          friendIds: [clonePersonId1, clonePersonId2],
          id: makeRelationshipId(),
        },
      })
      await addToHistory(targetEvent)

      await personCloneMigration()
    })

    it('should update the event, replacing the clones with their original persons', async () => {
      const { rows } = await postgres.query<UserCreatedNewRelationship>('SELECT * FROM history WHERE id=$1', [targetEvent.id])

      expect(rows).toHaveLength(1)

      if (rows[0].payload.relationship.type !== 'friends') throw ''

      expect(rows[0].payload.relationship.friendIds).toMatchObject([originalPersonId1, originalPersonId2])
    })

    it('should trigger PersonAutoSharedWithRelationship', async () => {
      const personSharedEvents = await getEventList<PersonAutoSharedWithRelationship>('PersonAutoSharedWithRelationship')

      expect(personSharedEvents).toHaveLength(2)
      expect(personSharedEvents[0].payload).toMatchObject({
        familyId: cloneFamilyId,
        personId: originalPersonId1,
      })
      expect(personSharedEvents[1].payload).toMatchObject({
        familyId: cloneFamilyId,
        personId: originalPersonId2,
      })
    })
  })

  describe('when a UserCreatedNewRelationship of type spouses points to a person clone', () => {
    const originalPersonFamily = makeFamilyId()
    const originalPersonId1 = makePersonId()
    const originalPersonId2 = makePersonId()
    const clonePersonId1 = makePersonId()
    const clonePersonId2 = makePersonId()
    const cloneFamilyId = makeFamilyId()
    let targetEvent: UserCreatedNewRelationship

    beforeAll(async () => {
      await resetDatabase()

      const userId = makeAppUserId()

      // Make the first person
      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId,
          name: 'John Doe',
          familyId: originalPersonFamily,
          personId: originalPersonId1,
        })
      )

      await addToHistory(
        PersonClonedForSharing({
          personId: clonePersonId1,
          familyId: cloneFamilyId,
          name: '',
          userId,
          clonedFrom: {
            personId: originalPersonId1,
            familyId: originalPersonFamily,
          },
        })
      )

      // Make the second person
      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId,
          name: 'John Doe 2',
          familyId: originalPersonFamily,
          personId: originalPersonId2,
        })
      )

      await addToHistory(
        PersonClonedForSharing({
          personId: clonePersonId2,
          familyId: cloneFamilyId,
          name: '',
          userId,
          clonedFrom: {
            personId: originalPersonId2,
            familyId: originalPersonFamily,
          },
        })
      )

      targetEvent = UserCreatedNewRelationship({
        familyId: cloneFamilyId,
        userId,
        relationship: {
          type: 'spouses',
          spouseIds: [clonePersonId1, clonePersonId2],
          id: makeRelationshipId(),
        },
      })
      await addToHistory(targetEvent)

      await personCloneMigration()
    })

    it('should update the event, replacing the clones with their original persons', async () => {
      const { rows } = await postgres.query<UserCreatedNewRelationship>('SELECT * FROM history WHERE id=$1', [targetEvent.id])

      expect(rows).toHaveLength(1)

      if (rows[0].payload.relationship.type !== 'spouses') throw ''

      expect(rows[0].payload.relationship.spouseIds).toMatchObject([originalPersonId1, originalPersonId2])
    })

    it('should trigger PersonAutoSharedWithRelationship', async () => {
      const personSharedEvents = await getEventList<PersonAutoSharedWithRelationship>('PersonAutoSharedWithRelationship')

      expect(personSharedEvents).toHaveLength(2)
      expect(personSharedEvents[0].payload).toMatchObject({
        familyId: cloneFamilyId,
        personId: originalPersonId1,
      })
      expect(personSharedEvents[1].payload).toMatchObject({
        familyId: cloneFamilyId,
        personId: originalPersonId2,
      })
    })
  })

  describe('when a UserCreatedNewRelationship of type parent points to a person clone', () => {
    const originalPersonFamily = makeFamilyId()
    const originalPersonId1 = makePersonId()
    const originalPersonId2 = makePersonId()
    const clonePersonId1 = makePersonId()
    const clonePersonId2 = makePersonId()
    const cloneFamilyId = makeFamilyId()
    let targetEvent: UserCreatedNewRelationship

    beforeAll(async () => {
      await resetDatabase()

      const userId = makeAppUserId()

      // Make the first person
      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId,
          name: 'John Doe',
          familyId: originalPersonFamily,
          personId: originalPersonId1,
        })
      )

      await addToHistory(
        PersonClonedForSharing({
          personId: clonePersonId1,
          familyId: cloneFamilyId,
          name: '',
          userId,
          clonedFrom: {
            personId: originalPersonId1,
            familyId: originalPersonFamily,
          },
        })
      )

      // Make the second person
      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId,
          name: 'John Doe 2',
          familyId: originalPersonFamily,
          personId: originalPersonId2,
        })
      )

      await addToHistory(
        PersonClonedForSharing({
          personId: clonePersonId2,
          familyId: cloneFamilyId,
          name: '',
          userId,
          clonedFrom: {
            personId: originalPersonId2,
            familyId: originalPersonFamily,
          },
        })
      )

      targetEvent = UserCreatedNewRelationship({
        familyId: cloneFamilyId,
        userId,
        relationship: {
          type: 'parent',
          childId: clonePersonId1,
          parentId: clonePersonId2,
          id: makeRelationshipId(),
        },
      })
      await addToHistory(targetEvent)

      await personCloneMigration()
    })

    it('should update the event, replacing the clones with their original persons', async () => {
      const { rows } = await postgres.query<UserCreatedNewRelationship>('SELECT * FROM history WHERE id=$1', [targetEvent.id])

      expect(rows).toHaveLength(1)

      if (rows[0].payload.relationship.type !== 'parent') throw ''

      expect(rows[0].payload.relationship.childId).toEqual(originalPersonId1)
      expect(rows[0].payload.relationship.parentId).toEqual(originalPersonId2)
    })

    it('should trigger PersonAutoSharedWithRelationship', async () => {
      const personSharedEvents = await getEventList<PersonAutoSharedWithRelationship>('PersonAutoSharedWithRelationship')

      expect(personSharedEvents).toHaveLength(2)
      expect(personSharedEvents[0].payload).toMatchObject({
        familyId: cloneFamilyId,
        personId: originalPersonId1,
      })
      expect(personSharedEvents[1].payload).toMatchObject({
        familyId: cloneFamilyId,
        personId: originalPersonId2,
      })
    })
  })

  describe('when a UserCreatedRelationshipWithNewPerson points to a person clone', () => {
    const originalPersonFamily = makeFamilyId()
    const originalPersonId = makePersonId()
    const newPersonId = makePersonId()
    const clonePersonId = makePersonId()
    const cloneFamilyId = makeFamilyId()
    let targetEvent: UserCreatedRelationshipWithNewPerson

    beforeAll(async () => {
      await resetDatabase()

      const userId = makeAppUserId()

      // Make the first person
      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId,
          name: 'John Doe',
          familyId: originalPersonFamily,
          personId: originalPersonId,
        })
      )

      await addToHistory(
        PersonClonedForSharing({
          personId: clonePersonId,
          familyId: cloneFamilyId,
          name: '',
          userId,
          clonedFrom: {
            personId: originalPersonId,
            familyId: originalPersonFamily,
          },
        })
      )

      targetEvent = UserCreatedRelationshipWithNewPerson({
        familyId: originalPersonFamily,
        userId,
        newPerson: {
          personId: newPersonId,
          name: 'John Doe',
        },
        relationship: {
          type: 'friends',
          friendIds: [newPersonId, clonePersonId],
          id: makeRelationshipId(),
        },
      })
      await addToHistory(targetEvent)

      await personCloneMigration()
    })

    it('should update the event, with the clone original person', async () => {
      const { rows } = await postgres.query<UserCreatedRelationshipWithNewPerson>('SELECT * FROM history WHERE id=$1', [
        targetEvent.id,
      ])

      expect(rows).toHaveLength(1)

      if (rows[0].payload.relationship.type !== 'friends') throw ''

      expect(rows[0].payload.relationship.friendIds).toMatchObject([newPersonId, originalPersonId])
    })

    it('should trigger PersonAutoSharedWithRelationship', async () => {
      const personSharedEvents = await getEventList<PersonAutoSharedWithRelationship>('PersonAutoSharedWithRelationship')

      expect(personSharedEvents).toHaveLength(1)
      expect(personSharedEvents[0].payload).toMatchObject({
        familyId: originalPersonFamily,
        personId: originalPersonId,
      })
    })
  })
})
