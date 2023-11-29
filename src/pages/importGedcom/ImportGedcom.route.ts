import { parse as parseGedcom } from 'parse-gedcom'
import { v4 as uuid } from 'uuid'
import multer from 'multer'
import bodyParser from 'body-parser'

import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { unlink, readFile } from 'fs/promises'
import { addToHistory } from '../../dependencies/addToHistory'
import { GedcomImported } from '../../events/GedcomImported'
import { FamilyId } from '../../domain/FamilyId'

const FILE_SIZE_LIMIT_MB = 50

const upload = multer({
  dest: 'temp',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

pageRouter.route('/importGedcom.html').post(
  bodyParser.urlencoded({
    extended: false,
    limit: '10mb',
  }),
  requireAuth(),
  upload.single('file-upload'),
  async (request, response) => {
    const { file } = request

    if (!file) {
      response.redirect('/')
      return
    }

    const { originalname, mimetype, path, size } = file

    try {
      const fileContents = await readFile(path, 'utf8')
      const rawContents = parseGedcom(fileContents).children

      const persons = rawContents.filter((item: any) => item.type === 'INDI').map(parsePerson)

      const relationships: RelationShip[] = rawContents
        .filter((item: any) => item.type === 'FAM')
        .map(parseFamily)
        .reduce((allRelationships: any[], familyRelationships: any[]) => [...allRelationships, ...familyRelationships], [])

      // We need to give an id to each person
      const personId: Record<string, string> = {}
      persons.forEach((person: any) => {
        person.id = uuid() // TODO: make this a deterministic hash (of his name, DOB, ...)
        personId[person.gedcomId] = person.id
      })

      // replace gedcomId by uniqueId in relationships
      relationships.forEach((relationship) => {
        relationship.parent = personId[relationship.parent]
        relationship.child = personId[relationship.child]
      })

      const erroneousRels = relationships.filter((rel: { parent: any; child: any }) => !rel.parent || !rel.child)

      if (erroneousRels.length) {
        console.log('Found erroneousRels', erroneousRels.length)
        return response.status(400).send()
      }

      const uniqueness = new Set()
      const userId = request.session.user!.id

      const uniqueRelationships = []
      for (const relationship of relationships) {
        const value = relationship.parent + relationship.child
        if (!uniqueness.has(value)) {
          uniqueRelationships.push(relationship)
          uniqueness.add(value)
        }
      }

      await addToHistory(
        GedcomImported({
          rawGedcom: fileContents,
          relationships: uniqueRelationships.map(({ parent, child }) => ({
            parentId: parent,
            childId: child,
          })),
          persons: persons.map(({ id, name, bornOn, bornIn, passedOn, passedIn, sex }: any) => ({
            id,
            name,
            bornOn,
            bornIn,
            passedOn,
            passedIn,
            sex,
          })),
          importedBy: userId,
          familyId: request.session.user!.id as string as FamilyId,
        })
      )
    } catch (error) {
      console.log('Erreur lors du traitement du fichier gedcom', error)
    } finally {
      await unlink(path)
      return response.redirect('/')
    }
  }
)

type RelationShip = { parent: any; child: any }

function parsePerson(personData: any) {
  const person: any = { gedcomId: personData.data.xref_id }

  const birthData = personData.children.find((item: any) => item.type === 'BIRT')
  if (birthData) {
    const birthDate = birthData.children.find((item: any) => item.type === 'DATE')
    if (birthDate) {
      person.bornOn = birthDate.value
    }

    const birthPlace = birthData.children.find((item: any) => item.type === 'PLAC')
    if (birthPlace) {
      person.bornIn = birthPlace.value
    }
  }

  const deathData = personData.children.find((item: any) => item.type === 'DEAT')
  if (deathData) {
    const deathDate = deathData.children.find((item: any) => item.type === 'DATE')
    if (deathDate) {
      person.passedOn = deathDate.value
    }

    const deathPlace = deathData.children.find((item: any) => item.type === 'PLAC')
    if (deathPlace) {
      person.passedIn = deathPlace.value
    }
  }

  const sexData = personData.children.find((item: any) => item.type === 'SEX')
  if (sexData) {
    person.sex = sexData.value
  }

  const nameData = personData.children.find((item: any) => item.type === 'NAME')
  if (nameData) {
    person.name = nameData.value.replace(/\//g, '')
  } else {
    console.log(`ERROR: person ${person.gedcomId} does not have a name`)
  }

  return person
}

function parseFamily(familyData: any) {
  const parents = familyData.children
    .filter((item: any) => item.type === 'HUSB' || item.type === 'WIFE')
    .map((item: any) => item.data.pointer)

  const children: any[] = familyData.children.filter((item: any) => item.type === 'CHIL').map((item: any) => item.data.pointer)

  return children.reduce<{ parent: any; child: any }[]>(
    (relations, child) => [...relations, ...parents.map((parent: any) => ({ parent, child }))],
    []
  )
}
