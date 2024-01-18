import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { FaceId } from '../../domain/FaceId'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'

export type PersonAutoSharedWithPhotoFace = DomainEvent<
  'PersonAutoSharedWithPhotoFace',
  {
    familyId: FamilyId
    personId: PersonId
    photoId: PhotoId
    faceId: FaceId
  }
>

export const PersonAutoSharedWithPhotoFace = makeDomainEvent<PersonAutoSharedWithPhotoFace>('PersonAutoSharedWithPhotoFace')
