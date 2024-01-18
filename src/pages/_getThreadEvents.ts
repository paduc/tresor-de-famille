import { getEventList } from '../dependencies/getEventList'
import { ThreadId } from '../domain/ThreadId'
import { UserInsertedPhotoInRichTextThread } from './thread/UserInsertedPhotoInRichTextThread'
import { UserSetChatTitle } from './thread/UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from './thread/UserUpdatedThreadAsRichText'

export type ThreadEvent =
  | UserSetChatTitle
  // | UserSentMessageToChat
  // | UserUploadedPhotoToChat
  | UserUpdatedThreadAsRichText
  | UserInsertedPhotoInRichTextThread

export async function getThreadEvents(threadId: ThreadId): Promise<ThreadEvent[]> {
  const updateEvents = await getEventList<
    | UserSetChatTitle
    // | UserSentMessageToChat
    // | UserUploadedPhotoToChat
    | UserUpdatedThreadAsRichText
    | UserInsertedPhotoInRichTextThread
  >(['UserSetChatTitle', 'UserUpdatedThreadAsRichText', 'UserInsertedPhotoInRichTextThread'], {
    threadId,
  })

  return updateEvents
    .filter((event): event is ThreadEvent => !!event)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
}
