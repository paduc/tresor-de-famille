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
      .sort((a, b) => a.id.localeCompare(b.id))
  }

  function getChildren(personId: string) {
    return gedcom.relationships
      .filter(({ parentId }) => personId === parentId)
      .map((rel) => getPersonById(rel.childId))
      .filter((personOrNull): personOrNull is Person => personOrNull !== null)
  }

  function getSiblings(personId: string) {
    const parents = getParents(personId)
    const siblingSet = new Set<string>()
    const siblings = []
    for (const parent of parents) {
      const children = getChildren(parent.id)
      for (const child of children) {
        if (siblingSet.has(child.id)) {
          continue
        }
        siblingSet.add(child.id)
        siblings.push(child)
      }
    }
    return siblings
  }

  let family = ''
  const personSet = new Set<string>()

  const target = getPersonById(personId)
  if (!target) {
    return ''
  }

  function addMention(mention: string, personId?: string) {
    if (personId && personSet.has(personId)) {
      return
    }
    if (personId) personSet.add(personId)
    family += `${mention}\n`
  }

  const children = getChildren(personId)
  for (const child of children) {
    addMention(`${child.name} is the child of ${target.name}.`, child.id)
  }

  const parents = getParents(personId)
  if (parents.length) {
    addMention(`${target.name} is the child of ${parents.map((parent) => parent.name).join(' and ')}.`, target.name)
  }

  const siblings = getSiblings(personId)
  for (const sibling of siblings) {
    const siblingsParents = getParents(sibling.id)

    addMention(`${sibling.name} is the child of ${siblingsParents.map((parent) => parent.name).join(' and ')}.`, sibling.name)
  }

  for (const parent of parents) {
    const grandParents = getParents(parent.id)
    if (grandParents.length) {
      addMention(`${parent.name} is the child of ${grandParents.map((parent) => parent.name).join(' and ')}.`, parent.name)
    }
  }

  return family
}
