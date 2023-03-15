import zod from 'zod'
import { getUuid } from '../../../libs/getUuid'
import { publish } from '../../../dependencies/eventStore'
import { UUID } from '../../../domain'
import { describeFamily } from './describeFamily.query'
import { getPersonForUserId } from '../../home/getPersonForUserId.query'
import { describePhotoFaces } from './describePhotoFaces.query'
import { getLatestPhotoFaces } from './getLatestPhotoFaces.query'
import { openai } from '../../../dependencies/openai'
import { OpenAIPrompted } from './OpenAIPrompted'
import { OpenAIFailedToMakeDeductions } from './OpenAIFailedToMakeDeductions'
import { OpenAIMadeDeductions } from './OpenAIMadeDeductions'

type SendToOpenAIForDeductionsArgs = {
  chatId: UUID
  userId: UUID
  message: string
  messageId: UUID
}
export async function sendToOpenAIForDeductions({ chatId, userId, message, messageId }: SendToOpenAIForDeductionsArgs) {
  const latestPhotoWithFaces = await getLatestPhotoFaces(chatId)

  // console.log(JSON.stringify({ latestPhotoWithFaces }, null, 2))
  if (latestPhotoWithFaces !== null) {
    const photoFaces = await describePhotoFaces(latestPhotoWithFaces.faces)

    // Build prompt :
    const currentPerson = await getPersonForUserId(userId)
    const family = await describeFamily({ personId: currentPerson.id, distance: 2 })

    let prompt = `
      You are chatting with ${currentPerson.name} and this is a description of his family:
      ${family.description}

      ${currentPerson.name} shows you a photo where faces have been detected : ${photoFaces.description}

      You are trying to describe who the faces are based on ${currentPerson.name}'s description. Use the following JSON schema for your response:
      { "faces": [{ "faceCode": "faceA", "personCode": "personA" }, ... ]}

      ONLY RESPOND WITH VALID JSON. DO NOT EXPLAIN THE RESULT.

      ${currentPerson.name}: ${message}

      You:
      `
    console.log(prompt)

    const promptId = getUuid()
    try {
      const model = 'text-davinci-003'
      const response = await openai.createCompletion({
        model,
        prompt,
        temperature: 0,
        max_tokens: 2000,
        user: userId,
      })

      const gptResult = response.data.choices[0].text

      await publish(
        OpenAIPrompted({
          chatId,
          promptId: promptId,
          promptedBy: userId,
          prompt,
          model,
          response: gptResult,
        })
      )

      if (!gptResult) throw new Error('Result is empty')
      const jsonGptResult = JSON.parse(gptResult)

      const { faces } = zod
        .object({ faces: zod.array(zod.object({ faceCode: zod.string(), personCode: zod.string() })) })
        .parse(jsonGptResult)

      await publish(
        OpenAIMadeDeductions({
          chatId,
          promptId,
          messageId,
          deductions: faces.map(({ faceCode, personCode }) => ({
            type: 'face-is-person',
            faceId: photoFaces.faceCodeMap.codeToId(faceCode)!,
            personId: family.personCodeMap.codeToId(personCode)!,
            photoId: latestPhotoWithFaces.photoId,
          })),
        })
      )

      // TODO: publish event to be used in chat thread OpenAIAnnotatedChatPhoto
    } catch (error: any) {
      console.log('OpenAI failed to parse prompt')
      await publish(OpenAIFailedToMakeDeductions({ promptId, chatId, errorMessage: error.message || 'no message' }))
    }
  }
}
