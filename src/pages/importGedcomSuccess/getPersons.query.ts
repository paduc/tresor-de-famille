import { postgres } from '../../dependencies/postgres'

export type Person = {
  id: string
  name: string
  userId: string | null
  profilePictureId: string | null
}

export type SearchPersonsResult = {
  persons: Person[]
}

export type SearchPersonsArgs = {
  query: string | null
}

export const segetarchPersons = async ({ query }: SearchPersonsArgs): Promise<SearchPersonsResult> => {
  const tokens = query?.split(' ').map((token) => token.toLowerCase()) || []
  const statements = `%(${tokens.join('|')})%`

  const { rows: persons, command } = await postgres.query<Person>(
    'SELECT * FROM "Person" WHERE lower(name) SIMILAR TO $1 LIMIT 20 OFFSET 0',
    [statements]
  )

  return { persons }
}
