import { DomainEvent, makeDomainEvent } from '../../../../dependencies/DomainEvent.js'
import { AppUserId } from '../../../../domain/AppUserId.js'
import { FaceId } from '../../../../domain/FaceId.js'
import { FamilyId } from '../../../../domain/FamilyId.js'
import { PersonId } from '../../../../domain/PersonId.js'
import { PhotoId } from '../../../../domain/PhotoId.js'
import { ThreadId } from '../../../../domain/ThreadId.js'

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
