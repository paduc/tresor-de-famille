import { postgres } from '../../dependencies/postgres'

import { UserHasDesignatedHimselfAsPerson } from '../../events/UserHasDesignatedHimselfAsPerson'

export const getPerson = async (): Promise<UserHasDesignatedHimselfAsPerson> => {
  const { rows } = await postgres.query("SELECT * FROM events where type = 'UserHasDesignatedHimselfAsPerson'")

  const person = rows[0]

  return person
}
