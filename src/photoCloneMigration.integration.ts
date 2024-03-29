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
import { photoCloneMigration } from './photoCloneMigration.js'

describe('photoCloneMigration', () => {
  describe('when the photo has a clone', () => {
    const originalPhotoId = makePhotoId()
    const originalThread = makeThreadId()
    const cloneFamilyId = makeFamilyId()

    beforeAll(async () => {
      await resetDatabase()

      const userId = makeAppUserId()

      await addToHistory(
        UserUploadedPhoto({
          photoId: originalPhotoId,
          location: '' as unknown as PhotoLocation,
          userId,
        })
      )

      await addToHistory(
        PhotoClonedForSharing({
          userId,
          familyId: cloneFamilyId,
          photoId: makePhotoId(),
          faces: [],
          threadId: makeThreadId(),
          clonedFrom: { photoId: originalPhotoId, familyId: makeFamilyId(), threadId: originalThread },
        })
      )
    })

    it('should trigger a PhotoAutoSharedWithThread', async () => {
      await photoCloneMigration()

      const events = await postgres.query<DomainEvent>(
        "SELECT * FROM history WHERE type!='MigrationStart' AND type!='MigrationSuccess';"
      )

      expect(events.rowCount).toEqual(3)

      const newEvent = await getSingleEvent<PhotoAutoSharedWithThread>('PhotoAutoSharedWithThread')

      expect(newEvent?.payload).toMatchObject({
        photoId: originalPhotoId,
        familyId: cloneFamilyId,
        threadId: originalThread,
      })
    })
  })
})
