import { postgres } from '../dependencies/database'
import { UUID } from '../domain'
import { GedcomImported } from '../events'
import { OpenAIMadeDeductions } from './chat/sendToOpenAIForDeductions/OpenAIMadeDeductions'

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

  return personIdMap.get(personId) || null
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