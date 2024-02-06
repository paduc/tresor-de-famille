import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { ThreadListPage } from './ThreadListPage'
import { getThreadListPageProps } from './getThreadListPageProps'
import { ThreadListPageUrl } from './ThreadListPageUrl'

pageRouter.route(ThreadListPageUrl).get(requireAuth(), async (request, response, next) => {
  try {
    const props = await getThreadListPageProps(request.session.user!.id)

    responseAsHtml(request, response, ThreadListPage({ ...props }))
  } catch (error) {
    next(error)
  }
})
