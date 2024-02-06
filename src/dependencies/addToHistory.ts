import { DomainEvent, JSON as JSONType } from './DomainEvent'
import { postgres } from './database'

export const addToHistory = async ({ id, type, payload, occurredAt }: DomainEvent) => {
  try {
    await postgres.query('INSERT INTO history (id, type, payload, "occurredAt") VALUES ($1, $2, $3, $4)', [
      id,
      type,
      removeNullChar(payload),
      new Date(occurredAt),
    ])
  } catch (error) {
    console.error('addToHistory failed', error)
  }
}

export const createHistoryTable = async () => {
  return postgres.query(
    `CREATE TABLE IF NOT EXISTS history (id UUID PRIMARY KEY, type VARCHAR(255) NOT NULL, payload JSONB, "occurredAt" TIMESTAMPTZ NOT NULL);`
  )
}

function removeNullChar(payload: JSONType): JSONType {
  return JSON.parse(JSON.stringify(payload).replace(/\\u0000/g, ''))
}
