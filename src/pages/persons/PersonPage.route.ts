import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { PersonPage } from './PersonPage'
import { requireAuth } from '../../dependencies/authn'

import { getRelationships } from './getRelationships.query'
import { publish } from '../../dependencies/eventStore'
import { ChildAdded } from '../../events/ChildAdded'
import { SpouseAdded } from '../../events/SpouseAdded'
import { ParentAdded } from '../../events/ParentAdded'

import { v4 as uuid } from 'uuid'

import z from 'zod'

pageRouter.route('/person/:personId').get(requireAuth(), async (request, response) => {
  console.log(`GET on /person`)

  const relationships = await getRelationships()

  responseAsHtml(request, response, PersonPage({ relationships }))
})

pageRouter.route('/person/:personId').post(async (request, response) => {
  const SIBBLINGS = 'Ses enfants'
  const SPOUSE = 'Son/Sa compagne'
  const PARENTS = 'Ses parents'

  try {
    const { personId, relationship, name } = z
      .object({
        personId: z.string().uuid(),
        relationship: z.string(),
        name: z.string(),
      })
      .parse(request.body)

    console.log('POST on /person/:personId')

    if (relationship === SIBBLINGS) await publish(ChildAdded({ child: { id: uuid(), name }, personId }))
    if (relationship === SPOUSE) await publish(SpouseAdded({ spouse: { id: uuid(), name }, personId }))
    if (relationship === PARENTS) await publish(ParentAdded({ parent: { id: uuid(), name }, personId }))

    response.redirect(`/person/:${personId}'`)
  } catch (error) {
    const relationships = await getRelationships()

    return responseAsHtml(
      request,
      response,
      PersonPage({
        relationships,
        error: "Une erreur s'est produite lors de votre ajout.",
      })
    )
  }
})
