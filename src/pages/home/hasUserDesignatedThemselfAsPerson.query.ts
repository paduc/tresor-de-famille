import { postgres } from '../../dependencies/database'
import { UUID } from '../../domain'

export const hasUserDesignatedThemselfAsPerson = async (userId: UUID): Promise<boolean> => {
  const { rows } = await postgres.query(
    "SELECT * FROM history WHERE type = 'UserHasDesignatedThemselfAsPerson' AND payload->>'userId'=$1 LIMIT 1",
    [userId]
  )

  if (!rows.length) {
    return false
  }

  return true
}
