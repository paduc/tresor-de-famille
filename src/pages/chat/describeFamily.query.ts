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

  // Replace with different methods to go up or down ?
  function addCloseFamily(fnTarget: Person, level: number) {
    // This would be drilling downwards
    const children = getChildren(fnTarget.id)
    for (const child of children) {
      addMention(`${child.name} is the child of ${fnTarget.name}.`, child.id)
    }

    // This would be going upwards
    const parents = getParents(fnTarget.id)
    if (parents.length) {
      addMention(`${fnTarget.name} is the child of ${parents.map((parent) => parent.name).join(' and ')}.`, fnTarget.id)
    }

    // This would be one up one down
    const siblings = getSiblings(fnTarget.id)
    for (const sibling of siblings) {
      const siblingsParents = getParents(sibling.id)

      addMention(`${sibling.name} is the child of ${siblingsParents.map((parent) => parent.name).join(' and ')}.`, sibling.id)
    }

    if (level < 1) {
      // Go up a level
      for (const parent of parents) {
        addCloseFamily(parent, level + 1)
      }
    }
  }

  function drillDown(fnTarget: Person, level: number) {
    const children = getChildren(fnTarget.id)
    for (const child of children) {
      const parents = getParents(child.id)
      addMention(`${child.name} is the child of ${parents.map((parent) => parent.name).join(' and ')}.`, child.id)
    }

    if (level > 0) {
      for (const child of children) {
        moveUp(child, level - 1)
        drillDown(child, level - 1)
      }
    }
  }

  function moveUp(fnTarget: Person, level: number) {
    const parents = getParents(fnTarget.id)
    if (parents.length) {
      addMention(`${fnTarget.name} is the child of ${parents.map((parent) => parent.name).join(' and ')}.`, fnTarget.id)
    }

    if (level > 0) {
      for (const parent of parents) {
        moveUp(parent, level - 1)
        drillDown(parent, level - 1)
      }
    }
  }

  // addCloseFamily(target, 0)
  // Bug: we need to move up and down to get the other parent of a sibling
  moveUp(target, 2)
  drillDown(target, 1)

  return family
}
