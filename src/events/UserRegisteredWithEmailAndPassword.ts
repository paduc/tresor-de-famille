import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'

export type UserRegisteredWithEmailAndPassword = BaseDomainEvent & {
  type: 'UserRegisteredWithEmailAndPassword'
  payload: {
    userId: string
    email: string
    passwordHash: string
  }
}

export const UserRegisteredWithEmailAndPassword = (
  payload: UserRegisteredWithEmailAndPassword['payload']
): UserRegisteredWithEmailAndPassword =>
  makeDomainEvent({
    type: 'UserRegisteredWithEmailAndPassword',
    payload,
  })
