import { publish } from '../../../dependencies/eventStore'
import { resetDatabase } from '../../../dependencies/__test__/resetDatabase'
import { GedcomImported } from '../../../events'
import { getUuid } from '../../../libs/getUuid'
import { describePhotoFaces } from './describePhotoFaces'

const personId = getUuid()
describe('describePhotoFaces', () => {
  beforeEach(async () => {
    await resetDatabase()
    await publish(
      GedcomImported({
        rawGedcom: '',
        relationships: [],
        persons: [
          {
            id: personId,
            name: 'Philip Hornbread',
          },
        ],
        importedBy: '',
      })
    )
  })

  it('should return a string description of the person family', async () => {
    const res = await describePhotoFaces([
      {
        personId: null,
        faceCode: getUuid(),
        details: {
          gender: 'M',
          age: {
            low: 10,
            high: 17,
          },
        },
      },
      {
        personId,
        faceCode: null,
        details: {},
      },
      {
        personId: null,
        faceCode: getUuid(),
        details: {
          age: {
            low: 30,
            high: 40,
          },
        },
      },
      {
        personId: null,
        faceCode: getUuid(),
        details: {
          gender: 'F',
        },
      },
    ])
    console.log(res)
    expect(res).toBeDefined()
  })
})
