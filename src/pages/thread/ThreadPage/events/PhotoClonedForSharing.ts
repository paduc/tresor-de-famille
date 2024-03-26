import { DomainEvent, makeDomainEvent } from '../../../../dependencies/DomainEvent'
import { AppUserId } from '../../../../domain/AppUserId'
import { FaceId } from '../../../../domain/FaceId'
import { FamilyId } from '../../../../domain/FamilyId'
import { PersonId } from '../../../../domain/PersonId'
import { PhotoId } from '../../../../domain/PhotoId'
import { ThreadId } from '../../../../domain/ThreadId'

export type PhotoClonedForSharing = DomainEvent<
  'PhotoClonedForSharing',
  {
    userId: AppUserId
    familyId: FamilyId

    // The new photoId
    photoId: PhotoId

    // TODO: set photo info
    faces: { faceId: FaceId; personId?: PersonId; isIgnored?: boolean }[]
    caption?: string

    // The cloned thread the photo is inside of
    threadId: ThreadId

    clonedFrom: {
      familyId: FamilyId
      // the original photoId
      photoId: PhotoId
      threadId: ThreadId
    }
  }
>

/**
 * @deprecated
 */
export const PhotoClonedForSharing = makeDomainEvent<PhotoClonedForSharing>('PhotoClonedForSharing')
