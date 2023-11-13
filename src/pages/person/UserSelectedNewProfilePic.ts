import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { FaceId } from '../../domain/FaceId'
import { PersonId } from '../../domain/PersonId'

export type UserSelectedNewProfilePic = DomainEvent<
  'UserSelectedNewProfilePic',
  {
    personId: PersonId
    photoId: UUID
    faceId: FaceId
    userId: UUID
  }
>

export const UserSelectedNewProfilePic = makeDomainEvent<UserSelectedNewProfilePic>('UserSelectedNewProfilePic')
