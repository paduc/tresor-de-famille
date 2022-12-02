import { postgres } from '../../dependencies/postgres'
import { BunnyCDNVideo, UserAddedBunnyCDNVideo } from '../../events'

export const getVideos = async (): Promise<BunnyCDNVideo[]> => {
  const { rows } = await postgres.query("SELECT * FROM events WHERE type = 'UserAddedBunnyCDNVideo'")

  return rows.map((event: UserAddedBunnyCDNVideo) => event.payload)
}
