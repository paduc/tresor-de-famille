import { postgres } from '../../../dependencies/postgres'
import { GedcomImported, Person } from '../../../events'
import { makeIdCodeMap } from '../../../libs/makeIdCodeMap'

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
  // TODO: only fetch the tree if there are personIds
  const { rows: gedcomImportedRows } = await postgres.query<GedcomImported>(
    "SELECT * FROM events WHERE type = 'GedcomImported' LIMIT 1"
  )

  if (!gedcomImportedRows.length) {
    throw 'GedcomImported introuvable'
  }

  const gedcom = gedcomImportedRows[0].payload

  function getPersonById(personId: string) {
    return gedcom.persons.find((person: Person) => person.id === personId)
  }

  const faceCodeMap = makeIdCodeMap('face')

  const descriptions = []

  for (const photoFace of photoFaces) {
    if (photoFace.personId) {
      const person = await getPersonById(photoFace.personId)
      descriptions.push(person?.name)
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
