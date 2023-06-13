import { postgres } from '../../../dependencies/database'
import { UUID } from '../../../domain'
import { makeIdCodeMap } from '../../../libs/makeIdCodeMap'
import { AWSDetectedFacesInPhoto } from '../recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'

type PhotoFace = {
  person: {
    name: string
  } | null
  faceId: UUID
  position: {
    width: number
    height: number
    left: number
    top: number
  }
}

type DetectedFace = AWSDetectedFacesInPhoto['payload']['faces'][number]

type PhotoFaceDescription = {
  description: string
  unknownFaces: string[]
  knownPersons: string[]
  faceCodeMap: ReturnType<typeof makeIdCodeMap>
}

export const describePhotoFaces = async (photoId: UUID, photoFaces: PhotoFace[]): Promise<PhotoFaceDescription> => {
  const { rows: facesDetectedInChatPhotoRows } = await postgres.query<AWSDetectedFacesInPhoto>(
    "SELECT * FROM history WHERE type='AWSDetectedFacesInPhoto' AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
    [photoId]
  )

  if (!facesDetectedInChatPhotoRows.length) {
    throw new Error('Could not find FacesDetectedInChatPhoto')
  }

  const detectedFaces = facesDetectedInChatPhotoRows[0].payload.faces
  const detectedFaceByFaceId = new Map<string, DetectedFace>()
  for (const detectedFace of detectedFaces) {
    detectedFaceByFaceId.set(detectedFace.faceId, detectedFace)
  }

  const faceCodeMap = makeIdCodeMap('face')

  const descriptions = []
  const unknownFaces: string[] = []
  const knownPersons: string[] = []

  for (const photoFace of photoFaces.sort((a, b) => a.position.left - b.position.left)) {
    if (photoFace.person) {
      descriptions.push(photoFace.person?.name)
      knownPersons.push(photoFace.person?.name)
    } else {
      const detectedFace = detectedFaceByFaceId.get(photoFace.faceId)
      if (!detectedFace) continue
      const faceCode = faceCodeMap.idToCode(photoFace.faceId)
      unknownFaces.push(faceCode!)
      descriptions.push(`${genderedPerson(detectedFace)}${agedPerson(detectedFace)}(${faceCode})`)
    }
  }

  return { description: descriptions.join(' and '), unknownFaces, knownPersons, faceCodeMap }
}

function genderedPerson(face: DetectedFace): string {
  if (!face.details || !face.details.Gender || !face.details.Gender.Confidence) {
    return 'a person '
  }

  if (face.details.Gender.Value && face.details.Gender.Confidence > 90) {
    return face.details.Gender.Value === 'Male' ? 'a male ' : face.details.Gender.Value === 'Female' ? 'a female ' : 'a person '
  }

  return 'a person '
}

function agedPerson(face: DetectedFace): string {
  if (!face.details || !face.details.AgeRange) {
    return ''
  }

  return `between ${face.details.AgeRange.Low} and ${face.details.AgeRange.High} `
}
