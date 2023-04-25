import { addToHistory } from '../../../../dependencies/addToHistory'
import { resetDatabase } from '../../../../dependencies/__test__/resetDatabase'
import { UUID } from '../../../../domain'
import { getUuid } from '../../../../libs/getUuid'
import { FacesDetectedInChatPhoto } from '../../recognizeFacesInChatPhoto/FacesDetectedInChatPhoto'
import { makeAugmentChatPhotosWithFacesDetected } from './augmentChatPhotosWithFacesDetected'

const personId = getUuid()
const chatId = getUuid()
const photoId = getUuid()
const faceId = getUuid()

describe('augmentChatPhotosWithFacesDetected', () => {
  describe('when there are no FacesDetectedInChatPhoto events', () => {
    const augmentChatPhotosWithFacesDetected = makeAugmentChatPhotosWithFacesDetected({
      getPersonById: jest.fn(),
      normalizeBBOX: jest.fn(),
    })

    beforeAll(async () => {
      await resetDatabase()
      await augmentChatPhotosWithFacesDetected(chatId, photoRows)
    })

    const photoRows = [
      {
        type: 'photo' as 'photo',
        timestamp: Date.now(),
        profilePicUrl: '',
        photo: {
          id: photoId,
          url: '',
          faces: [],
        },
      },
    ]

    it('should return a list of photos from that chat without any faces', async () => {
      expect(photoRows[0].photo.faces).toHaveLength(0)
    })
  })

  describe('when there is a FacesDetectedInChatPhoto event', () => {
    const fakePerson = {
      name: 'toto',
    }
    const fakeBBox = {
      width: 1,
      height: 2,
      left: 3,
      top: 4,
    }

    describe('when there is a face with a personId', () => {
      const fakeGetPersonById = jest.fn((personId: UUID) => Promise.resolve(fakePerson))

      const augmentChatPhotosWithFacesDetected = makeAugmentChatPhotosWithFacesDetected({
        getPersonById: fakeGetPersonById,
        normalizeBBOX: () => fakeBBox,
      })

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          FacesDetectedInChatPhoto({
            chatId,
            photoId,
            faces: [
              {
                faceId: faceId,
                position: undefined!,
                confidence: 1,
              },
            ],
          })
        )
        await augmentChatPhotosWithFacesDetected(chatId, photoRows)
      })

      const photoRows = [
        {
          type: 'photo' as 'photo',
          timestamp: Date.now(),
          profilePicUrl: '',
          photo: {
            id: photoId,
            url: '',
            faces: [],
          },
        },
      ]

      it('should call getPersonById to retrieve the person', async () => {
        expect(fakeGetPersonById).toHaveBeenCalledWith(personId)
      })

      it('should add the face with the person to the photoRow', async () => {
        expect(photoRows[0].photo.faces).toHaveLength(1)
        expect(photoRows[0].photo.faces[0]).toEqual({
          person: fakePerson,
          faceId,
          position: fakeBBox,
        })
      })
    })

    describe('when there is a face without a personId', () => {
      const fakeGetPersonById = jest.fn()

      const augmentChatPhotosWithFacesDetected = makeAugmentChatPhotosWithFacesDetected({
        getPersonById: fakeGetPersonById,
        normalizeBBOX: () => fakeBBox,
      })

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          FacesDetectedInChatPhoto({
            chatId,
            photoId,
            faces: [
              {
                faceId: faceId,
                position: undefined!,
                confidence: 1,
              },
            ],
          })
        )
        await augmentChatPhotosWithFacesDetected(chatId, photoRows)
      })

      const photoRows = [
        {
          type: 'photo' as 'photo',
          timestamp: Date.now(),
          profilePicUrl: '',
          photo: {
            id: photoId,
            url: '',
            faces: [],
          },
        },
      ]

      it('should not call getPersonById to retrieve the person', async () => {
        expect(fakeGetPersonById).not.toHaveBeenCalled()
      })

      it('should add the face without the person to the photoRow', async () => {
        expect(photoRows[0].photo.faces).toHaveLength(1)
        expect(photoRows[0].photo.faces[0]).toEqual({
          person: null,
          faceId,
          position: fakeBBox,
        })
      })
    })
  })
})
