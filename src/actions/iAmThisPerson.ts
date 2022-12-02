import { requireAuth } from '../dependencies/authn'
import { publish } from '../dependencies/eventStore'
import { UserHasDesignatedThemselfAsPerson } from '../events/UserHasDesignatedThemselfAsPerson'
import { actionsRouter } from './actionsRouter'

actionsRouter.post('/iAmThisPerson', requireAuth(), async (request, response) => {
  const { selectedPersonId } = request.body

  if (!selectedPersonId) {
    console.error('/iAmThisPerson called without selectedPersonId')
    response.redirect('/qui-es-tu?error=validatedWithoutSelection')
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
