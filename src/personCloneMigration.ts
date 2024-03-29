import { addToHistory } from './dependencies/addToHistory.js'
import { postgres } from './dependencies/database.js'
import { getEventList } from './dependencies/getEventList.js'
import { getSingleEvent } from './dependencies/getSingleEvent.js'
import { PersonId } from './domain/PersonId.js'
import { MigrationFailure } from './events/migrations/MigrationFailure.js'
import { MigrationStart } from './events/migrations/MigrationStart.js'
import { MigrationSuccess } from './events/migrations/MigrationSuccess.js'
import { UserRecognizedPersonInPhoto } from './events/onboarding/UserRecognizedPersonInPhoto.js'
import { UserCreatedNewRelationship } from './pages/family/UserCreatedNewRelationship.js'
import { UserCreatedRelationshipWithNewPerson } from './pages/family/UserCreatedRelationshipWithNewPerson.js'
import { PersonAutoSharedWithPhotoFace } from './pages/share/PersonAutoSharedWithPhotoFace.js'
import { PersonAutoSharedWithRelationship } from './pages/share/PersonAutoSharedWithRelationship.js'
import { PersonClonedForSharing } from './pages/share/PersonClonedForSharing.js'

export const personCloneMigration = async () => {
  const migrationName = 'personClone'
  const migration = await getSingleEvent<MigrationStart>('MigrationStart', { name: migrationName })

  if (migration) return

  await migrateUserRecognizedEvents()
  await migrateRelationships()

  await addToHistory(MigrationStart({ name: migrationName }))

  try {
    await addToHistory(MigrationSuccess({ name: migrationName }))
  } catch (error) {
    console.error(`Migration ${migrationName} failed`, error)
    await addToHistory(MigrationFailure({ name: migrationName }))
  }
}

async function migrateRelationships() {
  const events = await getEventList<UserCreatedNewRelationship | UserCreatedRelationshipWithNewPerson>([
    'UserCreatedNewRelationship',
    'UserCreatedRelationshipWithNewPerson',
  ])

  for (const event of events) {
    const { relationship, familyId } = event.payload
    if (relationship.type === 'friends') {
      const [personId1, personId2] = relationship.friendIds
      const originalPersonId1 = await getOriginalPersonId(personId1)
      const originalPersonId2 = await getOriginalPersonId(personId2)
      if (originalPersonId1 !== personId1 || originalPersonId2 !== personId2) {
        await postgres.query(`UPDATE history SET payload = jsonb_set(payload, '{relationship}', $2) WHERE id = $1;`, [
          event.id,
          JSON.stringify({ ...relationship, friendIds: [originalPersonId1, originalPersonId2] }),
        ])
      }

      if (originalPersonId1 !== personId1) {
        await addToHistory(
          PersonAutoSharedWithRelationship({
            relationshipId: relationship.id,
            familyId,
            personId: originalPersonId1,
          })
        )
      }

      if (originalPersonId2 !== personId2) {
        await addToHistory(
          PersonAutoSharedWithRelationship({
            relationshipId: relationship.id,
            familyId,
            personId: originalPersonId2,
          })
        )
      }
    } else if (relationship.type === 'spouses') {
      const [personId1, personId2] = relationship.spouseIds
      const originalPersonId1 = await getOriginalPersonId(personId1)
      const originalPersonId2 = await getOriginalPersonId(personId2)
      if (originalPersonId1 !== personId1 || originalPersonId2 !== personId2) {
        await postgres.query(`UPDATE history SET payload = jsonb_set(payload, '{relationship}', $2) WHERE id = $1;`, [
          event.id,
          JSON.stringify({ ...relationship, spouseIds: [originalPersonId1, originalPersonId2] }),
        ])
      }

      if (originalPersonId1 !== personId1) {
        await addToHistory(
          PersonAutoSharedWithRelationship({
            relationshipId: relationship.id,
            familyId,
            personId: originalPersonId1,
          })
        )
      }

      if (originalPersonId2 !== personId2) {
        await addToHistory(
          PersonAutoSharedWithRelationship({
            relationshipId: relationship.id,
            familyId,
            personId: originalPersonId2,
          })
        )
      }
    } else if (relationship.type === 'parent') {
      const { parentId, childId } = relationship
      const originalParentId = await getOriginalPersonId(parentId)
      const originalChildId = await getOriginalPersonId(childId)
      if (originalParentId !== parentId || originalChildId !== childId) {
        await postgres.query(`UPDATE history SET payload = jsonb_set(payload, '{relationship}', $2) WHERE id = $1;`, [
          event.id,
          JSON.stringify({ ...relationship, parentId: originalParentId, childId: originalChildId }),
        ])
      }

      if (originalChildId !== childId) {
        await addToHistory(
          PersonAutoSharedWithRelationship({
            relationshipId: relationship.id,
            familyId,
            personId: originalChildId,
          })
        )
      }

      if (originalParentId !== parentId) {
        await addToHistory(
          PersonAutoSharedWithRelationship({
            relationshipId: relationship.id,
            familyId,
            personId: originalParentId,
          })
        )
      }
    }
  }
}

async function migrateUserRecognizedEvents() {
  const events = await getEventList<UserRecognizedPersonInPhoto>('UserRecognizedPersonInPhoto')
  for (const event of events) {
    const { personId } = event.payload

    const originalPersonId = await getOriginalPersonId(personId)
    if (personId === originalPersonId) continue

    // it's a clone
    // replace the personId
    await postgres.query(`UPDATE history SET payload = jsonb_set(payload, '{personId}', $2) WHERE id = $1;`, [
      event.id,
      JSON.stringify(originalPersonId),
    ])

    const cloneEvent = await getSingleEvent<PersonClonedForSharing>('PersonClonedForSharing', { personId })
    const cloneFamilyId = cloneEvent!.payload.familyId
    const { faceId, photoId } = event.payload
    await addToHistory(
      PersonAutoSharedWithPhotoFace({
        faceId,
        photoId,
        personId: originalPersonId,
        familyId: cloneFamilyId,
      })
    )
  }
}

async function getOriginalPersonId(personId: PersonId): Promise<PersonId> {
  const cloneEvent = await getSingleEvent<PersonClonedForSharing>('PersonClonedForSharing', { personId })

  if (!cloneEvent) return personId

  return await getOriginalPersonId(cloneEvent.payload.clonedFrom.personId)
}
