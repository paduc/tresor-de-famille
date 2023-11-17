import { resetDatabase } from '../../../dependencies/__test__/resetDatabase'
import { addToHistory } from '../../../dependencies/addToHistory'
import { AppUserId } from '../../../domain/AppUserId'
import { FamilyId } from '../../../domain/FamilyId'
import { GedcomImported } from '../../../events/GedcomImported'
import { makePersonId } from '../../../libs/makePersonId'
import { describeFamily } from './describeFamily'

const personId = makePersonId()
const wifeId = makePersonId()
const dadId = makePersonId()
const momId = makePersonId()
const daughterId = makePersonId()
const sonId = makePersonId()
const sisterId = makePersonId()
const brotherId = makePersonId()
const granpaId = makePersonId()
const grammaId = makePersonId()
const popsId = makePersonId()
const mumId = makePersonId()
const uncleJerry = makePersonId()
const auntBeth = makePersonId()
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
        importedBy: '' as AppUserId,
        familyId: '' as FamilyId,
      })
    )
  })

  it('should return a string description of the person family', async () => {
    const res = await describeFamily({ personId })
    expect(res).toBeDefined()
  })
})
