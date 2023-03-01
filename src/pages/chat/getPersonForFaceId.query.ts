import { postgres } from '../../dependencies/postgres'
import { AWSFaceIdLinkedToPerson } from './AWSFaceIdLinkedToPerson'
import type { Person as GedcomPerson } from '../../events'

export type Person = {
  personId: string
}

export const getPersonForFaceId = async (faceId: string): Promise<Person | null> => {
  const { rows } = await postgres.query<AWSFaceIdLinkedToPerson>(
    "SELECT * FROM events WHERE type = 'AWSFaceIdLinkedToPerson' AND payload->>'faceId'=$1 LIMIT 1",
    [faceId]
  )

  if (!rows.length) {
    return null
  }

  const personId: string = rows[0].payload.personId

  const { rows: gedcomImportedRows } = await postgres.query("SELECT * FROM events WHERE type = 'GedcomImported' LIMIT 1")

  if (!gedcomImportedRows.length) {
    throw 'GedcomImported introuvable'
  }

  return gedcomImportedRows[0].payload.persons.find((person: GedcomPerson) => person.id === personId)
}
