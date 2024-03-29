import { resetDatabase } from '../../dependencies/__test__/resetDatabase.js'
import { addToHistory } from '../../dependencies/addToHistory.js'
import { OnboardingUserUploadedPhotoOfFamily } from '../../events/onboarding/OnboardingUserUploadedPhotoOfFamily.js'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself.js'
import { makeFamilyId } from '../../libs/makeFamilyId.js'
import { makePhotoId } from '../../libs/makePhotoId.js'
import { makeThreadId } from '../../libs/makeThreadId.js'
import { makeAppUserId } from '../../libs/makeUserId.js'
import { asFamilyId } from '../../libs/typeguards.js'
import { PhotoLocation, UserUploadedPhoto } from '../photoApi/UserUploadedPhoto.js'
import { UserUploadedPhotoToFamily } from '../photoApi/UserUploadedPhotoToFamily.js'
import { PhotoAutoSharedWithThread } from '../thread/PhotoAutoSharedWithThread.js'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread.js'
import { UserUploadedPhotoToChat } from '../thread/uploadPhotoToChat/UserUploadedPhotoToChat.js'
import { getPhotoListPageProps } from './getPhotoListPageProps.js'

describe('getPhotoListPageProps', () => {
  describe('when the user uploads a photo on his space', () => {
    const userId = makeAppUserId()
    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserUploadedPhotoToChat({
          location: {} as PhotoLocation,
          photoId: makePhotoId(),
          userId,
          familyId: asFamilyId(userId),
          threadId: makeThreadId(),
        })
      )

      await addToHistory(
        UserUploadedPhotoToFamily({
          location: {} as PhotoLocation,
          photoId: makePhotoId(),
          userId,
          familyId: asFamilyId(userId),
        })
      )

      await addToHistory(
        UserUploadedPhoto({
          location: {} as PhotoLocation,
          photoId: makePhotoId(),
          userId,
        })
      )

      await addToHistory(
        OnboardingUserUploadedPhotoOfFamily({
          location: {} as PhotoLocation,
          photoId: makePhotoId(),
          userId,
          familyId: asFamilyId(userId),
        })
      )

      await addToHistory(
        OnboardingUserUploadedPhotoOfThemself({
          location: {} as PhotoLocation,
          photoId: makePhotoId(),
          userId,
          familyId: asFamilyId(userId),
        })
      )
    })

    it('should list them on the Personal Space', async () => {
      const res = await getPhotoListPageProps({ userId, familyId: undefined })

      expect(res.photos).toHaveLength(5)
    })

    it('should not list them on the other spaces', async () => {
      const res = await getPhotoListPageProps({ userId, familyId: makeFamilyId() })

      expect(res.photos).toHaveLength(0)
    })
  })

  describe('when a photo, by someone else, has been shared to a family thread', () => {
    const userId = makeAppUserId()
    const familyId = makeFamilyId()

    beforeAll(async () => {
      await resetDatabase()

      const authorId = makeAppUserId()
      await addToHistory(
        UserUploadedPhotoToChat({
          location: {} as PhotoLocation,
          photoId: makePhotoId(),
          userId: authorId,
          familyId: asFamilyId(authorId),
          threadId: makeThreadId(),
        })
      )

      await addToHistory(
        PhotoAutoSharedWithThread({
          photoId: makePhotoId(),
          familyId,
          threadId: makeThreadId(),
        })
      )
    })

    it('should list them on the family space', async () => {
      const res = await getPhotoListPageProps({ userId, familyId })

      expect(res.photos).toHaveLength(1)
    })
  })
})
