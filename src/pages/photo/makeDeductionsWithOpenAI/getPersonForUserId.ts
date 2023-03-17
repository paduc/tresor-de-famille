import { postgres } from '../../../dependencies/postgres'
import { Person } from '../../../events'

export const getPersonForUserId = async (userId: string): Promise<{ name: string; id: string } | null> => {
  const { rows: userHasDesignatedThemselfAsPersonRows } = await postgres.query(
    "SELECT * FROM events WHERE type = 'UserHasDesignatedThemselfAsPerson' AND payload->>'userId'=$1 LIMIT 1",
    [userId]
  )

  if (!userHasDesignatedThemselfAsPersonRows.length) {
    throw 'UserHasDesignatedThemselfAsPerson introuvable'
  }

  const personId: string = userHasDesignatedThemselfAsPersonRows[0].payload.personId

  const { rows: gedcomImportedRows } = await postgres.query("SELECT * FROM events WHERE type = 'GedcomImported' LIMIT 1")

  if (!gedcomImportedRows.length) {
    throw 'GedcomImported introuvable'
  }

  const person = gedcomImportedRows[0].payload.persons.find((person: Person) => person.id === personId)

  if (!person) return null

  const { name, id } = person
  return { name, id }
}
