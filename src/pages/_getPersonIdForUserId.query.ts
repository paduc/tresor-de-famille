import { postgres } from '../dependencies/database'
import { UUID } from '../domain'
import { UserHasDesignatedThemselfAsPerson } from '../events/UserHasDesignatedThemselfAsPerson'
import { UserNamedThemself } from './bienvenue/step1-userTellsAboutThemselves/UserNamedThemself'

export const getPersonIdForUserId = async (userId: UUID): Promise<UUID> => {
  const { rows } = await postgres.query<UserHasDesignatedThemselfAsPerson | UserNamedThemself>(
    "SELECT * FROM history WHERE type IN ('UserHasDesignatedThemselfAsPerson','UserNamedThemself') AND payload->>'userId'=$1 LIMIT 1",
    [userId]
  )

  if (!rows.length) {
    throw new Error(`Cet utilisateur ne s'est pas encore présenté`)
  }

  const { personId } = rows[0].payload

  return personId
}
