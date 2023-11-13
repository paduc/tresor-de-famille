import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { FaceId } from '../../domain/FaceId'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'

export type UserSelectedNewProfilePic = DomainEvent<
  'UserSelectedNewProfilePic',
  {
    personId: PersonId
    photoId: PhotoId
    faceId: FaceId
    userId: UUID
  }
>

export const UserSelectedNewProfilePic = makeDomainEvent<UserSelectedNewProfilePic>('UserSelectedNewProfilePic')
