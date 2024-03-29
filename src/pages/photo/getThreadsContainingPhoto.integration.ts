import { resetDatabase } from '../../dependencies/__test__/resetDatabase.js'
import { addToHistory } from '../../dependencies/addToHistory.js'
import { makeFamilyId } from '../../libs/makeFamilyId.js'
import { makePhotoId } from '../../libs/makePhotoId.js'
import { makeThreadId } from '../../libs/makeThreadId.js'
import { makeAppUserId } from '../../libs/makeUserId.js'
import { UserUpdatedThreadAsRichText } from '../thread/UserUpdatedThreadAsRichText.js'
import { getThreadsContainingPhoto } from './getThreadsContainingPhoto.js'

describe('getThreadsContainingPhoto', () => {
  const targetPhotoId = makePhotoId()
  const targetThreadId = makeThreadId()
  beforeAll(async () => {
    await resetDatabase()

    await addToHistory(
      UserUpdatedThreadAsRichText({
        userId: makeAppUserId(),
        threadId: targetThreadId,
        contentAsJSON: {
          type: 'doc',
          content: [{ type: 'photoNode', attrs: { photoId: targetPhotoId } }],
        },
        familyId: makeFamilyId(),
      })
    )

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
  })

  it('should return the threadId that contains the photo', async () => {
    const res = await getThreadsContainingPhoto({ photoId: targetPhotoId })

    expect(res).toHaveLength(1)
    expect(res[0]).toEqual(targetThreadId)
  })
})
