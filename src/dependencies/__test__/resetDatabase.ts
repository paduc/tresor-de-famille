import { createHistoryTable } from '../addToHistory'
import { postgres } from '../database'

export const resetDatabase = async () => {
  const client = await postgres.connect()

  await createHistoryTable()

  try {
    await client.query('BEGIN')

    await client.query(`TRUNCATE history`)

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
