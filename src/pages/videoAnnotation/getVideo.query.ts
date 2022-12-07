import { postgres } from '../../dependencies/postgres'
import { BunnyCDNVideo, VideoSequence } from '../../events'

export const getVideo = async (videoId: string): Promise<{ video: BunnyCDNVideo; sequences: VideoSequence[] }> => {
  const videoQuery = await postgres.query(
    "SELECT * FROM events WHERE type = 'UserAddedBunnyCDNVideo' AND payload->>'videoId'=$1 LIMIT 1",
    [videoId]
  )

  if (!videoQuery.rows.length) {
    throw new Error('Video introuvable')
  }

  const sequenceQuery = await postgres.query(
    "SELECT * FROM events WHERE type = 'VideoSequenceAdded' AND payload->>'videoId'=$1 ORDER BY payload->>'addedOn' DESC",
    [videoId]
  )

  const sequences = (sequenceQuery.rows.map((row) => row.payload) as VideoSequence[]).reduce((uniqueSequences, sequence) => {
    if (!uniqueSequences.find(({ sequenceId }) => sequenceId === sequence.sequenceId)) {
      uniqueSequences.push(sequence)
    }

    return uniqueSequences
  }, [] as VideoSequence[])

  return {
    video: videoQuery.rows[0].payload,
    sequences,
  }
}
