import { DomainEvent } from './DomainEvent.js'
import { postgres } from './database.js'

type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

type Map<T extends DomainEvent> = {
  [P in keyof T['payload']]: string
}

export type PayloadPropertyMap<T extends DomainEvent> = Equals<Map<T>, {}> extends false
  ? Partial<{
      [P in keyof T['payload']]: string
    }>
  : never

/**
 * Get the latest event of the given types
 * @param type a string or array of strings representing the event types
 * @param payloadParams an optional key/value pairs of payload parameters
 */
export async function getSingleEvent<T extends DomainEvent>(
  type: T['type'],
  payloadParams?: PayloadPropertyMap<T>
): Promise<T | undefined>
export async function getSingleEvent<T extends DomainEvent>(
  types: T['type'][],
  payloadParams?: PayloadPropertyMap<T>
): Promise<T | undefined>
export async function getSingleEvent<T extends DomainEvent>(
  typeOrTypes: T['type'] | T['type'][],
  payloadParams?: PayloadPropertyMap<T>
): Promise<T | undefined> {
  const types = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes]

  const otherWhereClauses = payloadParams
    ? Object.entries(payloadParams)
        .map(([key, value]) => `payload->>${escapeLiteral(key)}=${escapeLiteral(value!)}`)
        .join('AND ')
    : null

  const query = `SELECT * FROM history WHERE type = ANY ($1)${
    otherWhereClauses ? ` AND ${otherWhereClauses}` : ''
  } ORDER BY "occurredAt" DESC LIMIT 1`

  const { rows } = await postgres.query<T>(query, [types])

  return rows[0] || undefined
}

// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
function escapeIdentifier(str: string) {
  return '"' + str.replace(/"/g, '""') + '"'
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
