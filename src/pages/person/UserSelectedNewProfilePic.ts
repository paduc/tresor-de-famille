import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { FaceId } from '../../domain/FaceId'

export type UserSelectedNewProfilePic = DomainEvent<
  'UserSelectedNewProfilePic',
  {
    personId: UUID
    photoId: UUID
    faceId: FaceId
    userId: UUID
  }
>

export const UserSelectedNewProfilePic = makeDomainEvent<UserSelectedNewProfilePic>('UserSelectedNewProfilePic')
