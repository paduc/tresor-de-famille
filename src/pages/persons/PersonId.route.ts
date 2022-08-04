import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { PersonIdPage } from './PersonIdPage'
import { requireAuth } from '../../dependencies/authn'
import { getPerson } from './getPerson.query'
import { getGedcom } from '../importGedcomSuccess/getGedcom.query'

pageRouter.route('/person.html').get(requireAuth(), async (request, response) => {
  console.log(`GET on /person`)

  // @ts-ignore
  returnPersonIdPage(request, response)
})

export const returnPersonIdPage = async (request: Request, response: Response) => {
  const getPersonRequest = await getPerson()
  const {
    payload: { userId, personId },
  } = getPersonRequest

  const gedcomImported = await getGedcom()

  const {
    payload: { relationships, persons },
  } = gedcomImported

  const parentsIds = relationships.filter((parent) => parent.childId === personId).map((p) => p.parentId)

  const childrenIds = relationships.filter((children) => children.parentId === personId).map((c) => c.childId)

  const parents = parentsIds.map((p) => persons.find((e) => e.id === p))

  const childrens = childrenIds ? childrenIds.map((c) => persons.find((e) => e.id === c)) : null

  const person = persons.find((person) => person.id === personId)

  // @ts-ignore
  responseAsHtml(request, response, PersonIdPage({ userId, personId, person, parents, childrens }))
}
