import multer from 'multer'
import fs from 'node:fs'
import z from 'zod'
import { createHash } from 'node:crypto'

import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { uploadPhoto } from '../../dependencies/photo-storage'
import { zIsUUID } from '../../domain'
import { decodeTipTapJSON, encodeStringy } from './TipTapTypes'
import { getUuid } from '../../libs/getUuid'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { detectFacesInPhotoUsingAWS } from '../photo/recognizeFacesInChatPhoto/detectFacesInPhotoUsingAWS'
import { ChatPage } from './ChatPage/ChatPage'
import { UserInsertedPhotoInRichTextThread } from './UserInsertedPhotoInRichTextThread'
import { UserSetChatTitle } from './UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from './UserUpdatedThreadAsRichText'
import { getChatPageProps } from './getChatHistory/getChatPageProps'
import { UserSentMessageToChat } from './sendMessageToChat/UserSentMessageToChat'
import { UserEnabledSharingOfThread } from './UserEnabledSharingOfThread'
import { ChatPageUrl } from './ChatPageUrl'
import { SHARING_CODE_HASH_SEED } from '../../dependencies/env'

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

const FILE_SIZE_LIMIT_MB = 50
const upload = multer({
  dest: 'temp/photos',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

pageRouter
  .route('/chat.html')
  .get(requireAuth(), async (request, response) => {
    const newChatId = getUuid()

    response.redirect(ChatPageUrl(newChatId))
  })
  .post(requireAuth(), async (request, response) => {
    const userId = request.session.user!.id

    const chatId = getUuid()

    const { message } = request.body

    if (message) {
      const messageId = getUuid()

      await addToHistory(
        UserSentMessageToChat({
          chatId,
          userId,
          message,
          messageId,
        })
      )
    }

    // TODO: try catch error and send it back as HTML (or redirect if OK)
    return response.redirect(ChatPageUrl(chatId))
  })

pageRouter
  .route(ChatPageUrl.template)
  .get(requireAuth(), async (request, response) => {
    const { chatId } = z.object({ chatId: zIsUUID }).parse(request.params)
    const userId = request.session.user!.id

    const props = await getChatPageProps({ chatId, userId })

    // console.log(JSON.stringify({ props }, null, 2))

    responseAsHtml(request, response, ChatPage(props))
  })
  .post(requireAuth(), upload.single('photo'), async (request, response) => {
    try {
      const userId = request.session.user!.id
      const { chatId } = z.object({ chatId: zIsUUID }).parse(request.params)

      const { action } = z
        .object({
          action: z.enum([
            'clientsideTitleUpdate',
            'newMessage',
            'saveRichContentsAsJSON',
            'insertPhotoAtMarker',
            'clientsideUpdate',
            'enableSharing',
          ]),
        })
        .parse(request.body)

      if (action === 'newMessage') {
        const { message } = z.object({ message: z.string() }).parse(request.body)
        const messageId = getUuid()

        if (message.trim().length) {
          await addToHistory(
            UserSentMessageToChat({
              chatId,
              userId,
              message: message.trim(),
              messageId,
            })
          )
        }
      } else if (action === 'clientsideTitleUpdate') {
        const { title } = z.object({ title: z.string() }).parse(request.body)

        await addToHistory(
          UserSetChatTitle({
            chatId,
            userId,
            title: title.trim(),
          })
        )
      } else if (action === 'insertPhotoAtMarker') {
        const { file } = request
        const photoId = getUuid()

        if (!file) return new Error('We did not receive any image.')
        const { path: originalPath } = file

        const { contentAsJSONEncoded } = z.object({ contentAsJSONEncoded: z.string() }).parse(request.body)

        const contentAsJSON = decodeTipTapJSON(contentAsJSONEncoded)

        const markerIndex = contentAsJSON.content.findIndex((node) => node.type === 'insertPhotoMarker')
        if (markerIndex === -1) throw new Error('Cannot find marker in content')

        contentAsJSON.content.splice(markerIndex, 1, {
          type: 'photoNode',
          attrs: { photoId, chatId, personsInPhoto: encodeStringy([]), unrecognizedFacesInPhoto: 0, description: '', url: '' },
        })

        // Remove old markers just in case
        contentAsJSON.content = contentAsJSON.content.filter((node) => node.type !== 'insertPhotoMarker')

        const location = await uploadPhoto({ contents: fs.createReadStream(originalPath), id: photoId })

        await addToHistory(
          UserInsertedPhotoInRichTextThread({
            chatId,
            photoId,
            userId,
            location,
            contentAsJSON,
          })
        )

        await detectFacesInPhotoUsingAWS({ file, photoId })
      } else if (action === 'enableSharing') {
        const hash = createHash('sha1')
        hash.update(SHARING_CODE_HASH_SEED)
        hash.update(chatId)

        await addToHistory(
          UserEnabledSharingOfThread({
            chatId,
            userId,
            code: hash.digest('base64url'),
          })
        )
      }

      return response.redirect(`/chat/${chatId}/chat.html`)
    } catch (error) {
      console.error(error)
      return response.status(500).send(
        `Votre requête a provoqué une erreur.
          Merci de faire attention la prochaine fois ! ;)
          Plus sérieusement, l'administrateur a été prévenu et corrige dès que possible. Merci de votre patience.`
      )
    }
  })
