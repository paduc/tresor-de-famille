import { resetDatabase } from '../../dependencies/__test__/resetDatabase'
import { addToHistory } from '../../dependencies/addToHistory'
import { getUuid } from '../../libs/getUuid'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { makePhotoId } from '../../libs/makePhotoId'
import { makeThreadId } from '../../libs/makeThreadId'
import { makeAppUserId } from '../../libs/makeUserId'
import { UserAddedCaptionToPhoto } from '../photo/UserAddedCaptionToPhoto'
import { UserSetCaptionOfPhotoInThread } from './UserSetCaptionOfPhotoInThread'
import { UserUpdatedThreadAsRichText } from './UserUpdatedThreadAsRichText'
import { getThreadPageProps } from './getThreadPageProps'

describe('getThreadPageProps', () => {
  describe('when a photo a UserSetCaptionOfPhotoInThread for the photo and thread', () => {
    const threadId = makeThreadId()
    const photoId = makePhotoId()
    const userId = makeAppUserId()
    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserUpdatedThreadAsRichText({
          userId,
          threadId,
          familyId: makeFamilyId(),
          contentAsJSON: {
            type: 'doc',
            content: [
              {
                type: 'photoNode',
                attrs: {
                  photoId,
                  caption: '',
                },
              },
            ],
          },
        })
      )

      await addToHistory(
        UserSetCaptionOfPhotoInThread({
          userId,
          threadId,
          photoId,
          caption: 'Hello',
        })
      )
    })

    it('should return the value in the UserSetCaptionOfPhotoInThread', async () => {
      const res = await getThreadPageProps({ threadId, userId })

      expect(res.contentAsJSON).toMatchObject({
        type: 'doc',
        content: [
          {
            type: 'photoNode',
            attrs: {
              photoId,
              caption: 'Hello',
            },
          },
        ],
      })
    })
  })

  describe('when a photo has a UserAddedCaptionToPhoto and a UserSetCaptionOfPhotoInThread for the photo and thread', () => {
    const threadId = makeThreadId()
    const photoId = makePhotoId()
    const userId = makeAppUserId()
    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserUpdatedThreadAsRichText({
          userId,
          threadId,
          familyId: makeFamilyId(),
          contentAsJSON: {
            type: 'doc',
            content: [
              {
                type: 'photoNode',
                attrs: {
                  photoId,
                  caption: '',
                },
              },
            ],
          },
        })
      )

      await addToHistory(
        UserSetCaptionOfPhotoInThread({
          userId,
          threadId,
          photoId,
          caption: 'Hello',
        })
      )

      await addToHistory(
        UserAddedCaptionToPhoto({
          userId,
          photoId,
          caption: {
            id: getUuid(),
            body: 'Bye',
          },
        })
      )
    })

    it('should return the value in the UserSetCaptionOfPhotoInThread', async () => {
      const res = await getThreadPageProps({ threadId, userId })

      expect(res.contentAsJSON).toMatchObject({
        type: 'doc',
        content: [
          {
            type: 'photoNode',
            attrs: {
              photoId,
              caption: 'Hello',
            },
          },
        ],
      })
    })
  })

  describe('when a photo only has a UserAddedCaptionToPhoto', () => {
    const threadId = makeThreadId()
    const photoId = makePhotoId()
    const userId = makeAppUserId()
    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserUpdatedThreadAsRichText({
          userId,
          threadId,
          familyId: makeFamilyId(),
          contentAsJSON: {
            type: 'doc',
            content: [
              {
                type: 'photoNode',
                attrs: {
                  photoId,
                  caption: '',
                },
              },
            ],
          },
        })
      )

      await addToHistory(
        UserAddedCaptionToPhoto({
          userId,
          photoId,
          caption: {
            id: getUuid(),
            body: 'Well',
          },
        })
      )
    })

    it('should return the value in the UserAddedCaptionToPhoto', async () => {
      const res = await getThreadPageProps({ threadId, userId })

      expect(res.contentAsJSON).toMatchObject({
        type: 'doc',
        content: [
          {
            type: 'photoNode',
            attrs: {
              photoId,
              caption: 'Well',
            },
          },
        ],
      })
    })
  })
})
