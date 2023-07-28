import { requireAuth } from '../dependencies/authn'
import { postgres } from '../dependencies/database'
import { REGISTRATION_CODE } from '../dependencies/env'
import { personsIndex } from '../dependencies/search'
import { GedcomImported } from '../events'
import { UserNamedThemself } from '../pages/bienvenue/step1-userTellsAboutThemselves/UserNamedThemself'
import { UserNamedPersonInPhoto } from '../pages/bienvenue/step3-learnAboutUsersFamily/UserNamedPersonInPhoto'
import { PhotoAnnotatedUsingOpenAI } from '../pages/photo/annotatePhotoUsingOpenAI/PhotoAnnotatedUsingOpenAI'
import { PhotoAnnotationConfirmed } from '../pages/photo/confirmPhotoAnnotation/PhotoAnnotationConfirmed'
import { actionsRouter } from './actionsRouter'

actionsRouter.get('/resetAlgoliaIndex', requireAuth(), async (request, response) => {
  // Reset the index (remove all objects)
  personsIndex.clearObjects()

  // insert gedcom
  try {
    await indexGedcom()
  } catch (error) {
    console.error(error)
    // @ts-ignore
    response.send(error.message).status(400)
  }

  // index face-is-new-person + PhotoAnnotationConfirmed
  try {
    await indexPhotoAnnotationConfirmed()
  } catch (error) {
    console.error(error)
    // @ts-ignore
    response.send(error.message).status(400)
  }

  try {
    await indexUserNamedThemself()
  } catch (error) {
    console.error(error)
    // @ts-ignore
    response.send(error.message).status(400)
  }

  try {
    await indexUserNamedPersonInPhoto()
  } catch (error) {
    console.error(error)
    // @ts-ignore
    response.send(error.message).status(400)
  }

  response.send('Everything is OK: algolia persons index has been rebuilt')
})

async function indexUserNamedThemself() {
  const { rows: onboardedPersons } = await postgres.query<UserNamedThemself>(
    "SELECT * FROM history WHERE type = 'UserNamedThemself'"
  )

  for (const onboardedPerson of onboardedPersons) {
    const { personId, name } = onboardedPerson.payload
    await personsIndex.saveObject({
      objectID: personId,
      id: personId,
      name,
      visible_by: [`person/${personId}`, `user/${onboardedPerson.payload.userId}`],
    })
  }
}

async function indexUserNamedPersonInPhoto() {
  const { rows: onboardedPersons } = await postgres.query<UserNamedPersonInPhoto>(
    "SELECT * FROM history WHERE type = 'UserNamedPersonInPhoto'"
  )

  for (const onboardedPerson of onboardedPersons) {
    const { personId, name } = onboardedPerson.payload
    await personsIndex.saveObject({
      objectID: personId,
      id: personId,
      name,
      visible_by: [`person/${personId}`, `user/${onboardedPerson.payload.userId}`],
    })
  }
}

async function indexPhotoAnnotationConfirmed() {
  const { rows: annotationConfirmedRows } = await postgres.query<PhotoAnnotationConfirmed>(
    "SELECT * FROM history where type = 'PhotoAnnotationConfirmed'"
  )
  const { rows: annotationRows } = await postgres.query<PhotoAnnotatedUsingOpenAI>(
    "SELECT * FROM history where type = 'PhotoAnnotatedUsingOpenAI'"
  )

  for (const { payload } of annotationRows) {
    const { deductions } = payload

    for (const deduction of deductions) {
      if (deduction.type === 'face-is-new-person') {
        // check if the deduction has been confirmed
        const confirmation = annotationConfirmedRows.find(({ payload }) => payload.deductionId === deduction.deductionId)
        if (!!confirmation) {
          const { personId, name } = deduction
          await personsIndex.saveObject({
            objectID: personId,
            id: personId,
            name,
            visible_by: [`person/${personId}`, `user/${confirmation.payload.confirmedBy}`],
          })
        }
      }
    }
  }
}

async function indexGedcom() {
  const { rows } = await postgres.query<GedcomImported>("SELECT * FROM history where type = 'GedcomImported'")

  const gedcom = rows[0]

  if (!gedcom) {
    return null
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

  const personsForIndex = persons.map(({ id, name, bornOn, bornIn, passedOn, passedIn, sex }) => ({
    objectID: id,
    personId: id,
    name,
    bornOn,
    bornIn,
    passedOn,
    passedIn,
    sex,
    parents: Array.from(relationshipsById[id]?.parents || []).map((personId) => personById[personId]?.name),
    children: Array.from(relationshipsById[id]?.children || []).map((personId) => personById[personId]?.name),
    visible_by: [`person/${id}`, `user/${gedcom.payload.importedBy}`, `family/${REGISTRATION_CODE}`],
  }))

  // console.log(JSON.stringify(personsForIndex.slice(0, 10), null, 2))

  await personsIndex.replaceAllObjects(personsForIndex)
}
