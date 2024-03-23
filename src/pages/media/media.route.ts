import { requireAuth } from '../../dependencies/authn'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { MediaListPageUrl } from './MediaListPageURL'
import { MediaListPage } from './MediaListPage'

pageRouter.get(MediaListPageUrl, requireAuth(), async (request, response, next) => {
  try {
    responseAsHtml(request, response, MediaListPage({}))
  } catch (error) {
    next(error)
  }
})
