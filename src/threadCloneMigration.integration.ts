import { DomainEvent } from './dependencies/DomainEvent.js'
import { resetDatabase } from './dependencies/__test__/resetDatabase.js'
import { addToHistory } from './dependencies/addToHistory.js'
import { postgres } from './dependencies/database.js'
import { getSingleEvent } from './dependencies/getSingleEvent.js'
import { makeFamilyId } from './libs/makeFamilyId.js'
import { makePhotoId } from './libs/makePhotoId.js'
import { makeThreadId } from './libs/makeThreadId.js'
import { makeAppUserId } from './libs/makeUserId.js'
import { PhotoLocation, UserUploadedPhoto } from './pages/photoApi/UserUploadedPhoto.js'
import { PhotoAutoSharedWithThread } from './pages/thread/PhotoAutoSharedWithThread.js'
import { PhotoClonedForSharing } from './pages/thread/ThreadPage/events/PhotoClonedForSharing.js'
import { ThreadClonedForSharing } from './pages/thread/ThreadPage/events/ThreadClonedForSharing.js'
import { ThreadSharedWithFamilies } from './pages/thread/ThreadPage/events/ThreadSharedWithFamilies.js'
import { TipTapContentAsJSON } from './pages/thread/TipTapTypes.js'
import { UserUpdatedThreadAsRichText } from './pages/thread/UserUpdatedThreadAsRichText.js'
import { threadCloneMigration } from './threadCloneMigration.js'

describe('threadCloneMigration', () => {
  describe('when the thread ends with a UserUpdatedThreadAsRichText', () => {
    const threadId = makeThreadId()

    beforeAll(async () => {
      await resetDatabase()

      const DEFAULT_CONTENT: TipTapContentAsJSON = { type: 'doc', content: [] } as const

      const userId = makeAppUserId()
      const familyId = makeFamilyId()
      await addToHistory(UserUpdatedThreadAsRichText({ contentAsJSON: DEFAULT_CONTENT, userId, familyId, threadId }))
    })

    it('should do nothing', async () => {
      await threadCloneMigration()

      const events = await postgres.query<DomainEvent>(
        "SELECT * FROM history WHERE type!='MigrationStart' AND type!='MigrationSuccess';"
      )

      expect(events.rowCount).toEqual(1)
    })
  })

  describe('when the thread is a clone', () => {
    const threadId = makeThreadId()

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
          threadId,
          clonedFrom: { threadId: makeThreadId(), familyId: makeFamilyId() },
        })
      )
      await addToHistory(UserUpdatedThreadAsRichText({ contentAsJSON: DEFAULT_CONTENT, userId, familyId, threadId }))
    })

    it('should do nothing', async () => {
      await threadCloneMigration()

      const events = await postgres.query<DomainEvent>(
        "SELECT * FROM history WHERE type!='MigrationStart' AND type!='MigrationSuccess';"
      )

      expect(events.rowCount).toEqual(2)
    })
  })

  describe('when the thread has newer content in a clone', () => {
    const threadId = makeThreadId()
    const originalFamilyId = makeFamilyId()

    const latestCloneFamilyId = makeFamilyId()

    beforeAll(async () => {
      await resetDatabase()

      const userId = makeAppUserId()
      await addToHistory(
        UserUpdatedThreadAsRichText({
          contentAsJSON: { a: 1 } as unknown as TipTapContentAsJSON,
          userId,
          familyId: originalFamilyId,
          threadId,
        })
      )

      // add a first clone of the original
      const cloneThreadId = makeThreadId()
      const cloneFamilyId = makeFamilyId()
      await addToHistory(
        ThreadClonedForSharing({
          contentAsJSON: { a: 2 } as unknown as TipTapContentAsJSON,
          userId,
          familyId: cloneFamilyId,
          threadId: cloneThreadId,
          clonedFrom: { threadId, familyId: originalFamilyId },
        })
      )

      // add a clone of the first clone
      const latestCloneThreadId = makeThreadId()
      await addToHistory(
        ThreadClonedForSharing({
          contentAsJSON: { a: 3 } as unknown as TipTapContentAsJSON,
          userId,
          familyId: latestCloneFamilyId,
          threadId: latestCloneThreadId,
          clonedFrom: { threadId: cloneThreadId, familyId: cloneFamilyId },
        })
      )

      // add an update to the latest clone
      await addToHistory(
        UserUpdatedThreadAsRichText({
          contentAsJSON: { type: 'doc', content: [{ type: 'paragraph' }] },
          userId,
          familyId: latestCloneFamilyId,
          threadId: latestCloneThreadId,
        })
      )

      await threadCloneMigration()

      const events = await postgres.query<DomainEvent>(
        "SELECT * FROM history WHERE type!='MigrationStart' AND type!='MigrationSuccess';"
      )

      expect(events.rowCount).toEqual(6)
    })

    it('should add a new UserUpdatedThreadAsRichText with the latest content of the latest clone', async () => {
      const newUpdateEvent = await getSingleEvent<UserUpdatedThreadAsRichText>('UserUpdatedThreadAsRichText', { threadId })

      expect(newUpdateEvent?.payload.contentAsJSON).toMatchObject({ type: 'doc', content: [{ type: 'paragraph' }] })
    })

    it('should add a new ThreadSharedWithFamilies event with the family of the latest cloned event', async () => {
      const newSharedEvent = await getSingleEvent<ThreadSharedWithFamilies>('ThreadSharedWithFamilies', { threadId })

      expect(newSharedEvent?.payload.familyIds).toMatchObject([originalFamilyId, latestCloneFamilyId])
    })
  })

  describe('when there are photos in the cloned thread', () => {
    const threadId = makeThreadId()
    const originalFamilyId = makeFamilyId()

    const originalPhotoId = makePhotoId()
    const latestCloneFamilyId = makeFamilyId()

    beforeAll(async () => {
      await resetDatabase()

      const userId = makeAppUserId()
      await addToHistory(
        UserUpdatedThreadAsRichText({
          contentAsJSON: { a: 1 } as unknown as TipTapContentAsJSON,
          userId,
          familyId: originalFamilyId,
          threadId,
        })
      )

      await addToHistory(
        UserUploadedPhoto({
          photoId: originalPhotoId,
          userId,
          location: {} as unknown as PhotoLocation,
        })
      )

      const clonePhotoId = makePhotoId()
      await addToHistory(
        PhotoClonedForSharing({
          photoId: clonePhotoId,
          familyId: latestCloneFamilyId,
          userId,
          faces: [],
          threadId,
          clonedFrom: {
            photoId: originalPhotoId,
            familyId: originalFamilyId,
            threadId,
          },
        })
      )

      // add a clone with photos
      const latestCloneThreadId = makeThreadId()
      await addToHistory(
        ThreadClonedForSharing({
          contentAsJSON: {
            type: 'doc',
            content: [
              {
                type: 'photoNode',
                attrs: {
                  photoId: clonePhotoId,
                },
              },
            ],
          },
          userId,
          familyId: latestCloneFamilyId,
          threadId: latestCloneThreadId,
          clonedFrom: { threadId, familyId: originalFamilyId },
        })
      )

      await threadCloneMigration()
    })

    it('should put original photos back in the content (with original photoId & threadId)', async () => {
      const newUpdateEvent = await getSingleEvent<UserUpdatedThreadAsRichText>('UserUpdatedThreadAsRichText', { threadId })

      expect(newUpdateEvent?.payload.contentAsJSON).toMatchObject({
        type: 'doc',
        content: [
          {
            type: 'photoNode',
            attrs: {
              photoId: originalPhotoId,
              threadId,
            },
          },
        ],
      })
    })

    it('should share the original photos with the clone family', async () => {
      const newSharedEvent = await getSingleEvent<PhotoAutoSharedWithThread>('PhotoAutoSharedWithThread', {
        photoId: originalPhotoId,
      })

      expect(newSharedEvent).toBeDefined()

      expect(newSharedEvent!.payload).toMatchObject({
        photoId: originalPhotoId,
        threadId,
        familyId: latestCloneFamilyId,
      })
    })
  })
})
