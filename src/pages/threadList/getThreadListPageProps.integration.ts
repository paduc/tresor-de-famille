import { v4 } from 'uuid'
import { resetDatabase } from '../../dependencies/__test__/resetDatabase'
import { addToHistory } from '../../dependencies/addToHistory'
import { FamilyShareCode } from '../../domain/FamilyShareCode'
import { UUID } from '../../domain/UUID'
import { UserRegisteredWithEmailAndPassword } from '../../events/UserRegisteredWithEmailAndPassword'
import { UserSentMessageToChat } from '../../events/deprecated/UserSentMessageToChat'
import { OnboardingUserStartedFirstThread } from '../../events/onboarding/OnboardingUserStartedFirstThread'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { makePersonId } from '../../libs/makePersonId'
import { makePhotoId } from '../../libs/makePhotoId'
import { makeThreadId } from '../../libs/makeThreadId'
import { makeAppUserId } from '../../libs/makeUserId'
import { asFamilyId } from '../../libs/typeguards'
import { ThumbnailURL } from '../photoApi/ThumbnailURL'
import { PhotoLocation } from '../photoApi/UserUploadedPhoto'
import { UserCreatedNewFamily } from '../share/UserCreatedNewFamily'
import { ThreadSharedWithFamilies } from '../thread/ThreadPage/ThreadSharedWithFamilies'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread'
import { UserSetChatTitle } from '../thread/UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from '../thread/UserUpdatedThreadAsRichText'
import { getThreadListPageProps } from './getThreadListPageProps'

describe('getThreadListPageProps', () => {
  describe('when a user created a thread on the homepage (UserSetMessageToChat)', () => {
    const userId = makeAppUserId()
    const threadId = makeThreadId()
    const userFamily = asFamilyId(userId)
    let lastUpdatedOn: number = 0

    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId: userId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId,
          name: 'John Doe',
          familyId: userFamily,
          personId: makePersonId(),
        })
      )

      const event: UserSentMessageToChat = {
        id: v4(),
        type: 'UserSentMessageToChat',
        payload: {
          userId,
          threadId,
          familyId: userFamily,
          message: 'Test',
          messageId: '' as UUID,
        },
        occurredAt: new Date(),
      }
      lastUpdatedOn = event.occurredAt.getTime()
      await addToHistory(event)
    })

    it('should return a list with that thread', async () => {
      const { threads } = await getThreadListPageProps(userId)

      expect(threads).toHaveLength(1)

      expect(threads[0]).toMatchObject({
        threadId,
        title: undefined,
        lastUpdatedOn,
        authors: [
          {
            name: 'John Doe',
          },
        ],
        contents: 'Test',
        thumbnails: [],
        familyIds: [userFamily],
      })
    })
  })

  describe('when a user created a thread during onboarding (OnboardingUserStartedFirstThread)', () => {
    const userId = makeAppUserId()
    const threadId = makeThreadId()
    const userFamily = asFamilyId(userId)
    let lastUpdatedOn: number = 0

    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId: userId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId,
          name: 'John Doe',
          familyId: userFamily,
          personId: makePersonId(),
        })
      )

      const event = OnboardingUserStartedFirstThread({
        userId,
        threadId,
        familyId: userFamily,
        message: 'Test',
      })
      lastUpdatedOn = event.occurredAt.getTime()
      await addToHistory(event)
    })

    it('should return a list with that thread', async () => {
      const { threads } = await getThreadListPageProps(userId)

      expect(threads).toHaveLength(1)

      expect(threads[0]).toMatchObject({
        threadId,
        title: undefined,
        lastUpdatedOn,
        authors: [
          {
            name: 'John Doe',
          },
        ],
        contents: 'Test',
        thumbnails: [],
        familyIds: [userFamily],
      })
    })
  })

  describe('when a user created a thread by setting a title (UserSetChatTitle)', () => {
    const userId = makeAppUserId()
    const threadId = makeThreadId()
    const userFamily = asFamilyId(userId)
    let lastUpdatedOn: number = 0

    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId: userId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId,
          name: 'John Doe',
          familyId: userFamily,
          personId: makePersonId(),
        })
      )

      const event = UserSetChatTitle({
        userId,
        threadId,
        familyId: userFamily,
        title: 'Title',
      })
      lastUpdatedOn = event.occurredAt.getTime()
      await addToHistory(event)
    })

    it('should return a list with that thread (empty content but title)', async () => {
      const { threads } = await getThreadListPageProps(userId)

      expect(threads).toHaveLength(1)

      expect(threads[0]).toMatchObject({
        threadId,
        title: 'Title',
        lastUpdatedOn,
        authors: [
          {
            name: 'John Doe',
          },
        ],
        contents: '',
        thumbnails: [],
        familyIds: [userFamily],
      })
    })
  })

  describe('when a user updated a thread with a photo (UserInsertedPhotoInRichTextThread)', () => {
    const userId = makeAppUserId()
    const threadId = makeThreadId()
    const userFamily = asFamilyId(userId)
    let lastUpdatedOn: number = 0
    const photoId = makePhotoId()

    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId: userId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId,
          name: 'John Doe',
          familyId: userFamily,
          personId: makePersonId(),
        })
      )

      const event: UserInsertedPhotoInRichTextThread = {
        id: v4(),
        type: 'UserInsertedPhotoInRichTextThread',
        payload: {
          userId,
          threadId,
          familyId: userFamily,
          contentAsJSON: { type: 'doc', content: [{ type: 'photoNode', attrs: { photoId } }] },
          location: {} as PhotoLocation,
          photoId,
        },
        occurredAt: new Date(),
      }
      lastUpdatedOn = event.occurredAt.getTime()
      await addToHistory(event)
    })

    it('should return a list with that thread (with a thumbnail)', async () => {
      const { threads } = await getThreadListPageProps(userId)

      expect(threads).toHaveLength(1)

      expect(threads[0]).toMatchObject({
        threadId,
        title: undefined,
        lastUpdatedOn,
        authors: [
          {
            name: 'John Doe',
          },
        ],
        contents: '',
        thumbnails: [ThumbnailURL(photoId)],
        familyIds: [userFamily],
      })
    })
  })

  describe('when a user updated a thread (UserUpdatedThreadAsRichText)', () => {
    const userId = makeAppUserId()
    const threadId = makeThreadId()
    const userFamily = asFamilyId(userId)
    let lastUpdatedOn: number = 0
    const photoId = makePhotoId()

    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId: userId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId,
          name: 'John Doe',
          familyId: userFamily,
          personId: makePersonId(),
        })
      )

      const event = UserUpdatedThreadAsRichText({
        userId,
        threadId,
        familyId: userFamily,
        contentAsJSON: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Coucou' }] },
            { type: 'photoNode', attrs: { photoId } },
          ],
        },
      })
      lastUpdatedOn = event.occurredAt.getTime()
      await addToHistory(event)
    })

    it('should return a list with that thread (with a thumbnail)', async () => {
      const { threads } = await getThreadListPageProps(userId)

      expect(threads).toHaveLength(1)

      expect(threads[0]).toMatchObject({
        threadId,
        title: undefined,
        lastUpdatedOn,
        authors: [
          {
            name: 'John Doe',
          },
        ],
        contents: 'Coucou',
        thumbnails: [ThumbnailURL(photoId)],
        familyIds: [userFamily],
      })
    })
  })

  describe('when the user does not have access to the family of a thread', () => {
    const viewerUserId = makeAppUserId()
    const threadId = makeThreadId()
    let lastUpdatedOn: number = 0

    beforeAll(async () => {
      await resetDatabase()

      // Create first user: the viewer
      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId: viewerUserId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId: viewerUserId,
          name: 'John Doe',
          familyId: makeFamilyId(),
          personId: makePersonId(),
        })
      )

      const authorUserId = makeAppUserId()
      // Create second user: the thread author
      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId: authorUserId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId: authorUserId,
          name: 'Valentin Cognito',
          familyId: makeFamilyId(),
          personId: makePersonId(),
        })
      )

      const event = UserUpdatedThreadAsRichText({
        userId: authorUserId,
        threadId,
        familyId: makeFamilyId(),
        contentAsJSON: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Coucou' }] }],
        },
      })
      lastUpdatedOn = event.occurredAt.getTime()
      await addToHistory(event)
    })

    it('should return a list without that thread (viewer does not have rights to this family)', async () => {
      const { threads } = await getThreadListPageProps(viewerUserId)

      expect(threads).toHaveLength(0)
    })
  })

  describe('when the user has access to the family of a thread', () => {
    const viewerUserId = makeAppUserId()
    const threadId = makeThreadId()
    const sharedFamily = makeFamilyId()
    const authorUserId = makeAppUserId()
    let lastUpdatedOn: number = 0

    beforeAll(async () => {
      await resetDatabase()

      // Create first user: the viewer
      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId: viewerUserId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId: viewerUserId,
          name: 'John Doe',
          familyId: asFamilyId(viewerUserId),
          personId: makePersonId(),
        })
      )

      // Add viewer to sharedFamily
      await addToHistory(
        UserCreatedNewFamily({
          userId: viewerUserId,
          familyId: sharedFamily,
          shareCode: '' as FamilyShareCode,
          familyName: '',
          about: '',
        })
      )

      // Create second user: the thread author
      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId: authorUserId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId: authorUserId,
          name: 'Valentin Cognito',
          familyId: asFamilyId(authorUserId),
          personId: makePersonId(),
        })
      )

      const event = UserUpdatedThreadAsRichText({
        userId: authorUserId,
        threadId,
        familyId: asFamilyId(authorUserId),
        contentAsJSON: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Coucou' }] }],
        },
      })
      lastUpdatedOn = event.occurredAt.getTime()
      await addToHistory(event)

      // Share event
      await addToHistory(
        ThreadSharedWithFamilies({
          userId: authorUserId,
          threadId,
          familyIds: [sharedFamily, makeFamilyId()],
        })
      )
    })

    it('should return a list with that thread', async () => {
      const { threads } = await getThreadListPageProps(viewerUserId)

      expect(threads).toHaveLength(1)

      expect(threads[0]).toMatchObject({
        threadId,
        title: undefined,
        lastUpdatedOn,
        authors: [
          {
            name: 'Valentin Cognito',
          },
        ],
        contents: 'Coucou',
        thumbnails: [],
        familyIds: [sharedFamily],
      })
    })
  })

  describe('when the thread family sharing changes, excluding the user', () => {
    const viewerUserId = makeAppUserId()
    const threadId = makeThreadId()
    const sharedFamily = makeFamilyId()
    const authorUserId = makeAppUserId()
    let lastUpdatedOn: number = 0

    beforeAll(async () => {
      await resetDatabase()

      // Create first user: the viewer
      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId: viewerUserId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId: viewerUserId,
          name: 'John Doe',
          familyId: asFamilyId(viewerUserId),
          personId: makePersonId(),
        })
      )

      // Add viewer to sharedFamily
      await addToHistory(
        UserCreatedNewFamily({
          userId: viewerUserId,
          familyId: sharedFamily,
          shareCode: '' as FamilyShareCode,
          familyName: '',
          about: '',
        })
      )

      // Create second user: the thread author
      await addToHistory(
        UserRegisteredWithEmailAndPassword({
          userId: authorUserId,
          email: '',
          passwordHash: '',
        })
      )

      await addToHistory(
        UserNamedThemself({
          userId: authorUserId,
          name: 'Valentin Cognito',
          familyId: asFamilyId(authorUserId),
          personId: makePersonId(),
        })
      )

      const event = UserUpdatedThreadAsRichText({
        userId: authorUserId,
        threadId,
        familyId: asFamilyId(authorUserId),
        contentAsJSON: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Coucou' }] }],
        },
      })
      lastUpdatedOn = event.occurredAt.getTime()
      await addToHistory(event)

      // Share event
      await addToHistory(
        ThreadSharedWithFamilies({
          userId: authorUserId,
          threadId,
          familyIds: [sharedFamily, makeFamilyId()],
        })
      )

      // Unshare event
      await addToHistory(
        ThreadSharedWithFamilies({
          userId: authorUserId,
          threadId,
          familyIds: [makeFamilyId()],
        })
      )
    })

    it('should not return the thread in question', async () => {
      const { threads } = await getThreadListPageProps(viewerUserId)

      expect(threads).toHaveLength(0)
    })
  })
})
