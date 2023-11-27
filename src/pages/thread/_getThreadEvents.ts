import { getEventList } from '../../dependencies/getEventList'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { ThreadId } from '../../domain/ThreadId'
import { ThreadClonedForSharing } from './ThreadPage/ThreadClonedForSharing'
import { UserInsertedPhotoInRichTextThread } from './UserInsertedPhotoInRichTextThread'
import { UserSetChatTitle } from './UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from './UserUpdatedThreadAsRichText'

export type ThreadEvent =
  | UserSetChatTitle
  // | UserSentMessageToChat
  // | UserUploadedPhotoToChat
  | UserUpdatedThreadAsRichText
  | UserInsertedPhotoInRichTextThread
  | ThreadClonedForSharing

export async function getThreadEvents(threadId: ThreadId): Promise<ThreadEvent[]> {
  const threadClonedEvent = await getSingleEvent<ThreadClonedForSharing>('ThreadClonedForSharing', { threadId })

  const updateEvents = await getEventList<
    | UserSetChatTitle
    // | UserSentMessageToChat
    // | UserUploadedPhotoToChat
    | UserUpdatedThreadAsRichText
    | UserInsertedPhotoInRichTextThread
  >(['UserSetChatTitle', 'UserUpdatedThreadAsRichText', 'UserInsertedPhotoInRichTextThread'], {
    chatId: threadId,
  })

  return [threadClonedEvent, ...updateEvents]
    .filter((event): event is ThreadEvent => !!event)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
}
