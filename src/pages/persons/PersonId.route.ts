import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { PersonIdPage } from './PersonIdPage'
import { requireAuth } from '../../dependencies/authn'
import { getPerson } from './getPerson.query'
import { getGedcom } from '../importGedcomSuccess/getGedcom.query'

pageRouter.route('/person/:personId').get(requireAuth(), async (request, response) => {
  console.log(`GET on /person`)

  // @ts-ignore
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

  const childrens = childrenIds ? childrenIds.map((c) => persons.find((e) => e.id === c)) : null

  const companionsIds = childrens
    ? childrens
        .map((child) => relationships.find((companion) => companion.childId === child!.id && companion.parentId !== person!.id))
        .map((companion) => companion?.parentId)
    : null

  const companionId = companionsIds?.filter((companion, i) => companionsIds.indexOf(companion) == i)

  const companion = companionId?.map((co) => persons.find((p) => p.id === co))

  const brotherAndSisterIds = parentsIds
    .map((parent) => relationships.filter((per) => per.parentId === parent && per.childId !== person!.id))
    .flat(2)
    .map((e) => e.childId)

  const brotherAndSisterId = brotherAndSisterIds.filter((siblings, i) => brotherAndSisterIds.indexOf(siblings) == i)

  const brotherAndSister = brotherAndSisterId.map((sibling) => persons.find((p) => p.id === sibling))

  // @ts-ignore
  responseAsHtml(request, response, PersonIdPage({ userId, personId, person, parents, childrens, companion, brotherAndSister }))
})
