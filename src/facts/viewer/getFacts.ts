import { DomainEvent } from '../../dependencies/DomainEvent'
import { postgres } from '../../dependencies/database'

export const getFacts = async ({
  types,
  query,
}: {
  types: string[] | string | undefined
  query: string | undefined
}): Promise<DomainEvent[]> => {
  if (types && types.length) {
    const result = await postgres.query<DomainEvent>('SELECT * FROM history WHERE type = ANY ($1) ORDER BY "occurredAt" DESC', [
      Array.isArray(types) ? types : [types],
    ])

    const { rows } = result

    return filterRows(rows, query)
  }

  const { rows } = await postgres.query<DomainEvent>('SELECT * FROM history ORDER BY "occurredAt" DESC')

  return filterRows(rows, query)
}

function filterRows(rows: DomainEvent[], query?: string) {
  if (!query) {
    return rows
  }

  return rows.filter((row) => JSON.stringify(row.payload).includes(query))
}
