import { DomainEvent, makeDomainEvent } from '../dependencies/DomainEvent.js'
import { AppUserId } from '../domain/AppUserId.js'

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
