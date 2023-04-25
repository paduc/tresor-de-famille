import { addToHistory } from '../../../../dependencies/addToHistory'
import { resetDatabase } from '../../../../dependencies/__test__/resetDatabase'
import { getUuid } from '../../../../libs/getUuid'
import { ChatEvent } from '../../ChatPage/ChatPage'
import { OpenAIMadeDeductions } from '../../sendToOpenAIForDeductions/OpenAIMadeDeductions'
import { makeAugmentChatPhotosWithPersonsDeducted } from './augmentChatPhotosWithPersonsDeducted'

const personId = getUuid()
const chatId = getUuid()
const photoId = getUuid()
const faceId = getUuid()

describe('augmentChatPhotosWithPersonsDeducted', () => {
  describe('when there are no OpenAIMadeDeductions events', () => {
    const augmentChatPhotosWithPersonsDeducted = makeAugmentChatPhotosWithPersonsDeducted({
      getPersonById: jest.fn(),
    })

    beforeAll(async () => {
      await resetDatabase()
      await augmentChatPhotosWithPersonsDeducted(chatId, photoRows)
    })

    const fakeBBox = {
      width: 1,
      height: 2,
      left: 3,
      top: 4,
    }

    const photoRows: (ChatEvent & { type: 'photo' })[] = [
      {
        type: 'photo',
        timestamp: Date.now(),
        profilePicUrl: '',
        photo: {
          id: photoId,
          url: '',
          faces: [
            {
              person: null,
              faceId,
              position: fakeBBox,
            },
          ],
        },
      },
    ]

    it('should return an unchanged list of photo faces', async () => {
      expect(photoRows[0].photo.faces).toStrictEqual([
        {
          person: null,
          faceId,
          position: fakeBBox,
        },
      ])
    })
  })

  // describe('when there is a OpenAIMadeDeductions event', () => {
  //   const fakePerson = {
  //     name: 'toto',
  //   }
  //   const fakeBBox = {
  //     width: 1,
  //     height: 2,
  //     left: 3,
  //     top: 4,
  //   }

  //   const fakeGetPersonById = jest.fn((personId: string) => Promise.resolve(fakePerson))

  //   const augmentChatPhotosWithPersonsDeducted = makeAugmentChatPhotosWithPersonsDeducted({
  //     getPersonById: fakeGetPersonById,
  //   })

  //   beforeAll(async () => {
  //     await resetDatabase()
  //     await addToHistory(
  //       OpenAIMadeDeductions({
  //         chatId,
  //         promptId: getUuid(),
  //         messageId: getUuid(),
  //         deductions: [
  //           {
  //             type: 'face-is-person',
  //             photoId,
  //             personId,
  //             faceId,
  //           },
  //         ],
  //       })
  //     )
  //     await augmentChatPhotosWithPersonsDeducted(chatId, photoRows)
  //   })

  //   const otherFaceId = getUuid()
  //   const photoRows: (ChatEvent & { type: 'photo' })[] = [
  //     {
  //       type: 'photo' as 'photo',
  //       timestamp: Date.now(),
  //       profilePicUrl: '',
  //       photo: {
  //         id: photoId,
  //         url: '',
  //         faces: [
  //           {
  //             person: null,
  //             faceId,
  //             position: fakeBBox,
  //           },
  //           {
  //             person: null,
  //             faceId: otherFaceId, // insert fake to be sure it is not altered
  //             position: fakeBBox,
  //           },
  //         ],
  //       },
  //     },
  //   ]

  //   it('should call getPersonById to retrieve the person', async () => {
  //     expect(fakeGetPersonById).toHaveBeenCalledWith(personId)
  //   })

  //   it('should add the person info to the face with the correct faceId', async () => {
  //     expect(photoRows[0].photo.faces).toHaveLength(2)

  //     expect(photoRows[0].photo.faces![0]).toEqual({
  //       person: fakePerson,
  //       faceId,
  //       position: fakeBBox,
  //     })

  //     expect(photoRows[0].photo.faces![1]).toEqual({
  //       person: null,
  //       faceId: otherFaceId,
  //       position: fakeBBox,
  //     })
  //   })
  // })

  // describe('when there is multiple OpenAIMadeDeductions events for the same faceId', () => {
  //   const fakePerson = {
  //     name: 'toto',
  //   }
  //   const fakeBBox = {
  //     width: 1,
  //     height: 2,
  //     left: 3,
  //     top: 4,
  //   }

  //   const fakeGetPersonById = jest.fn((personId: string) => Promise.resolve(fakePerson))

  //   const augmentChatPhotosWithPersonsDeducted = makeAugmentChatPhotosWithPersonsDeducted({
  //     getPersonById: fakeGetPersonById,
  //   })

  //   const otherPersonId = getUuid()

  //   beforeAll(async () => {
  //     await resetDatabase()
  //     await addToHistory(
  //       OpenAIMadeDeductions({
  //         chatId,
  //         promptId: getUuid(),
  //         messageId: getUuid(),
  //         deductions: [
  //           {
  //             type: 'face-is-person',
  //             photoId,
  //             personId,
  //             faceId,
  //           },
  //         ],
  //       })
  //     )
  //     await addToHistory(
  //       OpenAIMadeDeductions({
  //         chatId,
  //         promptId: getUuid(),
  //         messageId: getUuid(),
  //         deductions: [
  //           {
  //             type: 'face-is-person',
  //             photoId,
  //             personId: otherPersonId,
  //             faceId,
  //           },
  //         ],
  //       })
  //     )
  //     await augmentChatPhotosWithPersonsDeducted(chatId, photoRows)
  //   })

  //   const photoRows: (ChatEvent & { type: 'photo' })[] = [
  //     {
  //       type: 'photo' as 'photo',
  //       timestamp: Date.now(),
  //       profilePicUrl: '',
  //       photo: {
  //         id: photoId,
  //         url: '',
  //         faces: [
  //           {
  //             person: null,
  //             faceId,
  //             position: fakeBBox,
  //           },
  //         ],
  //       },
  //     },
  //   ]

  //   it('should use the latest deduction (ie the person in the latest event for the face)', async () => {
  //     expect(fakeGetPersonById).toHaveBeenCalledWith(otherPersonId)

  //     expect(photoRows[0].photo.faces).toHaveLength(1)

  //     expect(photoRows[0].photo.faces![0]).toEqual({
  //       person: fakePerson,
  //       faceId,
  //       position: fakeBBox,
  //     })
  //   })
  // })
})
