import { postgres } from '../../dependencies/postgres'
import { Person } from '../../events'

export const getPersonById = async (personId: string): Promise<Person> => {
  const { rows: gedcomImportedRows } = await postgres.query("SELECT * FROM events WHERE type = 'GedcomImported' LIMIT 1")

  if (!gedcomImportedRows.length) {
    throw 'GedcomImported introuvable'
  }

  return gedcomImportedRows[0].payload.persons.find((person: Person) => person.id === personId)
}
