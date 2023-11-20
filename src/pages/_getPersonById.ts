import { postgres } from '../dependencies/database'
import { getSingleEvent } from '../dependencies/getSingleEvent'
import { FamilyId } from '../domain/FamilyId'
import { PersonId } from '../domain/PersonId'
import { GedcomImported } from '../events/GedcomImported'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'

import { UserCreatedRelationshipWithNewPerson } from './family/UserCreatedRelationshipWithNewPerson'
import { UserChangedPersonName } from './person/UserChangedPersonName'

export type PersonById = { name: string }

export const getPersonById2 = async ({
  personId,
  familyId,
}: {
  personId: PersonId
  familyId: FamilyId
}): Promise<PersonById | null> => {
  const userNamedEvents = getSingleEvent<UserNamedThemself | UserNamedPersonInPhoto | UserChangedPersonName>(
    ['UserNamedThemself', 'UserNamedPersonInPhoto', 'UserChangedPersonName'],
    {
      personId,
      familyId,
    }
  )

  const { rows: personsAddedWithNewRelationship } = await postgres.query<UserCreatedRelationshipWithNewPerson>(
    "SELECT * FROM history WHERE type = 'UserCreatedRelationshipWithNewPerson' AND payload->'newPerson'->>'personId'=$1",
    [personId]
  )

  return null
}

// This is a helper because it has become frequent
export const getPersonById = async (personId: PersonId): Promise<PersonById | null> => {
  const personIdMap = new Map<PersonId, PersonById>()

  function addOrMerge(personId: PersonId, info: PersonById) {
    personIdMap.set(personId, Object.assign(personIdMap.get(personId) || {}, info))
  }

  // const { rows: gedcomImportedRows } = await postgres.query<GedcomImported>(
  //   "SELECT * FROM history WHERE type = 'GedcomImported' LIMIT 1"
  // )

  // if (gedcomImportedRows.length) {
  //   const gedcomPersons = gedcomImportedRows[0].payload.persons
  //   for (const person of gedcomPersons) {
  //     addOrMerge(person.id, person)
  //   }
  // }

  const { rows: onboardedPersons } = await postgres.query<UserNamedThemself>(
    "SELECT * FROM history WHERE type = 'UserNamedThemself'"
  )

  if (onboardedPersons.length) {
    for (const onboardedPerson of onboardedPersons) {
      const person = onboardedPerson.payload
      addOrMerge(person.personId, { name: person.name })
    }
  }

  const { rows: personsNamedDuringOnboarding } = await postgres.query<UserNamedPersonInPhoto>(
    "SELECT * FROM history WHERE type = 'UserNamedPersonInPhoto'"
  )

  if (personsNamedDuringOnboarding.length) {
    for (const personNamed of personsNamedDuringOnboarding) {
      const person = personNamed.payload
      addOrMerge(person.personId, { name: person.name })
    }
  }

  const { rows: personsAddedWithNewRelationship } = await postgres.query<UserCreatedRelationshipWithNewPerson>(
    "SELECT * FROM history WHERE type = 'UserCreatedRelationshipWithNewPerson'"
  )

  if (personsAddedWithNewRelationship.length) {
    for (const relWithNewPerson of personsAddedWithNewRelationship) {
      const {
        newPerson: { personId, name },
      } = relWithNewPerson.payload
      addOrMerge(personId, { name })
    }
  }

  const person = personIdMap.get(personId)

  if (!person) return null

  const newNameEvent = await getSingleEvent<UserChangedPersonName>('UserChangedPersonName', { personId })

  if (newNameEvent) {
    person.name = newNameEvent.payload.name
  }

  return person
}

export const getPersonByIdOrThrow = async (personId: PersonId): Promise<PersonById> => {
  const person = await getPersonById(personId)
  if (person === null) {
    throw new Error(`Could not retrieve person for id ${personId}`)
  }

  return person
}
