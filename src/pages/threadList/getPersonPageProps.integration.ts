import { resetDatabase } from '../../dependencies/__test__/resetDatabase'
import { addToHistory } from '../../dependencies/addToHistory'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { FamilyShareCode } from '../../domain/FamilyShareCode'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'
import { ThreadId } from '../../domain/ThreadId'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself'
import { UserRecognizedPersonInPhoto } from '../../events/onboarding/UserRecognizedPersonInPhoto'
import { makeCommentId } from '../../libs/makeCommentId'
import { makeFaceId } from '../../libs/makeFaceId'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { makePersonId } from '../../libs/makePersonId'
import { makePhotoId } from '../../libs/makePhotoId'
import { makeThreadId } from '../../libs/makeThreadId'
import { makeAppUserId } from '../../libs/makeUserId'
import { asFamilyId } from '../../libs/typeguards'
import { UserAcceptedInvitation } from '../invitation/UserAcceptedInvitation'
import { getPersonPageProps } from '../person/getPersonPageProps'
import { ThumbnailURL } from '../photoApi/ThumbnailURL'
import { UserUploadedPhoto } from '../photoApi/UserUploadedPhoto'
import { UserCreatedNewFamily } from '../share/UserCreatedNewFamily'
import { PhotoAutoSharedWithThread } from '../thread/PhotoAutoSharedWithThread'
import { ThreadSharedWithFamilies } from '../thread/ThreadPage/ThreadSharedWithFamilies'
import { UserAddedCommentOnThread } from '../thread/UserAddedCommentOnThread'
import { UserSetChatTitle } from '../thread/UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from '../thread/UserUpdatedThreadAsRichText'

describe('getPersonPageProps', () => {
  describe('when there is a thread, containing a photo, where the person has been recognized', () => {
    // Getting all the threads where person in mentionned
    // = getting all the threads containing a photo of the person
    // = getting all the photos containing the person (we already have those)

    const photoAuthorId = 'photoAuthorId' as AppUserId
    const threadAuthorId = 'threadAuthorId' as AppUserId
    const userId = 'userId' as AppUserId

    const familyId = 'familyId' as FamilyId

    const targetPersonId = 'targetPersonId' as PersonId
    const targetPhotoId = 'targetPhotoId' as PhotoId
    const targetThreadId = 'targetThreadId' as ThreadId

    let lastUpdatedOn: number

    beforeAll(async () => {
      await resetDatabase()

      // 0) A person is created
      await addToHistory(
        UserNamedThemself({
          userId: 'personUserId' as AppUserId,
          name: 'John',
          familyId,
          personId: targetPersonId,
        })
      )

      // 1) A photo is uploaded
      await addToHistory(
        UserUploadedPhoto({
          userId: photoAuthorId,
          photoId: targetPhotoId,
          location: {} as UserUploadedPhoto['payload']['location'],
        })
      )

      // 2) A thread is written containing the photo
      await addToHistory(
        UserUpdatedThreadAsRichText({
          userId: threadAuthorId,
          threadId: targetThreadId,
          contentAsJSON: {
            type: 'doc',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'This is a test' }] },
              { type: 'photoNode', attrs: { photoId: targetPhotoId } },
            ],
          },
          familyId: asFamilyId(threadAuthorId),
        })
      )
      await addToHistory(
        UserNamedThemself({
          userId: threadAuthorId,
          name: 'Thread Author',
          familyId,
          personId: makePersonId(),
        })
      )

      // 2.1) thread is shared with family

      await addToHistory(
        ThreadSharedWithFamilies({
          threadId: targetThreadId,
          familyIds: [familyId],
          userId: threadAuthorId,
        })
      )

      await addToHistory(
        PhotoAutoSharedWithThread({
          photoId: targetPhotoId,
          familyId,
          threadId: targetThreadId,
        })
      )

      // 3) The person has been recognized in the photo
      await addToHistory(
        UserRecognizedPersonInPhoto({
          userId: 'recognizer' as AppUserId,
          faceId: makeFaceId(),
          personId: targetPersonId,
          photoId: targetPhotoId,
        })
      )

      // 4) Invite the user to the family
      await addToHistory(
        UserCreatedNewFamily({
          userId: 'familyCreatorId' as AppUserId,
          familyId,
          shareCode: '' as FamilyShareCode,
          about: '',
          familyName: '',
        })
      )

      await addToHistory(
        UserAcceptedInvitation({
          userId,
          familyId,
          shareCode: '' as FamilyShareCode,
        })
      )

      // 5) More details
      await addToHistory(
        UserSetChatTitle({
          threadId: targetThreadId,
          userId: makeAppUserId(),
          familyId,
          title: 'test title',
        })
      )

      const lastEvent = UserAddedCommentOnThread({
        threadId: targetThreadId,
        commentId: makeCommentId(),
        body: 'hello comment',
        userId: threadAuthorId,
      })
      lastUpdatedOn = lastEvent.occurredAt.getTime()
      await addToHistory(lastEvent)
    })

    it('should include this thread in the threadsTheyAppearIn', async () => {
      const res = await getPersonPageProps({ personId: targetPersonId, userId })

      expect(res.threadsTheyAppearIn).toHaveLength(1)
      expect(res.threadsTheyAppearIn[0]).toMatchObject({
        threadId: targetThreadId,
        title: 'test title',
        contents: 'This is a test',
        authors: [
          {
            name: 'Thread Author',
          },
        ],
        familyIds: [familyId],
        thumbnails: [ThumbnailURL(targetPhotoId)],
        commentCount: 1,
        lastUpdatedOn,
      })
    })
  })
})
