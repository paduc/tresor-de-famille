import { postgres } from '../../dependencies/postgres'
import { UUID } from '../../domain'
import { BunnyCDNVideo, UserAddedBunnyCDNVideo, VideoSequence, VideoSequenceAdded } from '../../events'
import { getGedcom } from '../importGedcomSuccess/getGedcom.query'
import { getPersonById } from '../_getPersonById'
import { TaggedPersonDTO, VideoSequenceDTO } from './VideoAnnotationPage'

export const getVideo = async (videoId: string): Promise<{ video: BunnyCDNVideo; sequences: VideoSequenceDTO[] }> => {
  const { rows: addedVideoEvents } = await postgres.query<UserAddedBunnyCDNVideo>(
    "SELECT * FROM events WHERE type = 'UserAddedBunnyCDNVideo' AND payload->>'videoId'=$1 LIMIT 1",
    [videoId]
  )

  if (!addedVideoEvents.length) {
    throw new Error('Video introuvable')
  }

  const video = addedVideoEvents[0].payload

  const { rows: allSequenceAddedEvents } = await postgres.query<VideoSequenceAdded>(
    "SELECT * FROM events WHERE type = 'VideoSequenceAdded' AND payload->>'videoId'=$1 ORDER BY payload->>'addedOn' DESC",
    [videoId]
  )

  const latestSequenceAddedEvents = filterLatestEventForSequenceId(allSequenceAddedEvents)

  const sequences = await Promise.all(latestSequenceAddedEvents.map(toSequenceDTO))

  return {
    video,
    sequences,
  }
}

function filterLatestEventForSequenceId(sequences: VideoSequenceAdded[]) {
  return sequences
    .map((sequenceAddedEvent) => sequenceAddedEvent.payload)
    .reduce((uniqueSequences, sequence) => {
      if (!uniqueSequences.find(({ sequenceId }) => sequenceId === sequence.sequenceId)) {
        uniqueSequences.push(sequence)
      }

      return uniqueSequences
    }, [] as VideoSequence[])
}

async function toSequenceDTO(videoSequence: VideoSequence): Promise<VideoSequenceDTO> {
  const { videoId, sequenceId, startTime, endTime, title, date, description, places, persons: personIds } = videoSequence

  const persons = (personIds ? await Promise.all(personIds.map(getPersonById)) : [])
    .filter(isDefined)
    .map((person: any) => toTaggedPersonDTO(person))

  return {
    videoId,
    sequenceId,
    startTime,
    endTime,
    title,
    date,
    description,
    places,
    persons,
  }
}

function toTaggedPersonDTO(person: any): TaggedPersonDTO {
  return { ...person, objectID: person.id }
}

function isDefined<T>(object: T | undefined): object is T {
  return !!object
}
