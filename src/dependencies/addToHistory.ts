import { postgres } from './database'
import { v4 as uuid } from 'uuid'

export const addToHistory = async ({ id, type, payload, occurredAt }: DomainEvent) => {
  await postgres.query('INSERT INTO history (id, type, payload, "occurredAt") VALUES ($1, $2, $3, $4)', [
    id,
    type,
    payload,
    new Date(occurredAt),
  ])
}

export const createHistoryTable = async () => {
  return postgres.query(
    `CREATE TABLE IF NOT EXISTS history (id UUID PRIMARY KEY, type VARCHAR(255) NOT NULL, payload JSONB, "occurredAt" TIMESTAMPTZ NOT NULL);`
  )
}

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
