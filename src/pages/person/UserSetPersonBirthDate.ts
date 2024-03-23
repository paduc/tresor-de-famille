import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { PersonId } from '../../domain/PersonId'

export type UserSetPersonBirthDate = DomainEvent<
  'UserSetPersonBirthDate',
  {
    personId: PersonId
    birthDate?: string
    userId: AppUserId
  }
>

export const UserSetPersonBirthDate = makeDomainEvent<UserSetPersonBirthDate>('UserSetPersonBirthDate')
