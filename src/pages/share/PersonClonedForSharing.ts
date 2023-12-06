import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FaceId } from '../../domain/FaceId'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'

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
