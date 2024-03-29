import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FaceId } from '../../domain/FaceId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'
import { PhotoId } from '../../domain/PhotoId.js'

export type PersonClonedForSharing = DomainEvent<
  'PersonClonedForSharing',
  {
    userId: AppUserId
    familyId: FamilyId
    personId: PersonId

    name: string
    faceId?: FaceId | undefined
    profilePicPhotoId?: PhotoId | undefined

    clonedFrom: {
      familyId: FamilyId
      personId: PersonId
    }
  }
>

export const PersonClonedForSharing = makeDomainEvent<PersonClonedForSharing>('PersonClonedForSharing')
