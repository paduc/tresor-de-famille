import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'

export type UserRecognizedThemselfAsPerson = DomainEvent<
  'UserRecognizedThemselfAsPerson',
  {
    userId: AppUserId
    personId: PersonId // existing person

    familyId: FamilyId
  }
>

export const UserRecognizedThemselfAsPerson = makeDomainEvent<UserRecognizedThemselfAsPerson>('UserRecognizedThemselfAsPerson')
