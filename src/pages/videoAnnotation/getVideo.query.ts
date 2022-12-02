import { postgres } from '../../dependencies/postgres'
import { BunnyCDNVideo } from '../../events'

export const getVideo = async (videoId: string): Promise<BunnyCDNVideo> => {
  const { rows } = await postgres.query(
    "SELECT * FROM events WHERE type = 'UserAddedBunnyCDNVideo' AND payload->>'videoId'=$1 LIMIT 1",
    [videoId]
  )

  if (!rows.length) {
    throw 'UserAddedBunnyCDNVideo introuvable'
  }

  return rows[0].payload
}
