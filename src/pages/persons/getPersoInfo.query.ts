import { postgres } from '../../dependencies/postgres'
import { Person } from '../../types/Person'
import { GedcomImported } from '../../events/GedcomImported'

export type Relationship = {
  parentId: string
  childId: string
}

type PersonDetailed = Person & {
  bornOn?: string
  bornIn?: string
  passedOn?: string
  passedIn?: string
  sex?: string
  profilePictureId?: string | null
  picturedIn?: string
}

export const getPersonInfo = async () => {
  const personQuery = await postgres.query("SELECT * FROM events where type = 'UserHasDesignatedHimselfAsPerson'")

  const personDesignate = personQuery.rows[0]

  const {
    payload: { userId, personId },
  } = personDesignate

  const { rows } = await postgres.query("SELECT * FROM events where type = 'GedcomImported' AND payload->>'importedBy'=$1", [
    userId,
  ])
  const gedcom = rows[0] as GedcomImported

  const {
    payload: { relationships, persons },
  } = gedcom

  const person = persons.find((person: { id: string }) => person.id === personId)!

  const parentsIds = relationships
    .filter((parent: { childId: string }) => parent.childId === personId)
    .map((p: { parentId: string }) => p.parentId)

  const parents = getParents(parentsIds, persons)

  const children = getChildren(relationships, persons, personId)

  const spouse = getSpouse(children, relationships, persons, person)

  const siblings = getSiblings(parentsIds, relationships, person, persons)

  return {
    userId,
    personId,
    person,
    parents,
    children,
    spouse,
    siblings,
  }
}

const getParents = (parentsIds: string[], persons: PersonDetailed[]) => {
  return parentsIds.map((parentId) => persons.find((person) => person.id === parentId))
}

const getChildren = (relationships: Relationship[], persons: PersonDetailed[], personId: string) => {
  const childrenIds = relationships.filter((children) => children.parentId === personId).map((child) => child.childId)

  return childrenIds ? childrenIds.map((child) => persons.find((person) => person.id === child)) : null
}

const getSpouse = (
  children: PersonDetailed[],
  relationships: Relationship[],
  persons: PersonDetailed[],
  person: PersonDetailed
) => {
  const spousesIds = children
    ? children
        .map((child) => relationships.find((spouse) => spouse.childId === child!.id && spouse.parentId !== person!.id))
        .map((spouse) => spouse?.parentId)
    : null

  const spouseId = spousesIds?.filter((spouse, i) => spousesIds.indexOf(spouse) == i)

  return spouseId?.map((co) => persons.find((person) => person.id === co))
}

const getSiblings = (
  parentsIds: string[],
  relationships: Relationship[],
  person: PersonDetailed,
  persons: PersonDetailed[]
) => {
  const siblingsIds = parentsIds
    .map((parent) => relationships.filter((per) => per.parentId === parent && per.childId !== person!.id))
    .flat(2)
    .map((child: any) => child.childId)

  const siblingsId = siblingsIds.filter((siblings, i) => siblingsIds.indexOf(siblings) == i)

  return siblingsId.map((sibling: string) => persons.find((p) => p.id === sibling))
}
