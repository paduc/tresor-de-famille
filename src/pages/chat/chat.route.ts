import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { ChatPage, ChatPageProps } from './ChatPage'
import multer from 'multer'
import zod from 'zod'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
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
import { describeFamily } from './describeFamily.query'
import { getPersonForUserId } from '../home/getPersonForUserId.query'
import { describePhotoFaces } from './describePhotoFaces.query'
import { getLatestPhotoFaces } from './getLatestPhotoFaces.query'
import { openai } from '../../dependencies/openai'
import { OpenAIPrompted } from './OpenAIPrompted'

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

    const { comment } = request.body

    const { file } = request
    if (file) {
      const photoId = getUuid()
      const { path: originalPath } = file

      const compressedFilePath = originalPath + '-compressed.jpeg'
      await sharp(originalPath).jpeg({ quality: 30 }).toFile(compressedFilePath)

      await uploadPhoto({ contents: fs.createReadStream(originalPath), id: photoId })

      await publish(UserUploadedPhotoToChat({ chatId: chatId as UUID, photoId, uploadedBy: request.session.user!.id }))

      const detectedFaces = await recognizeFacesInPhoto({
        photoContents: fs.readFileSync(compressedFilePath),
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
    } else if (comment) {
      console.log('received comment', comment)

      const latestPhotoWithFaces = await getLatestPhotoFaces(chatId)

      // console.log(JSON.stringify({ latestPhotoWithFaces }, null, 2))

      if (latestPhotoWithFaces !== null && latestPhotoWithFaces.length) {
        const photoFaces = await describePhotoFaces(latestPhotoWithFaces)

        // Build prompt :
        const currentPerson = await getPersonForUserId(request.session.user!.id)
        const family = await describeFamily({ personId: currentPerson.id, distance: 2 })

        let prompt = `
You are chatting with ${currentPerson.name} and this is a description of his family:
${family.description}

${currentPerson.name} shows you a photo where faces have been detected : ${photoFaces.description}

You are trying to describe who the faces are based on ${currentPerson.name}'s description. Use the following JSON schema for your response:
{ "faceId": "personId", ...}

${currentPerson.name}: ${comment}

You:
`
        console.log(prompt)

        try {
          const model = 'text-davinci-003'
          const response = await openai.createCompletion({
            model,
            prompt,
            temperature: 0,
            max_tokens: 2000,
            user: request.session.user!.id,
          })

          const gptResult = response.data.choices[0].text

          await publish(
            OpenAIPrompted({
              chatId,
              promptedBy: request.session.user!.id,
              prompt,
              model,
              response: gptResult,
            })
          )

          // TODO: publish event to be used in chat thread OpenAIAnnotatedChatPhoto
        } catch (error) {
          console.log('OpenAI failed to parse prompt')
        }
      }
    }

    return response.redirect(`/chat/${chatId}/chat.html`)

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
