import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { ImportGedcomSuccessPage } from './ImportGedcomSuccessPage'
import { requireAuth } from '../../dependencies/authn'
import { getGedcom } from './getGedcom.query'
import { UserHasDesignatedThemselfAsPerson } from '../../events/UserHasDesignatedThemselfAsPerson'
import { publish } from '../../dependencies/eventStore'
import z from 'zod'

pageRouter.route('/importGedcomSuccess.html').get(requireAuth(), async (request, response) => {
  console.log(`GET on /importGedcomSucess.html`)
  const gedcom = await getGedcom()

  // @ts-ignore
  responseAsHtml(request, response, ImportGedcomSuccessPage({ gedcom }))
})

pageRouter.route('/importGedcomSuccess.html').post(async (request, response) => {
  try {
    const { personId } = z
      .object({
        personId: z.string().uuid(),
      })
      .parse(request.body)

    const userId = request.session.id

    console.log('POST on /importGedcomSuccess.html')

    await publish(UserHasDesignatedThemselfAsPerson({ userId, personId }))

    response.redirect(`/person/:${personId}'`)
  } catch (error) {
    const gedcom = await getGedcom()

    return responseAsHtml(
      request,
      response,
      ImportGedcomSuccessPage({
        gedcom,
        error: "Une erreur s'est produite lors de votre désignation dans la liste.",
      })
    )
  }
})