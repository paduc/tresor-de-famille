import { postgres } from '../database'

export const resetDatabase = async () => {
  const client = await postgres.connect()

  try {
    await client.query('BEGIN')

    await client.query(`TRUNCATE events`)

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
