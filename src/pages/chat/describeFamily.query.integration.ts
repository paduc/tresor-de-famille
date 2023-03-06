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
describe('describeFamily', () => {
  beforeEach(async () => {
    await resetDatabase()
    await publish(
      GedcomImported({
        rawGedcom: '',
        relationships: [
          {
            childId: personId,
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
