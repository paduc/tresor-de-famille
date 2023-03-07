import { postgres } from '../../dependencies/postgres'
import { AWSFaceIdLinkedToPerson } from './AWSFaceIdLinkedToPerson'

export const getPersonIdForFaceId = async (faceId: string): Promise<string | null> => {
  const { rows } = await postgres.query<AWSFaceIdLinkedToPerson>(
    "SELECT * FROM events WHERE type = 'AWSFaceIdLinkedToPerson' AND payload->>'faceId'=$1 LIMIT 1",
    [faceId]
  )

  if (!rows.length) {
    return null
  }

  return rows[0].payload.personId
}