import { DomainEvent } from '../dependencies/addToHistory'
import { postgres } from '../dependencies/database'

export const getFacts = async (): Promise<DomainEvent[]> => {
  const { rows } = await postgres.query<DomainEvent>('SELECT * FROM history ORDER BY "occurredAt" DESC')

  return rows
}
