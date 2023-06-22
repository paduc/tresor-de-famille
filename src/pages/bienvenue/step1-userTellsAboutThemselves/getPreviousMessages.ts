import { postgres } from '../../../dependencies/database'
import { UUID } from '../../../domain'
import { OnboardingUsingOpenAIProgressed } from './OnboardingUsingOpenAIProgressed'
import { initialMessages } from './parseFirstPresentation'

export async function getPreviousMessages(userId: UUID) {
  const { rows: messageRow } = await postgres.query<OnboardingUsingOpenAIProgressed>(
    "SELECT * FROM history WHERE type='OnboardingUsingOpenAIProgressed' AND payload->>'userId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
    [userId]
  )

  return messageRow.length ? messageRow[0].payload.messages : [...initialMessages]
}
