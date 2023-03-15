import { postgres } from '../../../../dependencies/postgres'
import { GedcomImported, Person } from '../../../../events'
import { ChatPhotoFace } from '../../ChatPage/ChatPage'

export const getPersonById = async (personId: string): Promise<ChatPhotoFace['person']> => {
  const { rows: gedcomImportedRows } = await postgres.query<GedcomImported>(
    "SELECT * FROM events WHERE type = 'GedcomImported' LIMIT 1"
  )

  if (!gedcomImportedRows.length) {
    throw 'GedcomImported introuvable'
  }

  const person = gedcomImportedRows[0].payload.persons.find((person: Person) => person.id === personId)

  if (!person) return null

  return {
    name: person.name,
  }
}
