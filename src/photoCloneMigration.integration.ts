import { DomainEvent } from './dependencies/DomainEvent'
import { resetDatabase } from './dependencies/__test__/resetDatabase'
import { addToHistory } from './dependencies/addToHistory'
import { postgres } from './dependencies/database'
import { getSingleEvent } from './dependencies/getSingleEvent'
import { makeFamilyId } from './libs/makeFamilyId'
import { makePhotoId } from './libs/makePhotoId'
import { makeThreadId } from './libs/makeThreadId'
import { makeAppUserId } from './libs/makeUserId'
import { PhotoLocation, UserUploadedPhoto } from './pages/photoApi/UserUploadedPhoto'
import { PhotoAutoSharedWithThread } from './pages/thread/PhotoAutoSharedWithThread'
import { PhotoClonedForSharing } from './pages/thread/ThreadPage/PhotoClonedForSharing'
import { photoCloneMigration } from './photoCloneMigration'

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
