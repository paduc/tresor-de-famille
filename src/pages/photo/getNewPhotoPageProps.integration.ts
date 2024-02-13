import { resetDatabase } from '../../dependencies/__test__/resetDatabase'
import { addToHistory } from '../../dependencies/addToHistory'
import { UserRegisteredWithEmailAndPassword } from '../../events/UserRegisteredWithEmailAndPassword'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { makePersonId } from '../../libs/makePersonId'
import { makePhotoId } from '../../libs/makePhotoId'
import { makeThreadId } from '../../libs/makeThreadId'
import { makeAppUserId } from '../../libs/makeUserId'
import { asFamilyId } from '../../libs/typeguards'
import { UserUploadedPhoto } from '../photoApi/UserUploadedPhoto'
import { ThreadSharedWithFamilies } from '../thread/ThreadPage/ThreadSharedWithFamilies'
import { UserUpdatedThreadAsRichText } from '../thread/UserUpdatedThreadAsRichText'
import { getNewPhotoPageProps } from './getNewPhotoPageProps'

describe('getNewPhotoPageProps', () => {
  describe('when a thread contains the photo', () => {
    const userId = makeAppUserId()

    const targetPhotoId = makePhotoId()
    const targetThreadId = makeThreadId()
    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserUploadedPhoto({
          userId,
          photoId: targetPhotoId,
          location: {} as UserUploadedPhoto['payload']['location'],
        })
      )

      const threadAuthorId = makeAppUserId()
      await addToHistory(
        UserNamedThemself({
          userId: threadAuthorId,
          name: 'John Doe',
          familyId: asFamilyId(userId),
          personId: makePersonId(),
        })
      )

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
          familyId: asFamilyId(userId),
        })
      )

      await addToHistory(
        ThreadSharedWithFamilies({
          threadId: targetThreadId,
          familyIds: [asFamilyId(userId)],
          userId: threadAuthorId,
        })
      )

      // Wrong photo
      await addToHistory(
        UserUpdatedThreadAsRichText({
          userId: makeAppUserId(),
          threadId: makeThreadId(),
          contentAsJSON: {
            type: 'doc',
            content: [{ type: 'photoNode', attrs: { photoId: makePhotoId() } }],
          },
          familyId: makeFamilyId(),
        })
      )

      // Wrong family
      await addToHistory(
        UserUpdatedThreadAsRichText({
          userId: makeAppUserId(),
          threadId: makeThreadId(),
          contentAsJSON: {
            type: 'doc',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'This is not good' }] },
              { type: 'photoNode', attrs: { photoId: targetPhotoId } },
            ],
          },
          familyId: makeFamilyId(),
        })
      )
    })

    it('should return the threads that contains the photo', async () => {
      const res = await getNewPhotoPageProps({ photoId: targetPhotoId, userId })

      expect(res.threadsContainingPhoto).toHaveLength(1)
      expect(res.threadsContainingPhoto[0]).toMatchObject({
        threadId: targetThreadId,
        title: 'This is a test',
        author: {
          name: 'John Doe',
        },
      })
    })
  })

  describe('when a thread that contains the photo has been updated multiple times', () => {
    const userId = makeAppUserId()

    const targetPhotoId = makePhotoId()
    const targetThreadId = makeThreadId()
    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserUploadedPhoto({
          userId,
          photoId: targetPhotoId,
          location: {} as UserUploadedPhoto['payload']['location'],
        })
      )

      const threadAuthorId = makeAppUserId()
      await addToHistory(
        UserNamedThemself({
          userId: threadAuthorId,
          name: 'John Doe',
          familyId: asFamilyId(userId),
          personId: makePersonId(),
        })
      )

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
          familyId: asFamilyId(userId),
        })
      )

      await addToHistory(
        UserUpdatedThreadAsRichText({
          userId: threadAuthorId,
          threadId: targetThreadId,
          contentAsJSON: {
            type: 'doc',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'This is a more recent test' }] },
              { type: 'photoNode', attrs: { photoId: targetPhotoId } },
            ],
          },
          familyId: asFamilyId(userId),
        })
      )

      await addToHistory(
        ThreadSharedWithFamilies({
          threadId: targetThreadId,
          familyIds: [asFamilyId(userId)],
          userId: threadAuthorId,
        })
      )
    })

    it('should return the latest update of the thread containing the photo', async () => {
      const res = await getNewPhotoPageProps({ photoId: targetPhotoId, userId })

      expect(res.threadsContainingPhoto).toHaveLength(1)
      expect(res.threadsContainingPhoto[0]).toMatchObject({
        threadId: targetThreadId,
        title: 'This is a more recent test',
        author: {
          name: 'John Doe',
        },
      })
    })
  })
})
