import { UUID } from '../domain'
import { DomainEvent, makeDomainEvent } from '../dependencies/DomainEvent'

export type UserRegisteredWithEmailAndPassword = DomainEvent<
  'UserRegisteredWithEmailAndPassword',
  {
    userId: UUID
    email: string
    passwordHash: string
    code?: string
  }
>

export const UserRegisteredWithEmailAndPassword = makeDomainEvent<UserRegisteredWithEmailAndPassword>(
  'UserRegisteredWithEmailAndPassword'
)
