import { postgres } from '../../../dependencies/postgres'
import { GedcomImported, Person } from '../../../events'
import { makeIdCodeMap } from '../makeIdCodeMap'

export type DescribeFamilyArgs = {
  personId: string
  distance?: number
}

export const describeFamily = async ({
  personId,
  distance = 0,
}: DescribeFamilyArgs): Promise<{ description: string; personCodeMap: ReturnType<typeof makeIdCodeMap> }> => {
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
    return unique(gedcom.relationships.filter(({ childId }) => personId === childId).map((rel) => rel.parentId))
      .map(getPersonById)
      .filter((personOrNull): personOrNull is Person => personOrNull !== null)
      .sort((a, b) => a.id.localeCompare(b.id))
  }

  function getChildren(personId: string) {
    return unique(gedcom.relationships.filter(({ parentId }) => personId === parentId).map((rel) => rel.childId))
      .map(getPersonById)
      .filter((personOrNull): personOrNull is Person => personOrNull !== null)
      .sort((a, b) => a.id.localeCompare(b.id))
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

  const personCodeMap = makeIdCodeMap('person')

  function nameAndId(person: Person | undefined) {
    return `${person!.name} (${personCodeMap.idToCode(person!.id)})`
  }

  const target = getPersonById(personId)
  if (!target) {
    return { description: family, personCodeMap }
  }

  const visited = new Set<string>(personId)

  function traverseFamilyTree(personId: string, nthDegree: number) {
    if (nthDegree < 0) {
      return
    }

    visited.add(personId)

    // 1) print personId is the child of parents
    const parents = unique(gedcom.relationships.filter((rel) => rel.childId === personId).map((rel) => rel.parentId))
      .map(getPersonById)
      .map(nameAndId)

    if (parents.length) family += `${nameAndId(getPersonById(personId))} is the child of ${parents.join(' and ')}\n`

    // 2) Get relatives that we haven't traversed yet and traverse them
    const relationships = gedcom.relationships.filter((rel) => rel.parentId === personId || rel.childId === personId)

    const relativesIds = relationships
      .map((rel) => (rel.parentId === personId ? rel.childId : rel.parentId))
      .filter((relativeId) => !visited.has(relativeId))

    relativesIds.forEach((relative) => {
      traverseFamilyTree(relative, nthDegree - 1)
    })
  }

  traverseFamilyTree(personId, 1)

  return { description: family, personCodeMap }
}

function unique(list: string[]) {
  return [...new Set(list)]
}
