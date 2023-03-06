import { postgres } from '../../dependencies/postgres'
import { GedcomImported, Person } from '../../events'

export type DescribeFamilyArgs = {
  personId: string
  distance?: number
}

export const describeFamily = async ({ personId, distance = 0 }: DescribeFamilyArgs): Promise<string> => {
  const { rows: gedcomImportedRows } = await postgres.query<GedcomImported>(
    "SELECT * FROM events WHERE type = 'GedcomImported' LIMIT 1"
  )

  if (!gedcomImportedRows.length) {
    throw 'GedcomImported introuvable'
  }

  const gedcom = gedcomImportedRows[0].payload

  function getPersonById(personId: string) {
    return gedcom.persons.find((person: Person) => person.id === personId)
  }

  function getParents(personId: string) {
    return gedcom.relationships
      .filter(({ childId }) => personId === childId)
      .map((rel) => getPersonById(rel.parentId))
      .filter((personOrNull): personOrNull is Person => personOrNull !== null)
  }

  function getChildren(personId: string) {
    return gedcom.relationships
      .filter(({ parentId }) => personId === parentId)
      .map((rel) => getPersonById(rel.childId))
      .filter((personOrNull): personOrNull is Person => personOrNull !== null)
  }

  let family = ''

  const target = getPersonById(personId)
  if (!target) {
    return family
  }

  const parents = getParents(personId)
  for (const parent of parents) {
    family += `${target.name} is the child of ${parent.name}.\n`
  }

  const children = getChildren(personId)
  for (const child of children) {
    family += `${child.name} is the child of ${target.name}.\n`
  }

  return family
}
