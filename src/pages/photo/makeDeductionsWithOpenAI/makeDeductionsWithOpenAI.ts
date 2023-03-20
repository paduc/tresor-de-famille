import zod from 'zod'
import { publish } from '../../../dependencies/eventStore'
import { openai } from '../../../dependencies/openai'
import { UUID } from '../../../domain'
import { getUuid } from '../../../libs/getUuid'
import { OpenAIFailedToMakeDeductions } from '../../chat/sendToOpenAIForDeductions/OpenAIFailedToMakeDeductions'
import { OpenAIMadeDeductions } from '../../chat/sendToOpenAIForDeductions/OpenAIMadeDeductions'
import { OpenAIPrompted } from '../../chat/sendToOpenAIForDeductions/OpenAIPrompted'
import { getPersonById } from '../../_getPersonById'
import { getPersonIdForUserId } from '../../_getPersonIdForUserId.query'
import { getPhoto } from '../getPhoto.query'
import { describeFamily } from './describeFamily'
import { describePhotoFaces } from './describePhotoFaces'

type MakeDeductionsWithOpenAIArgs = {
  chatId: UUID
  userId: UUID
  debug?: boolean
}
export async function makeDeductionsWithOpenAI({ chatId, userId, debug }: MakeDeductionsWithOpenAIArgs) {
  // getPhoto to know what we already know
  const photo = await getPhoto(chatId)

  // make sure there is at least a photo with faces and at least one caption
  if (!photo || !photo.captions || !photo.captions.length || !photo.faces || !photo.faces.length) return

  const photoFacesDescription = await describePhotoFaces(chatId, photo.id, photo.faces)

  // Build prompt :

  const currentPersonId = await getPersonIdForUserId(userId)
  const currentPerson = await getPersonById(currentPersonId)

  // TODO: accept tp ùale deduction without knowing who the person is
  if (!currentPerson) return

  // DOING: Adapt describe family
  const family = await describeFamily({ personId: currentPersonId, distance: 3 })

  let prompt = `
You are chatting with ${currentPerson.name} and this is a description of his family:
${family.description}

${
  photoFacesDescription
    ? `${currentPerson.name} shows you a photo where faces have been detected, from left to right : ${photoFacesDescription.description}`
    : ''
}

Caption:
"${photo.captions.map(({ body }) => body).join('\n')}"

Parse the caption to determine which persons are ${photoFacesDescription.unknownFaces.join(', ')}.${
    photoFacesDescription.knownPersons.length
      ? `${photoFacesDescription.knownPersons.join(' and ')} are not possible because they already appear in the photo.`
      : ''
  }
Use the following JSON schema for your response:
{ "faces": [{ "faceCode": "faceA", "person": "John Doe" }, ... ]}}

ONLY RESPOND WITH VALID JSON. DO NOT EXPLAIN THE RESULT.

You:
      `
  if (debug) console.log(prompt)

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
    if (!debug) {
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
    }
    if (!gptResult) throw new Error('Result is empty')

    const jsonGptResult = JSON.parse(gptResult)
    console.log(JSON.stringify({ jsonGptResult }, null, 2))

    const { faces } = zod
      .object({ faces: zod.array(zod.object({ faceCode: zod.string(), person: zod.string() })) })
      .parse(jsonGptResult)

    const deductions: OpenAIMadeDeductions['payload']['deductions'] = []
    for (const { faceCode, person } of faces) {
      const personId = family.personIdMap.get(person)
      if (!personId) {
        deductions.push({
          type: 'face-is-new-person',
          deductionId: getUuid(),
          faceId: photoFacesDescription.faceCodeMap.codeToId(faceCode)!,
          personId: getUuid(),
          name: person,
          photoId: photo.id,
        })
        continue
      }
      deductions.push({
        type: 'face-is-person',
        deductionId: getUuid(),
        faceId: photoFacesDescription.faceCodeMap.codeToId(faceCode)!,
        personId,
        photoId: photo.id,
      })
    }
    if (debug) {
      console.log(JSON.stringify({ deductions }, null, 2))
    }
    if (!debug) {
      await publish(
        OpenAIMadeDeductions({
          chatId,
          promptId,
          deductions,
        })
      )
    }
    // TODO: publish event to be used in chat thread OpenAIAnnotatedChatPhoto
  } catch (error: any) {
    console.log('OpenAI failed to parse prompt')
    await publish(OpenAIFailedToMakeDeductions({ promptId, chatId, errorMessage: error.message || 'no message' }))
  }
}
