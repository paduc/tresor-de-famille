import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { ChatPage, ChatPageProps } from './ChatPage'
import multer from 'multer'
import zod from 'zod'
import fs from 'node:fs'
import { getUuid } from '../../libs/getUuid'
import { getPhotoUrlFromId, uploadPhoto } from '../../dependencies/uploadPhoto'
import { getChatHistory } from './getChatHistory.query'
import { publish } from '../../dependencies/eventStore'
import { UserUploadedPhotoToChat } from './UserUploadedPhotoToChat'
import { UUID, zIsUUID } from '../../domain'
import { recognizeFacesInPhoto } from './recognizeFacesInPhoto'
import { awsRekognitionCollectionId } from '../../dependencies/rekognition'
import { getPersonIdForFaceId } from './getPersonIdForFaceId.query'
import { FacesRecognizedInChatPhoto } from './FacesRecognizedInChatPhoto'

const FILE_SIZE_LIMIT_MB = 50
const upload = multer({
  dest: 'temp/photos',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

pageRouter.route('/chat.html').get(requireAuth(), async (request, response) => {
  console.log(`GET on /chat.html`)

  const newChatId = getUuid()

  response.redirect(`/chat/${newChatId}/chat.html`)
})

pageRouter
  .route('/chat/:chatId/chat.html')
  .get(requireAuth(), async (request, response) => {
    console.log(`GET on /chat/:chatId/chat.html`)

    const { chatId } = request.params

    const history: ChatPageProps['history'] = await getChatHistory(chatId)

    responseAsHtml(
      request,
      response,
      ChatPage({
        history,
        userProfilePicUrl: fakeProfilePicUrl,
      })
    )
  })
  .post(requireAuth(), upload.single('photo'), async (request, response) => {
    console.log(`POST on /chat.html`)

    const { chatId } = zod.object({ chatId: zIsUUID }).parse(request.params)

    const { file } = request
    if (file) {
      const photoId = getUuid()
      const { path } = file

      await uploadPhoto({ contents: fs.createReadStream(path), id: photoId })

      await publish(UserUploadedPhotoToChat({ chatId: chatId as UUID, photoId, uploadedBy: request.session.user!.id }))

      const detectedFaces = await recognizeFacesInPhoto({
        photoContents: fs.readFileSync(path),
        collectionId: awsRekognitionCollectionId,
      })

      const detectedFacesAndPersons = await Promise.all(
        detectedFaces.map(async (detectedFace) => {
          const personId = await getPersonIdForFaceId(detectedFace.AWSFaceId)

          return { ...detectedFace, personId }
        })
      )

      if (detectedFacesAndPersons.length) {
        await publish(
          FacesRecognizedInChatPhoto({
            chatId,
            photoId,
            faces: detectedFacesAndPersons,
          })
        )
      }
    }

    const history: ChatPageProps['history'] = await getChatHistory(chatId)

    responseAsHtml(
      request,
      response,
      ChatPage({
        history,
        userProfilePicUrl: fakeProfilePicUrl,
      })
    )
  })
