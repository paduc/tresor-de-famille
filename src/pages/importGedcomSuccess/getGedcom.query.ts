import { postgres } from '../../dependencies/database'
import { GedcomImported } from '../../events/GedcomImported'

export const getGedcom = async (): Promise<GedcomImported> => {
  const { rows } = await postgres.query("SELECT * FROM events where type = 'GedcomImported'")

  const gedcom = rows[0]

  return gedcom
}
