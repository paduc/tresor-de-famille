import { DomainEvent } from '../dependencies/addToHistory'
import { postgres } from '../dependencies/database'

export const getFactTypes = async (): Promise<string[]> => {
  const { rows } = await postgres.query<{ type: string }>('SELECT DISTINCT(type) FROM history ORDER BY type ASC')

  return rows.map((row) => row.type)
}
