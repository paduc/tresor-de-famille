import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { PersonId } from '../../domain/PersonId.js'

export type UserSetPersonBirthDate = DomainEvent<
  'UserSetPersonBirthDate',
  {
    personId: PersonId
    birthDate?: string
    userId: AppUserId
  }
>

export const UserSetPersonBirthDate = makeDomainEvent<UserSetPersonBirthDate>('UserSetPersonBirthDate')
