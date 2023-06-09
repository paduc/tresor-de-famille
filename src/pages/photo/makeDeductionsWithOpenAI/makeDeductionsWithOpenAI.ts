import zod from 'zod'
import { openai } from '../../../dependencies/LLM'
import { addToHistory } from '../../../dependencies/addToHistory'
import { postgres } from '../../../dependencies/database'
import { normalizeBBOX } from '../../../dependencies/face-recognition'
import { UUID } from '../../../domain'
import { getUuid } from '../../../libs/getUuid'
import { getPersonById } from '../../_getPersonById'
import { getPersonIdForUserId } from '../../_getPersonIdForUserId.query'
import { AWSFacesDetectedInChatPhoto } from '../../chat/recognizeFacesInChatPhoto/AWSFacesDetectedInChatPhoto'
import { OpenAIFailedToMakeDeductions } from '../../chat/sendToOpenAIForDeductions/OpenAIFailedToMakeDeductions'
import { OpenAIMadeDeductions } from '../../chat/sendToOpenAIForDeductions/OpenAIMadeDeductions'
import { OpenAIPrompted } from '../../chat/sendToOpenAIForDeductions/OpenAIPrompted'
import { UserUploadedPhotoToChat } from '../../chat/uploadPhotoToChat/UserUploadedPhotoToChat'
import { UserAddedCaptionToPhoto } from '../UserAddedCaptionToPhoto'
import { describeFamily } from './describeFamily'
import { describePhotoFaces } from './describePhotoFaces'

type MakeDeductionsWithOpenAIArgs = {
  chatId: UUID
  userId: UUID
  debug?: boolean
}
export async function makeDeductionsWithOpenAI({ chatId, userId, debug }: MakeDeductionsWithOpenAIArgs) {
  // make sure there is at least a photo with faces and at least one caption
  const photo = await getPhoto(chatId)
  if (!photo) return

  const { photoId } = photo

  const caption = await getCaptionForPhoto(photo.photoId)
  if (!caption || !caption.length) return

  const faces = await getDetectedFaces(photo.photoId)
  if (!faces || !faces.length) return

  const photoFacesDescription = await describePhotoFaces(chatId, photoId, faces)

  // Build prompt :

  const currentPersonId = await getPersonIdForUserId(userId)
  const currentPerson = await getPersonById(currentPersonId)

  // TODO: accept tp ùale deduction without knowing who the person is
  if (!currentPerson) return

  // DOING: Adapt describe family
  const family = await describeFamily({ personId: currentPersonId, distance: 1 })

  let prompt = `
You are chatting with ${currentPerson.name} and this is a description of his family:
${family.description}
${
  photoFacesDescription
    ? `${currentPerson.name} shows you a photo.
    
    Face recognition software has detected faces in the photo. From left to right : ${photoFacesDescription.description}. THE GENDERS ARE NOT TO BE TRUSTED.`
    : ''
}

${currentPerson.name} added a caption describing the photo:
"${caption}"

Use the caption and family tree to determine which persons are ${photoFacesDescription.unknownFaces.join(', ')}.${
    photoFacesDescription.knownPersons.length
      ? `${photoFacesDescription.knownPersons.join(' and ')} are not possible because they already appear in the photo.`
      : ''
  }
Use the following JSON schema for your response:
{ "steps": "First steps to determine the faces...", "faces": [{ "faceCode": "faceA", "person": "John Doe" }, ... ]}}
Use the "steps" property to explain step by step how you got the results.

You: { "steps": "`
  if (debug) console.log(prompt)

  const prefixResultWith = `{ "steps": "`

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
    const gptResult = prefixResultWith + response.data.choices[0].text
    if (!debug) {
      await addToHistory(
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
      .object({ steps: zod.string(), faces: zod.array(zod.object({ faceCode: zod.string(), person: zod.string() })) })
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
          photoId,
        })
        continue
      }
      deductions.push({
        type: 'face-is-person',
        deductionId: getUuid(),
        faceId: photoFacesDescription.faceCodeMap.codeToId(faceCode)!,
        personId,
        photoId,
      })
    }
    if (debug) {
      console.log(JSON.stringify({ deductions }, null, 2))
    }
    if (!debug) {
      await addToHistory(
        OpenAIMadeDeductions({
          chatId,
          promptId,
          deductions,
        })
      )
    }
    // TODO: addToHistory event to be used in chat thread OpenAIAnnotatedChatPhoto
  } catch (error: any) {
    console.log('OpenAI failed to parse prompt', error)
    await addToHistory(OpenAIFailedToMakeDeductions({ promptId, chatId, errorMessage: error.message || 'no message' }))
  }
}

const getPhoto = async (photoId: UUID) => {
  const { rows: photoRowsRes } = await postgres.query<UserUploadedPhotoToChat>(
    "SELECT * FROM history WHERE type='UserUploadedPhotoToChat' AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" DESC",
    [photoId]
  )

  const photoRow = photoRowsRes[0]?.payload

  return photoRow
}

async function getCaptionForPhoto(photoId: UUID) {
  const { rows } = await postgres.query<UserAddedCaptionToPhoto>(
    `SELECT * FROM history WHERE type='UserAddedCaptionToPhoto' AND payload->>'photoId'=$2 ORDER BY "occurredAt" DESC LIMIT 1`,
    [photoId]
  )

  return rows[0]?.payload.caption.body
}

async function getDetectedFaces(photoId: UUID) {
  const detectedFaces = []

  const { rows: faceDetectedRowsRes } = await postgres.query<AWSFacesDetectedInChatPhoto>(
    "SELECT * FROM history WHERE type='AWSFacesDetectedInChatPhoto' AND payload->>'photoId'=$1",
    [photoId]
  )
  const facesDetectedRows = faceDetectedRowsRes.map((row) => row.payload)
  for (const facesDetectedRow of facesDetectedRows) {
    for (const awsFace of facesDetectedRow.faces) {
      detectedFaces.push({
        faceId: awsFace.faceId,
        person: null,
        position: normalizeBBOX(awsFace.position),
      })
    }
  }

  return detectedFaces
}
