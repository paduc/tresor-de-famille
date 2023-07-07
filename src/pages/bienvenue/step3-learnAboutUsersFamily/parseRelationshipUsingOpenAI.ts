import { openai } from '../../../dependencies/LLM'
import { addToHistory } from '../../../dependencies/addToHistory'
import { UUID } from '../../../domain'
import { getPersonByIdOrThrow } from '../../_getPersonById'
import { FamilyMemberRelationship, isRelationWithSide, isRelationWithoutSide } from './FamilyMemberRelationship'
import { OnboardingUserPostedRelationUsingOpenAI } from './OnboardingUserPostedRelationUsingOpenAI'

type parseRelationshipUsingOpenAIArgs = {
  userId: UUID
  personId: UUID
  userAnswer: string
}

export const initialMessages: OpenAIMessage[] = [
  {
    role: 'system',
    content: `Your mission is to parse a relationship that can be freely input by a human user.`,
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

export const parseRelationshipUsingOpenAI = async ({ userId, personId, userAnswer }: parseRelationshipUsingOpenAIArgs) => {
  const { name } = await getPersonByIdOrThrow(personId)

  let messages: OpenAIMessage[] = [
    ...initialMessages,
    {
      role: 'assistant',
      content: `Qui est ${name}?`,
    },
    {
      role: 'user',
      content: userAnswer,
    },
  ]

  try {
    const response = await openai.createChatCompletion({
      model,
      functions: [
        {
          name: 'save_relationship',
          description: 'Saves the parsed relationship between family members.',
          parameters: {
            type: 'object',
            properties: {
              relationship: {
                type: 'string',
                enum: [
                  'father',
                  'mother',
                  'son',
                  'daughter',
                  'brother',
                  'sister',
                  'friend',
                  'coworker',
                  'grandfather',
                  'grandmother',
                  'uncle',
                  'aunt',
                  'wife',
                  'husband',
                ],
              },
              side: {
                type: 'string',
                enum: ['paternal', 'maternal'],
              },
              rawText: {
                type: 'string',
              },
            },
            required: ['relationship'],
          },
        },
      ],
      function_call: { name: 'save_relationship' },
      // @ts-ignore
      messages,
    })

    const result = response.data.choices[0]
    // @ts-ignore
    messages = [...messages, result.message]

    const { relationship, side, rawText } = JSON.parse(response.data.choices[0].message!.function_call!.arguments!)

    if (!relationship) throw new Error('function_call did not return a relationship')

    console.log(JSON.stringify({ relationship, side, rawText }, null, 2))

    let parsedRelationship: FamilyMemberRelationship

    if (isRelationWithoutSide(relationship)) {
      parsedRelationship = { relationship }
    } else if (isRelationWithSide(relationship)) {
      // TODO: maybe validate side
      parsedRelationship = { relationship, side }
    } else {
      // TODO: maybe validate relationship
      parsedRelationship = { relationship, precision: rawText !== userAnswer && rawText }
    }

    await addToHistory(
      OnboardingUserPostedRelationUsingOpenAI({ userId, personId, userAnswer, messages, relationship: parsedRelationship })
    )
  } catch (error) {
    console.error(error)
  }
}
