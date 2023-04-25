import { addToHistory } from '../../../dependencies/addToHistory'
import { resetDatabase } from '../../../dependencies/__test__/resetDatabase'
import { GedcomImported } from '../../../events'
import { getUuid } from '../../../libs/getUuid'
import { describeFamily } from './describeFamily'

const personId = getUuid()
const wifeId = getUuid()
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
const uncleJerry = getUuid()
const auntBeth = getUuid()
describe('describeFamily', () => {
  beforeEach(async () => {
    await resetDatabase()
    await addToHistory(
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
            childId: auntBeth,
            parentId: granpaId,
          },
          {
            childId: auntBeth,
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
            childId: uncleJerry,
            parentId: popsId,
          },
          {
            childId: uncleJerry,
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
          {
            parentId: wifeId,
            childId: daughterId,
          },
          {
            parentId: wifeId,
            childId: sonId,
          },
        ],
        persons: [
          {
            id: personId,
            name: 'Husband',
          },
          {
            id: wifeId,
            name: 'Wife',
          },
          {
            id: momId,
            name: 'Mother',
          },
          {
            id: dadId,
            name: 'Father',
          },
          {
            id: daughterId,
            name: 'Daughter',
          },
          {
            id: sonId,
            name: 'Son',
          },
          {
            id: sisterId,
            name: 'Sister',
          },
          {
            id: brotherId,
            name: 'Brother',
          },
          {
            id: granpaId,
            name: 'Father of Father',
          },
          {
            id: grammaId,
            name: 'Mother of Father',
          },
          {
            id: popsId,
            name: 'Father of Mother',
          },
          {
            id: mumId,
            name: 'Mother of Mother',
          },
          {
            id: uncleJerry,
            name: 'Uncle Jerry',
          },
          {
            id: auntBeth,
            name: 'Aunt Bethany',
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
