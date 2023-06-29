import { openai } from '../../../dependencies/LLM'
import { addToHistory } from '../../../dependencies/addToHistory'
import { personsIndex, searchClient } from '../../../dependencies/search'
import { UUID } from '../../../domain'
import { getUuid } from '../../../libs/getUuid'
import { BienvenuePageProps } from '../BienvenuePage'
import { UserProgressedUsingOpenAIToPresentThemself } from './UserProgressedUsingOpenAIToPresentThemself'
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

export const parseFirstPresentation = async ({ userId, userAnswer }: ParseFirstPresentationArgs) => {
  // TODO: build prompt for an assistant parsing the presentation for a name, dob, ...

  // get previous messages
  const { steps } = await getPreviousMessages(userId)

  type OnboardingStep = BienvenuePageProps['steps'][number]
  const getNameStep = steps.find((step): step is OnboardingStep & { goal: 'get-user-name' } => step.goal === 'get-user-name')

  let messages: OpenAIMessage[] = getNameStep?.messages!

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
    // @ts-ignore
    messages = [...messages, result.message]
    if (result.finish_reason === 'stop') {
      // append it to messages and return the list
      // @ts-ignore
      await addToHistory(UserProgressedUsingOpenAIToPresentThemself({ userId, messages }))
    } else if (result.finish_reason === 'function_call') {
      try {
        const { name } = JSON.parse(result.message!.function_call!.arguments!)

        if (!name) throw new Error('Name passed to function_call was empty')

        const personId = getUuid()
        await addToHistory(UserPresentedThemselfUsingOpenAI({ userId, personId, name, messages }))

        try {
          await personsIndex.saveObject({
            objectID: personId,
            personId,
            name,
            visible_by: [`person/${personId}`, `user/${userId}`],
          })
        } catch (error) {
          console.error('Could not add new person to algolia index', error)
        }

        return null // signal mission accomplished
      } catch (error) {
        console.error('Could not parse function_call arguments', error)
        await addToHistory(UserProgressedUsingOpenAIToPresentThemself({ userId, messages }))
      }
    } else {
      console.error(`Another finish_reason invoked ${result.finish_reason}`)
      await addToHistory(UserProgressedUsingOpenAIToPresentThemself({ userId, messages }))
    }
  } catch (error) {
    console.error(error)
  }
}
