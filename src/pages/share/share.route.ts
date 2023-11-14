import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { SharePage } from './SharePage'

pageRouter.route('share.html').get(requireAuth(), async (request, response) => {
  const props = {}

  // const shareUrl = new URL(BASE_URL + ChatPageUrl(chatId))
  // shareUrl.searchParams.append('code', shareEvent.payload.code)

  responseAsHtml(request, response, SharePage(props))
})
