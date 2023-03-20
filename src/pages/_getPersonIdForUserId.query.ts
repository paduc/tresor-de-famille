import { postgres } from '../dependencies/postgres'
import { UUID } from '../domain'

export const getPersonIdForUserId = async (userId: UUID): Promise<UUID> => {
  const { rows: userHasDesignatedThemselfAsPersonRows } = await postgres.query(
    "SELECT * FROM events WHERE type = 'UserHasDesignatedThemselfAsPerson' AND payload->>'userId'=$1 LIMIT 1",
    [userId]
  )

  if (!userHasDesignatedThemselfAsPersonRows.length) {
    throw 'UserHasDesignatedThemselfAsPerson introuvable pour cet utilisateur'
  }

  const { personId } = userHasDesignatedThemselfAsPersonRows[0].payload

  return personId
}
