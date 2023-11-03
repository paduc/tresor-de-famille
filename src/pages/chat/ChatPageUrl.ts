import { UUID } from '../../domain'

export function ChatPageUrl(chatId: UUID): string {
  return `/chat/${chatId}/chat.html`
}

ChatPageUrl.template = '/chat/:chatId/chat.html' as const
