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
    throw error
  }
}

export const createHistoryTable = async () => {
  return postgres.query(
    `CREATE TABLE IF NOT EXISTS history (id UUID PRIMARY KEY, type VARCHAR(255) NOT NULL, payload JSONB, "occurredAt" TIMESTAMPTZ NOT NULL);`
  )
}

export const createIndexesOnHistoryTable = async () => {
  await postgres.query('CREATE INDEX IF NOT EXISTS events_by_type ON history (type)')
  await postgres.query(
    "CREATE INDEX IF NOT EXISTS events_by_userid ON history USING GIN ((payload -> 'userId') jsonb_path_ops);"
  )
  await postgres.query(
    "CREATE INDEX IF NOT EXISTS events_by_familyid ON history USING GIN ((payload -> 'familyId') jsonb_path_ops);"
  )
  await postgres.query(
    "CREATE INDEX IF NOT EXISTS events_by_photoid ON history USING GIN ((payload -> 'photoId') jsonb_path_ops);"
  )
  await postgres.query(
    "CREATE INDEX IF NOT EXISTS events_by_threadid ON history USING GIN ((payload -> 'threadId') jsonb_path_ops);"
  )
  await postgres.query(
    "CREATE INDEX IF NOT EXISTS events_by_personid ON history USING GIN ((payload -> 'personId') jsonb_path_ops);"
  )
}

function removeNullChar(payload: JSONType): JSONType {
  return JSON.parse(JSON.stringify(payload).replace(/\\u0000/g, ''))
}
