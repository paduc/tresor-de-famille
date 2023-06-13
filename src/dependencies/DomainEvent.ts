import { v4 as uuid } from 'uuid'

type Literal = boolean | null | number | string
type JSON = Literal | { [key: string]: JSON } | JSON[]

export type DomainEvent<Type extends string = string, Payload extends JSON = any> = {
  id: string
  type: Type
  occurredAt: Date
  payload: Payload
}

export const makeDomainEvent =
  <DomainEventType extends DomainEvent>(type: ExtractType<DomainEventType>) =>
  (payload: ExtractPayload<DomainEventType>) => ({
    id: uuid(),
    occurredAt: new Date(),
    type,
    payload,
  })
// Some type utils
type ExtractType<DomainEventType extends DomainEvent> = DomainEventType extends DomainEvent<infer Type, any> ? Type : never
type ExtractPayload<DomainEventType extends DomainEvent> = DomainEventType extends DomainEvent<string, infer Details>
  ? Details
  : never
