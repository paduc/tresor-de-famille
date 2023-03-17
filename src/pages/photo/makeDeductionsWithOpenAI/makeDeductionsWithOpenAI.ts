import zod from 'zod'
import { UUID } from '../../../domain'
import { getPhoto } from '../getPhoto.query'
import { describeFamily } from './describeFamily'
import { describePhotoFaces } from './describePhotoFaces'
import { getPersonForUserId } from './getPersonForUserId'

type MakeDeductionsWithOpenAIArgs = {
  chatId: UUID
  userId: UUID
}
export async function makeDeductionsWithOpenAI({ chatId, userId }: MakeDeductionsWithOpenAIArgs) {
  // getPhoto to know what we already know
  const photo = await getPhoto(chatId)

  // make sure there is at least a photo with faces and at least one caption
  if (!photo || !photo.captions || !photo.captions.length || !photo.faces || !photo.faces.length) return

  const photoFacesDescription = await describePhotoFaces([])

  // Build prompt :
  const currentPerson = await getPersonForUserId(userId)

  // TODO: accept tp ùale deduction without knowing who the person is
  if (!currentPerson) return

  // DOING: Adapt describe family
  const family = await describeFamily({ personId: currentPerson.id, distance: 2 })

  let prompt = `
      You are chatting with ${currentPerson.name} and this is a description of his family:
      ${family.description}

      ${
        photoFacesDescription
          ? `${currentPerson.name} shows you a photo where faces have been detected : ${photoFacesDescription.description}`
          : ''
      }

      You are trying to describe who the faces are based on ${
        currentPerson.name
      }'s description. Use the following JSON schema for your response:
      { "faces": [{ "faceCode": "faceA", "personCode": "personA" }, ... ]}

      ONLY RESPOND WITH VALID JSON. DO NOT EXPLAIN THE RESULT.

      ${photo.captions.map(({ body }) => `\n${currentPerson.name}: ${body}`)}

      You:
      `
  console.log(prompt)

  //   const promptId = getUuid()
  //   try {
  //     const model = 'text-davinci-003'
  //     const response = await openai.createCompletion({
  //       model,
  //       prompt,
  //       temperature: 0,
  //       max_tokens: 2000,
  //       user: userId,
  //     })

  //     const gptResult = response.data.choices[0].text

  //     await publish(
  //       OpenAIPrompted({
  //         chatId,
  //         promptId: promptId,
  //         promptedBy: userId,
  //         prompt,
  //         model,
  //         response: gptResult,
  //       })
  //     )

  //     if (!gptResult) throw new Error('Result is empty')
  //     const jsonGptResult = JSON.parse(gptResult)

  //     const { faces } = zod
  //       .object({ faces: zod.array(zod.object({ faceCode: zod.string(), personCode: zod.string() })) })
  //       .parse(jsonGptResult)

  //     await publish(
  //       OpenAIMadeDeductions({
  //         chatId,
  //         promptId,
  //         messageId,
  //         deductions: faces.map(({ faceCode, personCode }) => ({
  //           type: 'face-is-person',
  //           faceId: photoFaces.faceCodeMap.codeToId(faceCode)!,
  //           personId: family.personCodeMap.codeToId(personCode)!,
  //           photoId: latestPhotoWithFaces.photoId,
  //         })),
  //       })
  //     )

  //     // TODO: publish event to be used in chat thread OpenAIAnnotatedChatPhoto
  //   } catch (error: any) {
  //     console.log('OpenAI failed to parse prompt')
  //     await publish(OpenAIFailedToMakeDeductions({ promptId, chatId, errorMessage: error.message || 'no message' }))
  //   }
  // }
}
