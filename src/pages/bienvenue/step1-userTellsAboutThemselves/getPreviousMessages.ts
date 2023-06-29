import { postgres } from '../../../dependencies/database'
import { UUID } from '../../../domain'
import { getUuid } from '../../../libs/getUuid'
import { BienvenuePageProps } from '../BienvenuePage'
import { UserProgressedUsingOpenAIToPresentThemself } from './UserProgressedUsingOpenAIToPresentThemself'
import { UserPresentedThemselfUsingOpenAI } from './UserPresentedThemselfUsingOpenAI'
import { initialMessages } from './parseFirstPresentation'

export async function getPreviousMessages(userId: UUID): Promise<BienvenuePageProps> {
  const props: BienvenuePageProps = {
    steps: [],
  }

  // Get UserPresentedThemselfUsingOpenAI to have access to personId and name
  const { rows: userPresentRows } = await postgres.query<UserPresentedThemselfUsingOpenAI>(
    "SELECT * FROM history WHERE type='UserPresentedThemselfUsingOpenAI' AND payload->>'userId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
    [userId]
  )

  if (userPresentRows.length) {
    const { personId, name, messages } = userPresentRows[0].payload

    props.steps.push({
      goal: 'get-user-name',
      stage: 'done',
      messages,
      result: {
        personId,
        name,
      },
    })
  } else {
    // Get the latest onboarding progress event
    const { rows: messageRow } = await postgres.query<UserProgressedUsingOpenAIToPresentThemself>(
      "SELECT * FROM history WHERE type='UserProgressedUsingOpenAIToPresentThemself' AND payload->>'userId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
      [userId]
    )

    // Revert to initialMessages if no progress event
    const messages = messageRow.length ? messageRow[0].payload.messages : [...initialMessages]

    props.steps.push({
      goal: 'get-user-name',
      stage: 'in-progress',
      messages,
    })
  }

  return props
}
