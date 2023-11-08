import { postgres } from '../dependencies/database'
import { getSingleEvent } from '../dependencies/getSingleEvent'
import { UUID } from '../domain'
import { GedcomImported } from '../events'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'

import { OpenAIMadeDeductions } from './chat/sendToOpenAIForDeductions/OpenAIMadeDeductions'
import { UserCreatedRelationshipWithNewPerson } from './family/UserCreatedRelationshipWithNewPerson'
import { UserChangedPersonName } from './person/UserChangedPersonName'
import { PhotoAnnotatedUsingOpenAI } from './photo/annotatePhotoUsingOpenAI/PhotoAnnotatedUsingOpenAI'

type OpenAIDeductionPerson = { name: string }
type GedcomPerson = GedcomImported['payload']['persons'][number]

export type PersonById = GedcomPerson | OpenAIDeductionPerson

// This is a helper because it has become frequent
export const getPersonById = async (personId: UUID): Promise<PersonById | null> => {
  type PersonId = UUID

  const personIdMap = new Map<PersonId, PersonById>()

  function addOrMerge(personId: PersonId, info: PersonById) {
    personIdMap.set(personId, Object.assign(personIdMap.get(personId) || {}, info))
  }

  const { rows: gedcomImportedRows } = await postgres.query<GedcomImported>(
    "SELECT * FROM history WHERE type = 'GedcomImported' LIMIT 1"
  )

  if (gedcomImportedRows.length) {
    const gedcomPersons = gedcomImportedRows[0].payload.persons
    for (const person of gedcomPersons) {
      addOrMerge(person.id, person)
    }
  }

  const { rows: deductionRows } = await postgres.query<OpenAIMadeDeductions>(
    'SELECT * FROM history WHERE type = \'OpenAIMadeDeductions\' ORDER BY "occurredAt" ASC'
  )
  for (const { payload } of deductionRows) {
    const personsFromDeductions = payload.deductions.filter(isNewPersonDeduction)

    for (const { personId, name } of personsFromDeductions) {
      addOrMerge(personId, { name })
    }
  }

  const { rows: openAIAnnotationRows } = await postgres.query<PhotoAnnotatedUsingOpenAI>(
    'SELECT * FROM history WHERE type = \'PhotoAnnotatedUsingOpenAI\' ORDER BY "occurredAt" ASC'
  )
  for (const { payload } of openAIAnnotationRows) {
    const personsFromDeductions = payload.deductions.filter(isNewPersonDeduction)

    for (const { personId, name } of personsFromDeductions) {
      addOrMerge(personId, { name })
    }
  }

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

export const getPersonByIdOrThrow = async (personId: UUID): Promise<PersonById> => {
  const person = await getPersonById(personId)
  if (person === null) {
    throw new Error(`Could not retrieve person for id ${personId}`)
  }

  return person
}

type Deduction = OpenAIMadeDeductions['payload']['deductions'][number]
function isNewPersonDeduction(deduction: Deduction): deduction is Deduction & { type: 'face-is-new-person' } {
  return deduction.type === 'face-is-new-person'
}
