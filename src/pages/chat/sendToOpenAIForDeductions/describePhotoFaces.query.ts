import { makeIdCodeMap } from '../../../libs/makeIdCodeMap'
import { getPersonByIdOrThrow } from '../../_getPersonById'

type PhotoFace = {
  details: {
    age?: { low: number; high: number }
    gender?: 'M' | 'F'
  }
} & (
  | {
      personId: null
      faceCode: string
    }
  | { personId: string; faceCode: null }
)

type PhotoFaceDescription = { description: string; faceCodeMap: ReturnType<typeof makeIdCodeMap> }

export const describePhotoFaces = async (photoFaces: PhotoFace[]): Promise<PhotoFaceDescription> => {
  const faceCodeMap = makeIdCodeMap('face')

  const descriptions = []

  for (const photoFace of photoFaces) {
    if (photoFace.personId) {
      const { name } = await getPersonByIdOrThrow(photoFace.personId)
      descriptions.push(name)
    } else {
      descriptions.push(
        `${genderedPerson(photoFace)}${agedPerson(photoFace)}(${
          photoFace.faceCode ? faceCodeMap.idToCode(photoFace.faceCode) : 'no face code'
        })`
      )
    }
  }

  return { description: descriptions.join(' and '), faceCodeMap }
}

function genderedPerson(face: PhotoFace): string {
  if (!face.details.gender) {
    return 'a person '
  }

  if (face.details.gender === 'M') {
    return 'a male '
  }

  return 'a female '
}

function agedPerson(face: PhotoFace): string {
  if (!face.details.age) {
    return ''
  }

  return `between ${face.details.age.low} and ${face.details.age.high} `
}
