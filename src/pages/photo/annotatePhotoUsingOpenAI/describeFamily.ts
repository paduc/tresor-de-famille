import { postgres } from '../../../dependencies/database'
import { PersonId } from '../../../domain/PersonId'
import { GedcomImported } from '../../../events/GedcomImported'
import { makeIdCodeMap } from '../../../libs/makeIdCodeMap'

export type DescribeFamilyArgs = {
  personId: PersonId
  distance?: number
}

type Person = GedcomImported['payload']['persons'][number]

export const describeFamily = async ({
  personId,
  distance = 0,
}: DescribeFamilyArgs): Promise<{
  description: string
  personIdMap: Map<string, PersonId>
  personCodeMap: ReturnType<typeof makeIdCodeMap<PersonId>>
}> => {
  const { rows: gedcomImportedRows } = await postgres.query<GedcomImported>(
    "SELECT * FROM history WHERE type = 'GedcomImported' LIMIT 1"
  )

  if (!gedcomImportedRows.length) {
    throw 'GedcomImported introuvable'
  }

  const gedcom = gedcomImportedRows[0].payload

  function getPersonById(personId: PersonId) {
    return gedcom.persons.find((person: Person) => person.id === personId)
  }

  function getParents(personId: PersonId) {
    return unique(gedcom.relationships.filter(({ childId }) => personId === childId).map((rel) => rel.parentId))
      .map(getPersonById)
      .filter((personOrNull): personOrNull is Person => personOrNull !== null)
      .sort((a, b) => a.id.localeCompare(b.id))
  }

  function getChildren(personId: PersonId) {
    return unique(gedcom.relationships.filter(({ parentId }) => personId === parentId).map((rel) => rel.childId))
      .map(getPersonById)
      .filter((personOrNull): personOrNull is Person => personOrNull !== null)
      .sort((a, b) => a.id.localeCompare(b.id))
  }

  function getSiblings(personId: PersonId) {
    const parents = getParents(personId)
    const siblingSet = new Set<PersonId>()
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

  const personCodeMap = makeIdCodeMap<PersonId>('person')
  type PersonName = string
  const personIdMap = new Map<PersonName, PersonId>()

  function nameAndId(person: Person | undefined) {
    // return `${person!.name} (${personCodeMap.idToCode(person!.id)})`
    personIdMap.set(person!.name, person!.id)
    return `${person!.name}`
  }

  const target = getPersonById(personId)
  if (!target) {
    return { description: family, personCodeMap, personIdMap }
  }

  const visited = new Set<PersonId>()

  function traverseFamilyTree(personId: PersonId, nthDegree: number) {
    if (nthDegree < 0) {
      return
    }

    visited.add(personId)

    // 1) print personId is the child of parents
    const parents = unique(gedcom.relationships.filter((rel) => rel.childId === personId).map((rel) => rel.parentId))
      .map((parentId) => getPersonById(parentId))
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

  traverseFamilyTree(personId, distance)

  return { description: family, personCodeMap, personIdMap }
}

function unique<T>(list: T[]) {
  return [...new Set(list)]
}
