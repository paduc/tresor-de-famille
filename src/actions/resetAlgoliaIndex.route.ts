import { requireAuth } from '../dependencies/authn.js'
import { postgres } from '../dependencies/database.js'
import { getEventList } from '../dependencies/getEventList.js'
import { addFamilyVisibilityToIndex, changePersonNameInIndex, personsIndex } from '../dependencies/search.js'
import { UUID } from '../domain/UUID.js'
import { PersonId } from '../domain/PersonId.js'
import { GedcomImported } from '../events/GedcomImported.js'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto.js'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself.js'
import { UserCreatedRelationshipWithNewPerson } from '../pages/family/UserCreatedRelationshipWithNewPerson.js'
import { UserChangedPersonName } from '../pages/person/UserChangedPersonName.js'
import { PersonAutoShareWithFamilyCreation } from '../pages/share/PersonAutoShareWithFamilyCreation.js'
import { PersonAutoSharedWithPhotoFace } from '../pages/share/PersonAutoSharedWithPhotoFace.js'
import { PersonAutoSharedWithRelationship } from '../pages/share/PersonAutoSharedWithRelationship.js'
import { actionsRouter } from './actionsRouter.js'
import { UserSetFamilyTreeOrigin } from '../pages/family/UserSetFamilyTreeOrigin.js'

actionsRouter.get('/resetAlgoliaIndex', requireAuth(), async (request, response, next) => {
  try {
    // Reset the index (remove all objects)
    await personsIndex.clearObjects()

    // insert gedcom
    try {
      await indexGedcom()
    } catch (error) {
      console.error(error)
      // @ts-ignore
      response.send(error.message).status(400)
    }

    try {
      await indexUserNamedThemself()
    } catch (error) {
      console.error(error)
      // @ts-ignore
      response.send(error.message).status(400)
    }

    try {
      await indexUserNamedPersonInPhoto()
    } catch (error) {
      console.error(error)
      // @ts-ignore
      response.send(error.message).status(400)
    }

    try {
      await indexPersonCreatedWithRelationship()
    } catch (error) {
      console.error(error)
      // @ts-ignore
      response.send(error.message).status(400)
    }

    try {
      await indexUserSetFamilyTreeOrigin()
    } catch (error) {
      console.error(error)
      // @ts-ignore
      response.send(error.message).status(400)
    }

    try {
      const nameChangesEvent = await getEventList<UserChangedPersonName>('UserChangedPersonName')

      const uniqueNameChangeEventsPerPerson: Record<UUID, string> = nameChangesEvent.reduce((uniques, event) => {
        // keep latest
        return { ...uniques, [event.payload.personId]: event.payload.name }
      }, {})

      const nameChanges = Object.entries(uniqueNameChangeEventsPerPerson)
      for (const [personId, name] of nameChanges) {
        await changePersonNameInIndex({ personId: personId as PersonId, name })
      }
    } catch (error) {
      console.error('resetAlgoliaIndex failed to update a name')
    }

    const personShareEvents = await getEventList<
      PersonAutoShareWithFamilyCreation | PersonAutoSharedWithPhotoFace | PersonAutoSharedWithRelationship
    >(['PersonAutoShareWithFamilyCreation', 'PersonAutoSharedWithPhotoFace', 'PersonAutoSharedWithRelationship'])

    const personsDone = new Set<PersonId>()
    for (const event of personShareEvents) {
      const { personId } = event.payload

      if (personsDone.has(personId)) continue

      await addFamilyVisibilityToIndex({ personId, familyId: event.payload.familyId })

      personsDone.add(personId)
    }

    response.send('Everything is OK: algolia persons index has been rebuilt')
  } catch (error) {
    next(error)
  }
})

async function indexUserNamedThemself() {
  const { rows: onboardedPersons } = await postgres.query<UserNamedThemself>(
    "SELECT * FROM history WHERE type = 'UserNamedThemself'"
  )

  for (const onboardedPerson of onboardedPersons) {
    const { personId, name } = onboardedPerson.payload
    await personsIndex.saveObject({
      objectID: personId,
      id: personId,
      name,
      familyId: onboardedPerson.payload.familyId,
      visible_by: [`family/${onboardedPerson.payload.familyId}`, `family/${onboardedPerson.payload.userId}`],
    })
  }
}

async function indexPersonCreatedWithRelationship() {
  const { rows: newPersons } = await postgres.query<UserCreatedRelationshipWithNewPerson>(
    "SELECT * FROM history WHERE type = 'UserCreatedRelationshipWithNewPerson'"
  )

  for (const newPerson of newPersons) {
    const { personId, name } = newPerson.payload.newPerson
    await personsIndex.saveObject({
      objectID: personId,
      id: personId,
      name,
      familyId: newPerson.payload.familyId,
      visible_by: [`family/${newPerson.payload.familyId}`, `family/${newPerson.payload.userId}`],
    })
  }
}

async function indexUserSetFamilyTreeOrigin() {
  const { rows: newPersons } = await postgres.query<UserSetFamilyTreeOrigin>(
    "SELECT * FROM history WHERE type = 'UserSetFamilyTreeOrigin'"
  )

  for (const newPerson of newPersons) {
    const { personId, name } = newPerson.payload.newPerson
    await personsIndex.saveObject({
      objectID: personId,
      id: personId,
      name,
      familyId: newPerson.payload.familyId,
      visible_by: [`family/${newPerson.payload.familyId}`, `family/${newPerson.payload.userId}`],
    })
  }
}

async function indexUserNamedPersonInPhoto() {
  const { rows: userNamedPersons } = await postgres.query<UserNamedPersonInPhoto>(
    "SELECT * FROM history WHERE type = 'UserNamedPersonInPhoto'"
  )

  for (const userNamedPerson of userNamedPersons) {
    const { personId, name } = userNamedPerson.payload
    await personsIndex.saveObject({
      objectID: personId,
      id: personId,
      name,
      familyId: userNamedPerson.payload.familyId,
      visible_by: [`family/${userNamedPerson.payload.familyId}`, `family/${userNamedPerson.payload.userId}`],
    })
  }
}

async function indexGedcom() {
  const { rows } = await postgres.query<GedcomImported>("SELECT * FROM history where type = 'GedcomImported'")

  const gedcom = rows[0]

  if (!gedcom) {
    return null
  }

  for (const gedcom of rows) {
    const { persons, relationships, familyId } = gedcom.payload

    const relationshipsById = relationships.reduce((relationshipsByPersonId, relationship) => {
      const { childId, parentId } = relationship

      if (!relationshipsByPersonId[childId]) {
        relationshipsByPersonId[childId] = { children: new Set(), parents: new Set() }
      }

      relationshipsByPersonId[childId].parents.add(parentId)

      if (!relationshipsByPersonId[parentId]) {
        relationshipsByPersonId[parentId] = { children: new Set(), parents: new Set() }
      }

      relationshipsByPersonId[parentId].children.add(childId)

      return relationshipsByPersonId
    }, {} as Record<string, { children: Set<string>; parents: Set<string> }>)

    const personById = persons.reduce((record, person) => ({ ...record, [person.id]: person }), {} as Record<string, any>)

    const personsForIndex = persons.map(({ id, name, bornOn, bornIn, passedOn, passedIn, sex }) => ({
      objectID: id,
      personId: id,
      name,
      bornOn,
      bornIn,
      passedOn,
      passedIn,
      sex,
      parents: Array.from(relationshipsById[id]?.parents || []).map((personId) => personById[personId]?.name),
      children: Array.from(relationshipsById[id]?.children || []).map((personId) => personById[personId]?.name),
      familyId,
      visible_by: [`family/${familyId}`, `family/${gedcom.payload.userId}`],
    }))

    await personsIndex.saveObjects(personsForIndex)
  }
}
