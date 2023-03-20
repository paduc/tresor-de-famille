import { UUID } from '../domain'
import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'

export type UserRegisteredWithEmailAndPassword = BaseDomainEvent & {
  type: 'UserRegisteredWithEmailAndPassword'
  payload: {
    userId: UUID
    email: string
    passwordHash: string
    code?: string
  }
}

export const UserRegisteredWithEmailAndPassword = (
  payload: UserRegisteredWithEmailAndPassword['payload']
): UserRegisteredWithEmailAndPassword =>
  makeDomainEvent({
    type: 'UserRegisteredWithEmailAndPassword',
    payload,
  })
