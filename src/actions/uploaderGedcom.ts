
import { unlink, readFile } from 'fs/promises'
import { parse as parseGedcom } from 'parse-gedcom'
import { v4 as uuid } from 'uuid'
import { gedcomImport } from '../events/GedcomImported';

import { publish } from '../dependencies/eventStore'
import { actionsRouter } from './actionsRouter';
import multer from 'multer';
import bodyParser from 'body-parser';





type RelationShip = { parent: any; child: any }

const FILE_SIZE_LIMIT_MB = 50

const upload = multer({
  dest: 'temp',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})


actionsRouter.post('/importGedcom.html', bodyParser.urlencoded({
  extended: false,
  limit: '10mb',
}),

upload.single('file-upload'), async(request, response)=>{

  const { file } = request;
  

  if (!file) {
    response.redirect('/')
    return
  }

  const { originalname, mimetype, path, size } = file

  try {
    const fileContents = await readFile(path, 'utf8')
    const rawContents = parseGedcom(fileContents).children

    
    

    const persons = rawContents.filter((item: any) => item.tag === 'INDI').map(parsePerson)

    const relationships: RelationShip[] = rawContents
      .filter((item: any) => item.tag === 'FAM')
      .map(parseFamily)
      .reduce(
        (allRelationships: any[], familyRelationships: any[]) => [
          ...allRelationships,
          ...familyRelationships,
        ],
        []
      )

    // We need to give an id to each person
    const personId: Record<string, string> = {}
    persons.forEach((person: any) => {
      person.id = uuid()
      personId[person.gedcomId] = person.id
    })

    relationships.forEach((relationship) => {
      relationship.parent = personId[relationship.parent]
      relationship.child = personId[relationship.child]
    })

    const erroneousRels = relationships.filter(
      (rel: { parent: any; child: any }) => !rel.parent || !rel.child
    )

    if (erroneousRels.length) {
      console.log('Found erroneousRels', erroneousRels.length)
      return response.status(400).send()
    }

    console.log('Found persons', persons.length, JSON.stringify(persons[0], null, 2))

    console.log(
      'Found family relationships',
      relationships.length,
      JSON.stringify(relationships[0], null, 2)
    )

    const uniqueness = new Set()
    const uniqueRelationships = []
    for (const relationship of relationships) {
      const value = relationship.parent + relationship.child
      if (!uniqueness.has(value)) {
        uniqueRelationships.push(relationship)
        uniqueness.add(value)
      }
    }

    await publish(
      gedcomImport({
        rawGedcom: fileContents,
        relationships: uniqueRelationships.map(({ parent, child }) => ({
          parentId: parent,
          childId: child,
        })),
        persons: persons.map(({ id, name }: any) => ({ id, name })),
      })
    )
  } catch (error) {
    console.log('Erreur lors du traitement du fichier gedcom', error)
  } finally {
    await unlink(path)
    response.redirect('/importGedcom.html')
  }
})

function parsePerson(personData: any) {
  const person: any = { gedcomId: personData.pointer }

  const birthData = personData.tree.find((item: any) => item.tag === 'BIRT')
  if (birthData) {
    const birthDate = birthData.tree.find((item: any) => item.tag === 'DATE')
    if (birthDate) {
      person.bornOn = birthDate.data
    }

    const birthPlace = birthData.tree.find((item: any) => item.tag === 'PLAC')
    if (birthPlace) {
      person.bornIn = birthPlace.data
    }
  }

  const deathData = personData.tree.find((item: any) => item.tag === 'DEAT')
  if (deathData) {
    const deathDate = deathData.tree.find((item: any) => item.tag === 'DATE')
    if (deathDate) {
      person.passedOn = deathDate.data
    }

    const deathPlace = deathData.tree.find((item: any) => item.tag === 'PLAC')
    if (deathPlace) {
      person.passedIn = deathPlace.data
    }
  }

  const sexData = personData.tree.find((item: any) => item.tag === 'SEX')
  if (sexData) {
    person.sex = sexData.data
  }

  const nameData = personData.tree.find((item: any) => item.tag === 'NAME')
  if (nameData) {
    person.name = nameData.data.replace(/\//g, '')
  } else {
    console.log(`ERROR: person ${person.gedcomId} does not have a name`)
  }

  return person
}

function parseFamily(familyData: any) {
  const parents = familyData.tree
    .filter((item: any) => item.tag === 'HUSB' || item.tag === 'WIFE')
    .map((item: any) => item.data)

  const children: any[] = familyData.tree
    .filter((item: any) => item.tag === 'CHIL')
    .map((item: any) => item.data)

  return children.reduce<{ parent: any; child: any }[]>(
    (relations, child) => [...relations, ...parents.map((parent: any) => ({ parent, child }))],
    []
  )
}


