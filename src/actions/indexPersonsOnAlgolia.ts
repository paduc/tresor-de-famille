import { actionsRouter } from './actionsRouter'
import { postgres } from '../dependencies/database'
import { GedcomImported } from '../events'
import { searchClient } from '../dependencies/search'
import { requireAuth } from '../dependencies/authn'

actionsRouter.get('/indexPersonsOnAlgolia', requireAuth(), async (request, response) => {
  const { rows } = await postgres.query("SELECT * FROM history where type = 'GedcomImported'")

  const gedcom = rows[0] as GedcomImported

  if (!gedcom) {
    response.send('Cannot find Gedcom data on server').status(400)
    return
  }

  const { persons, relationships } = gedcom.payload

  const relationshipsById = relationships.reduce((relationshipsByPersonId, relationship) => {
    const { childId, parentId } = relationship

    if (!relationshipsByPersonId[childId]) {
      relationshipsByPersonId[childId] = { children: new Set(), parents: new Set() }
    }

    relationshipsByPersonId[childId].parents.add(parentId)

    if (!relationshipsByPersonId[parentId]) {
      relationshipsByPersonId[parentId] = { children: new Set(), parents: new Set() }
    }

    relationshipsByPersonId[parentId].children.add(childId)

    return relationshipsByPersonId
  }, {} as Record<string, { children: Set<string>; parents: Set<string> }>)

  const personById = persons.reduce((record, person) => ({ ...record, [person.id]: person }), {} as Record<string, any>)

  const personsForIndex = persons.map((person) => ({
    ...person,
    objectID: person.id,
    parents: Array.from(relationshipsById[person.id]?.parents || []).map((personId) => personById[personId]?.name),
    children: Array.from(relationshipsById[person.id]?.children || []).map((personId) => personById[personId]?.name),
  }))

  // console.log(JSON.stringify(personsForIndex.slice(0, 10), null, 2))

  const index = searchClient.initIndex('persons')
  try {
    await index.replaceAllObjects(personsForIndex)
  } catch (error) {
    console.error(error)
    response.send('Error while calling saveObjects')
    return
  }

  response.send('Everything is OK: indexation worked')
})
