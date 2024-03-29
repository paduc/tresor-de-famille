import { getEventList } from '../dependencies/getEventList.js'
import { ThreadId } from '../domain/ThreadId.js'
import { UserSentMessageToChat } from '../events/deprecated/UserSentMessageToChat.js'
import { UserInsertedPhotoInRichTextThread } from './thread/UserInsertedPhotoInRichTextThread.js'
import { UserSetChatTitle } from './thread/UserSetChatTitle.js'
import { UserUpdatedThreadAsRichText } from './thread/UserUpdatedThreadAsRichText.js'

export type ThreadEvent =
  | UserSetChatTitle
  | UserSentMessageToChat
  // | UserUploadedPhotoToChat
  | UserUpdatedThreadAsRichText
  | UserInsertedPhotoInRichTextThread

export async function getThreadEvents(threadId: ThreadId): Promise<ThreadEvent[]> {
  const updateEvents = await getEventList<
    | UserSetChatTitle
    | UserSentMessageToChat
    // | UserUploadedPhotoToChat
    | UserUpdatedThreadAsRichText
    | UserInsertedPhotoInRichTextThread
  >(['UserSetChatTitle', 'UserSentMessageToChat', 'UserUpdatedThreadAsRichText', 'UserInsertedPhotoInRichTextThread'], {
    threadId,
  })

  return updateEvents
    .filter((event): event is ThreadEvent => !!event)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
}
