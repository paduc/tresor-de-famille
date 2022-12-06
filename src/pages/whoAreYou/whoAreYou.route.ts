import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { WhoAreYouPage } from './WhoAreYouPage'
import { publish } from '../../dependencies/eventStore'
import { UserHasDesignatedThemselfAsPerson } from '../../events'

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

    await publish(
      UserHasDesignatedThemselfAsPerson({
        userId: request.session.user!.id,
        personId: selectedPersonId,
      })
    )

    response.redirect('/')
  })
