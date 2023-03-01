import { publish } from '../../dependencies/eventStore'
import { resetDatabase } from '../../dependencies/__test__/resetDatabase'
import { getUuid } from '../../libs/getUuid'
import { AWSFaceIdLinkedToPerson } from './AWSFaceIdLinkedToPerson'
import { getPersonIdForFaceId } from './getPersonIdForFaceId.query'

describe('getPersonIdForFaceId', () => {
  describe('when the AWS FaceId is not linked to a person', () => {
    const faceId = getUuid()
    it('should return null', async () => {
      const result = await getPersonIdForFaceId(faceId)
      expect(result).toEqual(null)
    })
  })

  describe('when the AWS FaceId is linked to a Person', () => {
    const faceId = getUuid()
    const personId = getUuid()

    beforeAll(async () => {
      await resetDatabase()

      await publish(
        AWSFaceIdLinkedToPerson({
          faceId,
          personId,
        })
      )
    })

    it('should return the person linked to the face', async () => {
      const res = await getPersonIdForFaceId(faceId)

      expect(res).toEqual(personId)
    })
  })
})
