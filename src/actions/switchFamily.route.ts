import { z } from 'zod'
import { requireAuth } from '../dependencies/authn'
import { zIsFamilyId } from '../domain/FamilyId'
import { actionsRouter } from './actionsRouter'

actionsRouter.route('/switchFamily').post(requireAuth(), async (request, response) => {
  const { newFamilyId, currentPage } = z.object({ newFamilyId: zIsFamilyId, currentPage: z.string() }).parse(request.body)

  request.session.currentFamilyId = newFamilyId

  response.redirect(currentPage || '/')
})
