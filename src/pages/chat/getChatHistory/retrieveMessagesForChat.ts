import { message } from 'aws-sdk/clients/sns'
import { postgres } from '../../../dependencies/database'
import { getProfilePicUrlForUser } from '../../../dependencies/photo-storage'
import { UUID } from '../../../domain'
import { ChatEvent } from '../ChatPage/ChatPage'
import { UserSentMessageToChat } from '../sendMessageToChat/UserSentMessageToChat'
import { getEventList } from '../../../dependencies/getEventList'
import { OnboardingUserStartedFirstThread } from '../../bienvenue/step4-start-thread/OnboardingUserStartedFirstThread'

type ChatMessageItem = ChatEvent & {
  type: message
}

export async function retrieveMessagesForChat(chatId: UUID): Promise<ChatMessageItem[]> {
  const chatMessages = await getEventList<UserSentMessageToChat>('UserSentMessageToChat', { chatId })

  const onboardingThread = await getEventList<OnboardingUserStartedFirstThread>('OnboardingUserStartedFirstThread', {
    threadId: chatId,
  })

  const messageRows = [...chatMessages, ...onboardingThread]

  const messages = messageRows.map(({ occurredAt, payload: { message } }): ChatEvent & { type: 'message' } => ({
    type: 'message',
    timestamp: occurredAt.getTime(),
    message: {
      body: message,
    },
  }))
  return messages
}
