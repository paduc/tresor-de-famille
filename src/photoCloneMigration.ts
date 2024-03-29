import { addToHistory } from './dependencies/addToHistory.js'
import { postgres } from './dependencies/database.js'
import { getEventList } from './dependencies/getEventList.js'
import { getSingleEvent } from './dependencies/getSingleEvent.js'
import { PhotoId } from './domain/PhotoId.js'
import { MigrationFailure } from './events/migrations/MigrationFailure.js'
import { MigrationStart } from './events/migrations/MigrationStart.js'
import { MigrationSuccess } from './events/migrations/MigrationSuccess.js'
import { OnboardingUserUploadedPhotoOfFamily } from './events/onboarding/OnboardingUserUploadedPhotoOfFamily.js'
import { OnboardingUserUploadedPhotoOfThemself } from './events/onboarding/OnboardingUserUploadedPhotoOfThemself.js'
import { UserAddedCaptionToPhoto } from './pages/photo/UserAddedCaptionToPhoto.js'
import { UserDeletedPhoto } from './pages/photoApi/UserDeletedPhoto.js'
import { UserUploadedPhoto } from './pages/photoApi/UserUploadedPhoto.js'
import { UserUploadedPhotoToFamily } from './pages/photoApi/UserUploadedPhotoToFamily.js'
import { PhotoAutoSharedWithThread } from './pages/thread/PhotoAutoSharedWithThread.js'
import { PhotoClonedForSharing } from './pages/thread/ThreadPage/events/PhotoClonedForSharing.js'
import { UserInsertedPhotoInRichTextThread } from './pages/thread/UserInsertedPhotoInRichTextThread.js'
import { UserUploadedPhotoToChat } from './pages/thread/uploadPhotoToChat/UserUploadedPhotoToChat.js'

type PhotoEvent =
  | UserUploadedPhotoToChat
  | UserUploadedPhotoToFamily
  | UserUploadedPhoto
  | UserInsertedPhotoInRichTextThread
  | UserDeletedPhoto
  | UserAddedCaptionToPhoto
  | OnboardingUserUploadedPhotoOfThemself
  | OnboardingUserUploadedPhotoOfFamily
  | PhotoAutoSharedWithThread

export const photoCloneMigration = async () => {
  const migrationName = 'photoClone'
  const migration = await getSingleEvent<MigrationStart>('MigrationStart', { name: migrationName })

  if (migration) return

  await addToHistory(MigrationStart({ name: migrationName }))

  try {
    const photoEvents = await getEventList<PhotoEvent>([
      'UserUploadedPhotoToChat',
      'UserUploadedPhotoToFamily',
      'UserUploadedPhoto',
      'UserInsertedPhotoInRichTextThread',
      'UserDeletedPhoto',
      'UserAddedCaptionToPhoto',
      'OnboardingUserUploadedPhotoOfFamily',
      'OnboardingUserUploadedPhotoOfThemself',
      'PhotoAutoSharedWithThread',
    ])

    const uniquePhotoIds = new Set(photoEvents.map((e) => e.payload.photoId))

    for (const photoId of uniquePhotoIds) {
      const cloneEvents = await getClones(photoId)
      if (cloneEvents.length) {
        for (const cloneEvent of cloneEvents) {
          const {
            payload: { clonedFrom, familyId },
          } = cloneEvent
          await addToHistory(
            PhotoAutoSharedWithThread({
              photoId: clonedFrom.photoId,
              threadId: clonedFrom.threadId,
              familyId,
            })
          )
        }
      }
    }

    await addToHistory(MigrationSuccess({ name: migrationName }))
  } catch (error) {
    console.error(`Migration ${migrationName} failed`, error)
    await addToHistory(MigrationFailure({ name: migrationName }))
  }
}

async function getClones(photoId: PhotoId): Promise<PhotoClonedForSharing[]> {
  const { rows: clonedEvents } = await postgres.query<PhotoClonedForSharing>(
    `SELECT * FROM history WHERE type='PhotoClonedForSharing' AND payload->'clonedFrom'->>'photoId'=$1`,
    [photoId]
  )

  const clones: PhotoClonedForSharing[] = []

  for (const clonedEvent of clonedEvents) {
    const clonePhotoId = clonedEvent.payload.photoId

    clones.push(clonedEvent)
    clones.push(...(await getClones(clonePhotoId)))
  }

  return clones
}
