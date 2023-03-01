import { publish } from '../../dependencies/eventStore'
import { resetDatabase } from '../../dependencies/__test__/resetDatabase'
import { GedcomImported } from '../../events'
import { getUuid } from '../../libs/getUuid'
import { AWSFaceIdLinkedToPerson } from './AWSFaceIdLinkedToPerson'
import { getPersonForFaceId } from './getPersonForFaceId.query'

describe('getPersonForFaceId', () => {
  describe('when the AWS FaceId is not linked to a person', () => {
    const faceId = getUuid()
    it('should return null', async () => {
      const result = await getPersonForFaceId(faceId)
      expect(result).toEqual(null)
    })
  })

  describe('when the AWS FaceId is linked to a Person', () => {
    const faceId = getUuid()
    const personId = getUuid()

    beforeAll(async () => {
      await resetDatabase()

      await publish(
        GedcomImported({
          rawGedcom: '',
          relationships: [],
          persons: [
            { id: getUuid(), name: 'not the correct person' },
            { id: personId, name: 'correct' },
          ],
          importedBy: '',
        })
      )

      await publish(
        AWSFaceIdLinkedToPerson({
          faceId,
          personId,
        })
      )
    })

    it('should return the person linked to the face', async () => {
      const res = await getPersonForFaceId(faceId)

      expect(res).toEqual({ id: personId, name: 'correct' })
    })
  })
})
