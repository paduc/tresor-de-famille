import { Configuration, OpenAIApi } from 'openai'
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG,
})
export const openai = new OpenAIApi(configuration)

// const response = await openai.createCompletion({
//   model: 'text-davinci-003',
//   prompt: 'Say this is a test',
//   temperature: 0,
//   max_tokens: 2000,
//   user: 'uuid' // optionnal
// })

// const completion = await openai.createChatCompletion({
//   model: 'gpt-3.5-turbo',
//   messages: [
//     {
//       role: 'system',
//       content: 'You are a nice assistant.',
//     },
//     {
//       role: 'user',
//       name: 'Pierre',
//       content: 'What color are bluebirds ?',
//     },
//   ],
//   temperature: 0
// })
