import { publish } from '../../dependencies/eventStore'
import { resetDatabase } from '../../dependencies/__test__/resetDatabase'
import { GedcomImported } from '../../events'
import { getUuid } from '../../libs/getUuid'
import { describeFamily } from './describeFamily.query'

const personId = getUuid()
const dadId = getUuid()
const momId = getUuid()
const daughterId = getUuid()
const sonId = getUuid()
const sisterId = getUuid()
const brotherId = getUuid()
const granpaId = getUuid()
const grammaId = getUuid()
const popsId = getUuid()
const mumId = getUuid()
describe('describeFamily', () => {
  beforeEach(async () => {
    await resetDatabase()
    await publish(
      GedcomImported({
        rawGedcom: '',
        relationships: [
          {
            childId: dadId,
            parentId: granpaId,
          },
          {
            childId: dadId,
            parentId: grammaId,
          },
          {
            childId: momId,
            parentId: popsId,
          },
          {
            childId: momId,
            parentId: mumId,
          },
          {
            childId: personId,
            parentId: momId,
          },
          {
            childId: sisterId,
            parentId: dadId,
          },
          {
            childId: brotherId,
            parentId: dadId,
          },
          {
            childId: sisterId,
            parentId: momId,
          },
          {
            childId: brotherId,
            parentId: momId,
          },
          {
            childId: personId,
            parentId: dadId,
          },
          {
            parentId: personId,
            childId: daughterId,
          },
          {
            parentId: personId,
            childId: sonId,
          },
        ],
        persons: [
          {
            id: personId,
            name: 'Pierre',
          },
          {
            id: momId,
            name: 'Sheryl',
          },
          {
            id: dadId,
            name: 'Tom',
          },
          {
            id: daughterId,
            name: 'Mary',
          },
          {
            id: sonId,
            name: 'LeBron',
          },
          {
            id: sisterId,
            name: 'Sharanda',
          },
          {
            id: brotherId,
            name: 'Leon',
          },
          {
            id: granpaId,
            name: 'Louis',
          },
          {
            id: grammaId,
            name: 'Cecile',
          },
          {
            id: popsId,
            name: 'Henry',
          },
          {
            id: mumId,
            name: 'Marie-Louise',
          },
        ],
        importedBy: '',
      })
    )
  })

  it('should return a string description of the person family', async () => {
    const res = await describeFamily({ personId })
    console.log(res)
    expect(res).toBeDefined()
  })
})
