import { v4 } from 'uuid'
import { DomainEvent } from './dependencies/DomainEvent.js'
import { resetDatabase } from './dependencies/__test__/resetDatabase.js'
import { addToHistory } from './dependencies/addToHistory.js'
import { postgres } from './dependencies/database.js'
import { makeFamilyId } from './libs/makeFamilyId.js'
import { makeThreadId } from './libs/makeThreadId.js'
import { makeAppUserId } from './libs/makeUserId.js'
import { ThreadClonedForSharing } from './pages/thread/ThreadPage/events/ThreadClonedForSharing.js'
import { TipTapContentAsJSON } from './pages/thread/TipTapTypes.js'
import { UserSetChatTitle } from './pages/thread/UserSetChatTitle.js'
import { UserUpdatedThreadAsRichText } from './pages/thread/UserUpdatedThreadAsRichText.js'
import { threadCloneMigration } from './threadCloneMigration.js'
import { deleteThreadclonesMigration } from './deleteThreadClonesMigration.js'
import { UserUploadedPhotoToChat } from './pages/thread/uploadPhotoToChat/UserUploadedPhotoToChat.js'
import { PhotoLocation } from './pages/photoApi/UserUploadedPhoto.js'
import { makePhotoId } from './libs/makePhotoId.js'

describe('deleteThreadCloneMigration', () => {
  describe('when the thread is a clone', () => {
    const cloneThreadId = makeThreadId()
    const nonCloneThreadId = makeThreadId()

    beforeAll(async () => {
      await resetDatabase()

      const DEFAULT_CONTENT: TipTapContentAsJSON = { type: 'doc', content: [] } as const

      const userId = makeAppUserId()
      const familyId = makeFamilyId()
      await addToHistory(
        ThreadClonedForSharing({
          contentAsJSON: DEFAULT_CONTENT,
          userId,
          familyId,
          threadId: cloneThreadId,
          clonedFrom: { threadId: makeThreadId(), familyId: makeFamilyId() },
        })
      )
      await addToHistory(
        UserUpdatedThreadAsRichText({ contentAsJSON: DEFAULT_CONTENT, userId, familyId, threadId: cloneThreadId })
      )

      await addToHistory({
        id: v4(),
        type: 'UserInsertedPhotoInRichTextThread',
        payload: { contentAsJSON: DEFAULT_CONTENT, userId, familyId, threadId: cloneThreadId },
        occurredAt: new Date(),
      })

      await addToHistory(
        UserSetChatTitle({
          threadId: cloneThreadId,
          userId,
          familyId,
          title: '',
        })
      )

      // Event non thread events
      await addToHistory(
        UserUploadedPhotoToChat({
          threadId: cloneThreadId,
          userId,
          familyId,
          location: {} as PhotoLocation,
          photoId: makePhotoId(),
        })
      )

      // Add a non clone event
      await addToHistory(
        UserUpdatedThreadAsRichText({ contentAsJSON: DEFAULT_CONTENT, userId, familyId, threadId: nonCloneThreadId })
      )
    })

    it('should delete the events from this clone', async () => {
      await deleteThreadclonesMigration()

      const events = await postgres.query<DomainEvent>(
        "SELECT * FROM history WHERE type!='MigrationStart' AND type!='MigrationSuccess';"
      )

      expect(events.rowCount).toEqual(1)
      expect(events.rows[0].payload.threadId).toEqual(nonCloneThreadId)
    })
  })
})
