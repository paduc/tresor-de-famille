import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { FaceId } from '../../domain/FaceId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'
import { PhotoId } from '../../domain/PhotoId.js'

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
