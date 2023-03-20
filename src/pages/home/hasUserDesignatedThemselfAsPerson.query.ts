import { postgres } from '../../dependencies/postgres'
import { UUID } from '../../domain'

export const hasUserDesignatedThemselfAsPerson = async (userId: UUID): Promise<boolean> => {
  const { rows } = await postgres.query(
    "SELECT * FROM events WHERE type = 'UserHasDesignatedThemselfAsPerson' AND payload->>'userId'=$1 LIMIT 1",
    [userId]
  )

  if (!rows.length) {
    return false
  }

  return true
}
