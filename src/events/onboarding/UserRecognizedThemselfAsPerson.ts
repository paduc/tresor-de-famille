import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'

export type UserRecognizedThemselfAsPerson = DomainEvent<
  'UserRecognizedThemselfAsPerson',
  {
    userId: AppUserId
    personId: PersonId // existing person

    familyId: FamilyId
  }
>

export const UserRecognizedThemselfAsPerson = makeDomainEvent<UserRecognizedThemselfAsPerson>('UserRecognizedThemselfAsPerson')
