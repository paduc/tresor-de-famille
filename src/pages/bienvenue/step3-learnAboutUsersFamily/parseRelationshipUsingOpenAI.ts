import { openai } from '../../../dependencies/LLM'
import { addToHistory } from '../../../dependencies/addToHistory'
import { UUID } from '../../../domain'
import { getPersonByIdOrThrow } from '../../_getPersonById'
import { FamilyMemberRelationship, isRelationWithSide, isRelationWithoutSide } from './FamilyMemberRelationship'
import { UserPostedRelationUsingOpenAI } from './UserPostedRelationUsingOpenAI'

const relationships = [
  'father',
  'mother',
  'parent',
  'son',
  'daughter',
  'brother',
  'sister',
  'sibling',
  'grandfather',
  'grandmother',
  'grandparent',
  'uncle',
  'aunt',
  'wife',
  'husband',
  'cousin',
  'spouse',
  'friend',
  'coworker',
  'other',
] as const

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
    {
      role: 'system',
      content: `Your mission is to parse a relationship that can be freely input by a human user. If there is any doubt, use relationship='other' and enter what you understood in the 'precision' field.
      
      Who is ${name} ?
      `,
    },
    {
      role: 'user',
      content: userAnswer,
    },
  ]

  try {
    let { relationship, side, precision } = await askGPT()

    // console.log(JSON.stringify({ relationship, side, precision, userText: userAnswer }, null, 2))

    if (!isRelationshipValid(relationship)) {
      // illegal relationship
      // console.log('OpenAI returned wrong relationship.')

      // OpenAI, try again

      // @ts-ignore
      messages = [
        ...messages,
        {
          role: 'system',
          content: `As an assistant, you cannot call save_relationship with a type of relationship outside of the schema. Reminder: the valid relationships are ${relationships.join(
            ', '
          )}. If you do not see a perfect match, set relationship to 'other'.
          Concentrate and answer again:`,
        },
      ]

      const secondTry = await askGPT()

      // console.log('Second try:', JSON.stringify({ ...secondTry, userText: userAnswer }, null, 2))

      // TODO: validate again and if invalid response, force to other
      if (!isRelationshipValid(secondTry)) {
        // Still invalid response
        relationship = 'other'
        precision = userAnswer
      }
    }

    let parsedRelationship: FamilyMemberRelationship

    if (isRelationWithoutSide(relationship)) {
      parsedRelationship = { relationship }
    } else if (isRelationWithSide(relationship)) {
      // TODO: maybe validate side
      parsedRelationship = { relationship, side }
    } else {
      // TODO: maybe validate relationship
      parsedRelationship = { relationship, precision }
    }

    await addToHistory(
      UserPostedRelationUsingOpenAI({ userId, personId, userAnswer, messages, relationship: parsedRelationship })
    )
  } catch (error) {
    console.error(error)
  }

  async function askGPT() {
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
                enum: relationships,
              },
              side: {
                type: 'string',
                enum: ['paternal', 'maternal'],
              },
              precision: {
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

    try {
      const { relationship, side, precision } = JSON.parse(result.message!.function_call!.arguments!)
      return { relationship, side, precision }
    } catch (error) {
      const errorMsg = 'Could not parse the response arguments coming from OpenAI'
      console.error(errorMsg, error)

      throw new Error(errorMsg)
    }
  }
}
function isRelationshipValid(relationship: any) {
  return relationships.includes(relationship)
}
