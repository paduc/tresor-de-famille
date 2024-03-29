import { responseAsHtml } from '../../libs/ssr/responseAsHtml.js'
import { pageRouter } from '../pageRouter.js'
import { requireAuth } from '../../dependencies/authn.js'
import { ThreadListPage } from './ThreadListPage.js'
import { getThreadListPageProps } from './getThreadListPageProps.js'
import { ThreadListPageUrl } from './ThreadListPageUrl.js'

pageRouter.route(ThreadListPageUrl).get(requireAuth(), async (request, response, next) => {
  try {
    const props = await getThreadListPageProps(request.session.user!.id)

    responseAsHtml(request, response, ThreadListPage({ ...props }))
  } catch (error) {
    next(error)
  }
})
