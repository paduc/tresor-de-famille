import { DomainEvent } from './DomainEvent'
import { postgres } from './database'

export type PayloadPropertyMap<T extends DomainEvent> = Partial<{
  [P in keyof T['payload']]: string
}>

export async function getEventList<T extends DomainEvent>(type: T['type'], payloadParams?: PayloadPropertyMap<T>): Promise<T[]>
export async function getEventList<T extends DomainEvent>(
  types: T['type'][],
  payloadParams?: PayloadPropertyMap<T>
): Promise<T[]>
export async function getEventList<T extends DomainEvent>(
  typeOrTypes: T['type'] | T['type'][],
  payloadParams?: PayloadPropertyMap<T>
): Promise<T[]> {
  const types = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes]

  const otherWhereClauses = payloadParams
    ? Object.entries(payloadParams)
        .map(([key, value]) => `payload->>${escapeLiteral(key)}=${escapeLiteral(value!)}`)
        .join('AND ')
    : null

  const query = `SELECT * FROM history WHERE type = ANY ($1)${
    otherWhereClauses ? ` AND ${otherWhereClauses}` : ''
  } ORDER BY "occurredAt" ASC`

  const { rows } = await postgres.query<T>(query, [types])

  return rows
}

// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
function escapeLiteral(str: string) {
  var hasBackslash = false
  var escaped = "'"

  for (var i = 0; i < str.length; i++) {
    var c = str[i]
    if (c === "'") {
      escaped += c + c
    } else if (c === '\\') {
      escaped += c + c
      hasBackslash = true
    } else {
      escaped += c
    }
  }

  escaped += "'"

  if (hasBackslash === true) {
    escaped = ' E' + escaped
  }

  return escaped
}
