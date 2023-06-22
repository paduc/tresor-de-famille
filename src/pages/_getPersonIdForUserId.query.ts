import { postgres } from '../dependencies/database'
import { UUID } from '../domain'
import { UserHasDesignatedThemselfAsPerson } from '../events/UserHasDesignatedThemselfAsPerson'
import { UserPresentedThemselfUsingOpenAI } from './bienvenue/step1-userTellsAboutThemselves/UserPresentedThemselfUsingOpenAI'

export const getPersonIdForUserId = async (userId: UUID): Promise<UUID> => {
  const { rows } = await postgres.query<UserHasDesignatedThemselfAsPerson | UserPresentedThemselfUsingOpenAI>(
    "SELECT * FROM history WHERE type IN ('UserHasDesignatedThemselfAsPerson','UserPresentedThemselfUsingOpenAI') AND payload->>'userId'=$1 LIMIT 1",
    [userId]
  )

  if (!rows.length) {
    throw new Error(`Cet utilisateur ne s'est pas encore présenté`)
  }

  const { personId } = rows[0].payload

  return personId
}
