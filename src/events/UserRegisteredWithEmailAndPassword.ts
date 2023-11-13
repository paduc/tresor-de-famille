import { DomainEvent, makeDomainEvent } from '../dependencies/DomainEvent'
import { AppUserId } from '../domain/AppUserId'

export type UserRegisteredWithEmailAndPassword = DomainEvent<
  'UserRegisteredWithEmailAndPassword',
  {
    userId: AppUserId
    email: string
    passwordHash: string
    code?: string
  }
>

export const UserRegisteredWithEmailAndPassword = makeDomainEvent<UserRegisteredWithEmailAndPassword>(
  'UserRegisteredWithEmailAndPassword'
)
