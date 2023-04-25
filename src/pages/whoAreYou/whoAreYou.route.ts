import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { WhoAreYouPage } from './WhoAreYouPage'
import { addToHistory } from '../../dependencies/addToHistory'
import { UserHasDesignatedThemselfAsPerson } from '../../events'
import { getPersonIdForUserId } from '../_getPersonIdForUserId.query'
import { getPersonById, getPersonByIdOrThrow } from '../_getPersonById'

pageRouter
  .route('/qui-es-tu')
  .get(requireAuth(), async (request, response) => {
    console.log(`GET on /qui-es-tu`)

    responseAsHtml(request, response, WhoAreYouPage())
  })
  .post(requireAuth(), async (request, response) => {
    const { selectedPersonId } = request.body

    if (!selectedPersonId) {
      console.error('POST on /qui-es-tu called without selectedPersonId')
      responseAsHtml(request, response, WhoAreYouPage({ error: 'Vous avez oublié de vous désigner.' }))
      return
    }

    await addToHistory(
      UserHasDesignatedThemselfAsPerson({
        userId: request.session.user!.id,
        personId: selectedPersonId,
      })
    )

    try {
      const { name } = await getPersonByIdOrThrow(selectedPersonId)

      request.session.user!.name = name
    } catch (error) {
      console.error('Impossible de mettre à jour la session avec le nom de la personne. ')
    }
    response.redirect('/')
  })
