import { postgres } from '../../dependencies/postgres'

export const hasUserDesignatedThemselfAsPerson = async (userId: string): Promise<boolean> => {
  const { rows } = await postgres.query(
    "SELECT * FROM events WHERE type = 'UserHasDesignatedThemselfAsPerson' AND payload->>'userId'=$1 LIMIT 1",
    [userId]
  )

  if (!rows.length) {
    return false
  }

  return true
}
