import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { ChatPage } from './ChatPage'

pageRouter.route('/chat.html').get(requireAuth(), async (request, response) => {
  console.log(`GET on /chat.html`)

  responseAsHtml(request, response, ChatPage())
})
