import { openai } from '../../../dependencies/LLM'
import { addToHistory } from '../../../dependencies/addToHistory'
import { searchClient } from '../../../dependencies/search'
import { UUID } from '../../../domain'
import { getUuid } from '../../../libs/getUuid'
import { BienvenuePageProps } from '../BienvenuePage'
import { OnboardingUsingOpenAIProgressed } from './OnboardingUsingOpenAIProgressed'
import { UserPresentedThemselfUsingOpenAI } from './UserPresentedThemselfUsingOpenAI'
import { getPreviousMessages } from './getPreviousMessages'

type ParseFirstPresentationArgs = {
  userId: UUID
  userAnswer: string
}

export const initialMessages: OpenAIMessage[] = [
  {
    role: 'system',
    content: `You are a gentle assistant specialized in asking a user their name. You DO NOT ask users what you can do for them. Focus on getting the user's name.`,
  },
  {
    role: 'assistant',
    content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
  },
]

export type OpenAIMessage = {
  role: 'assistant' | 'user' | 'system'
  content: string | null
  function_call?: {
    name: string
    arguments: string
  }
}
const model = 'gpt-3.5-turbo-0613'

export const parseFirstPresentation = async ({
  userId,
  userAnswer,
}: ParseFirstPresentationArgs): Promise<BienvenuePageProps | null> => {
  // TODO: build prompt for an assistant parsing the presentation for a name, dob, ...

  // get previous messages
  let messages: OpenAIMessage[] = await getPreviousMessages(userId)

  if (messages.length && messages.some(({ function_call }) => !!function_call)) {
    return null
  }

  // appends the user's latest answer
  messages = [...messages, { role: 'user', content: userAnswer }]

  try {
    const response = await openai.createChatCompletion({
      model,
      functions: [
        {
          name: 'save_user_name',
          description: "Saves the user's name as soon as we have it.",
          parameters: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
            required: ['name'],
          },
        },
      ],
      function_call: 'auto',
      // @ts-ignore
      messages,
    })

    const result = response.data.choices[0]
    if (result.finish_reason === 'stop') {
      // append it to messages and return the list
      // @ts-ignore
      messages = [...messages, result.message]
      await addToHistory(OnboardingUsingOpenAIProgressed({ userId, messages }))
    } else if (result.finish_reason === 'function_call') {
      // append it to messages and return the list
      // @ts-ignore
      messages = [...messages, result.message]
      await addToHistory(OnboardingUsingOpenAIProgressed({ userId, messages }))

      try {
        const { name } = JSON.parse(result.message!.function_call!.arguments!)

        if (!name) throw new Error('Name passed to function_call was empty')

        const personId = getUuid()
        await addToHistory(UserPresentedThemselfUsingOpenAI({ userId, personId, name }))

        const index = searchClient.initIndex('persons')
        try {
          await index.saveObject({
            objectID: personId,
            id: personId,
            name,
            visible_by: [`person/${personId}`, `user/${userId}`],
          })
        } catch (error) {
          console.error('Could not add new person to algolia index', error)
        }

        return null // signal mission accomplished
      } catch (error) {
        console.error('Could not parse function_call arguments', error)
      }
    } else {
      console.error(`Another finish_reason invoked ${result.finish_reason}`)
    }

    return { messages }
  } catch (error) {
    console.error(error)
    return { messages: [...messages, { role: 'assistant', content: "Oops, je n'ai pas eu ton dernier message !" }] }
  }
}
