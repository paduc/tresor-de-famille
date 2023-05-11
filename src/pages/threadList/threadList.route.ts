import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { ThreadListPage } from './ThreadListPage'
import { getThreads } from './getThreads.query'
import { ThreadListPageUrl } from './ThreadListPageUrl'

pageRouter.route(ThreadListPageUrl).get(requireAuth(), async (request, response) => {
  const threads = await getThreads(request.session.user!.id)

  responseAsHtml(request, response, ThreadListPage({ threads }))
})
