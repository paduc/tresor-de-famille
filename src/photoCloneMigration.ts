import { addToHistory } from './dependencies/addToHistory'
import { postgres } from './dependencies/database'
import { getEventList } from './dependencies/getEventList'
import { getSingleEvent } from './dependencies/getSingleEvent'
import { PhotoId } from './domain/PhotoId'
import { MigrationFailure } from './events/migrations/MigrationFailure'
import { MigrationStart } from './events/migrations/MigrationStart'
import { MigrationSuccess } from './events/migrations/MigrationSuccess'
import { OnboardingUserUploadedPhotoOfFamily } from './events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from './events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { UserAddedCaptionToPhoto } from './pages/photo/UserAddedCaptionToPhoto'
import { UserDeletedPhoto } from './pages/photoApi/UserDeletedPhoto'
import { UserUploadedPhoto } from './pages/photoApi/UserUploadedPhoto'
import { UserUploadedPhotoToFamily } from './pages/photoApi/UserUploadedPhotoToFamily'
import { PhotoAutoSharedWithThread } from './pages/thread/PhotoAutoSharedWithThread'
import { PhotoClonedForSharing } from './pages/thread/ThreadPage/events/PhotoClonedForSharing'
import { UserInsertedPhotoInRichTextThread } from './pages/thread/UserInsertedPhotoInRichTextThread'
import { UserUploadedPhotoToChat } from './pages/thread/uploadPhotoToChat/UserUploadedPhotoToChat'

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
