import { openai } from '../../dependencies/LLM'
import { UUID } from '../../domain'

type ParseFirstPresentationArgs = {
  userId: UUID
  presentation: string
}

export const parseFirstPresentation = async ({ userId, presentation }: ParseFirstPresentationArgs) => {
  // TODO: build prompt for an assistant parsing the presentation for a name, dob, ...

  const prompt = ''

  const model = 'text-davinci-003'

  const response = await openai.createCompletion({
    model,
    prompt,
    temperature: 0,
    max_tokens: 2000,
    user: userId,
  })

  return
}
