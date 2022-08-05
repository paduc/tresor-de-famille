import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { PersonPage } from './PersonPage'
import { requireAuth } from '../../dependencies/authn'
import { getPerson } from './getPerson.query'
import { getGedcom } from '../importGedcomSuccess/getGedcom.query'

pageRouter.route('/person/:personId').get(requireAuth(), async (request, response) => {
  console.log(`GET on /person`)

  const getPersonRequest = await getPerson()
  const gedcomImported = await getGedcom()

  const {
    payload: { userId, personId },
  } = getPersonRequest

  const {
    payload: { relationships, persons },
  } = gedcomImported

  const person = persons.find((person) => person.id === personId)

  const parentsIds = relationships.filter((parent) => parent.childId === personId).map((p) => p.parentId)

  const parents = parentsIds.map((p) => persons.find((e) => e.id === p))

  const childrenIds = relationships.filter((children) => children.parentId === personId).map((c) => c.childId)

  const children = childrenIds ? childrenIds.map((c) => persons.find((e) => e.id === c)) : null

  const spousesIds = children
    ? children
        .map((child) => relationships.find((spouse) => spouse.childId === child!.id && spouse.parentId !== person!.id))
        .map((spouse) => spouse?.parentId)
    : null

  const spouseId = spousesIds?.filter((spouse, i) => spousesIds.indexOf(spouse) == i)

  const spouse = spouseId?.map((co) => persons.find((p) => p.id === co))

  const siblingsIds = parentsIds
    .map((parent) => relationships.filter((per) => per.parentId === parent && per.childId !== person!.id))
    .flat(2)
    .map((e) => e.childId)

  const siblingsId = siblingsIds.filter((siblings, i) => siblingsIds.indexOf(siblings) == i)

  const siblings = siblingsId.map((sibling) => persons.find((p) => p.id === sibling))

  // @ts-ignore
  responseAsHtml(request, response, PersonPage({ userId, personId, person, parents, children, spouse, siblings }))
})
