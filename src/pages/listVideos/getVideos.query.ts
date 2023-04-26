import { postgres } from '../../dependencies/database'
import { BunnyCDNVideo, UserAddedBunnyCDNVideo } from '../../events'

export const getVideos = async (): Promise<BunnyCDNVideo[]> => {
  const { rows } = await postgres.query("SELECT * FROM history WHERE type = 'UserAddedBunnyCDNVideo'")

  return rows.map((event: UserAddedBunnyCDNVideo) => event.payload)
}
