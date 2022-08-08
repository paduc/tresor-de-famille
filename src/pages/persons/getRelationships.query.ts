import { postgres } from '../../dependencies/postgres'
import { Person } from '../../types/Person'
import { Relationship } from '../../types/Relationship'

import { getPerson } from './getPerson.query'

export const getRelationships = async () => {
  const { rows } = await postgres.query("SELECT * FROM events where type = 'GedcomImported'")

  const getPersonRequest = await getPerson()

  const gedcom = rows[0]

  const {
    payload: { relationships, persons },
  } = gedcom

  const {
    payload: { userId, personId },
  } = getPersonRequest

  const person = persons.find((person: { id: string }) => person.id === personId)

  const parentsIds = relationships
    .filter((parent: { childId: string }) => parent.childId === personId)
    .map((p: { parentId: string }) => p.parentId)

  const parents = parentsIds.map((p: string) => persons.find((e: { id: string }) => e.id === p))

  const childrenIds = relationships
    .filter((children: { parentId: string }) => children.parentId === personId)
    .map((c: { childId: string }) => c.childId)

  const children = childrenIds ? childrenIds.map((c: string) => persons.find((e: { id: string }) => e.id === c)) : null

  const spousesIds = children
    ? children
        .map((child: Person) =>
          relationships.find(
            (spouse: { childId: string; parentId: string }) => spouse.childId === child!.id && spouse.parentId !== person!.id
          )
        )
        .map((spouse: { parentId: string }) => spouse?.parentId)
    : null

  const spouseId = spousesIds?.filter((spouse: string, i: number) => spousesIds.indexOf(spouse) == i)

  const spouse = spouseId?.map((co: string) => persons.find((p: { id: string }) => p.id === co))

  const siblingsIds = parentsIds
    .map((parent: string) => relationships.filter((per: Relationship) => per.parentId === parent && per.childId !== person!.id))
    .flat(2)
    .map((e: any) => e.childId)

  const siblingsId = siblingsIds.filter((siblings: string[], i: number) => siblingsIds.indexOf(siblings) == i)

  const siblings = siblingsId.map((sibling: string) => persons.find((p: Person) => p.id === sibling))

  const relationship = {
    userId,
    personId,
    person,
    parents,
    children,
    spouse,
    siblings,
  }
  return relationship
}
