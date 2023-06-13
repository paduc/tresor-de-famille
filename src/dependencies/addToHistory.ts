import { DomainEvent } from './DomainEvent'
import { postgres } from './database'

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
