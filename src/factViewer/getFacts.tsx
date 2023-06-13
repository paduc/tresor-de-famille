import { DomainEvent } from '../dependencies/DomainEvent'
import { postgres } from '../dependencies/database'

export const getFacts = async (types?: string[] | string): Promise<DomainEvent[]> => {
  if (types && types.length) {
    const result = await postgres.query<DomainEvent>('SELECT * FROM history WHERE type = ANY ($1) ORDER BY "occurredAt" DESC', [
      Array.isArray(types) ? types : [types],
    ])

    const { rows } = result

    return rows
  }

  const { rows } = await postgres.query<DomainEvent>('SELECT * FROM history ORDER BY "occurredAt" DESC')

  return rows
}
