import { resetDatabase } from '../dependencies/__test__/resetDatabase'
import { addToHistory } from '../dependencies/addToHistory'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'
import { makeFaceId } from '../libs/makeFaceId'
import { makeFamilyId } from '../libs/makeFamilyId'
import { makePersonId } from '../libs/makePersonId'
import { makePhotoId } from '../libs/makePhotoId'
import { makeAppUserId } from '../libs/makeUserId'
import { getPersonForUserForFamily } from './_getPersonForUserForFamily'
import { PersonClonedForSharing } from './share/PersonClonedForSharing'

describe('getPersonForUserForFamily', () => {
  const userId = makeAppUserId()

  describe('when there is a person and in the correct family', () => {
    const originalPersonId = makePersonId()
    const originalFamilyId = makeFamilyId()
    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserNamedThemself({
          userId: userId,
          familyId: originalFamilyId,
          personId: originalPersonId,
          name: 'John',
        })
      )
    })

    it('should return the original person id and name', async () => {
      const res = await getPersonForUserForFamily({ userId, familyId: originalFamilyId })

      expect(res).toMatchObject({ personId: originalPersonId, name: 'John' })
    })
  })

  describe('when the person exists in the family', () => {
    const firstCloneId = makePersonId()
    const originalPersonId = makePersonId()
    const originalFamilyId = makeFamilyId()
    const firstCloneFamilyId = makeFamilyId()
    const cloneName = 'John Doe'

    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserNamedThemself({
          userId,
          familyId: originalFamilyId,
          personId: originalPersonId,
          name: 'John',
        })
      )

      await addToHistory(
        PersonClonedForSharing({
          userId: makeAppUserId(),
          familyId: firstCloneFamilyId,
          personId: firstCloneId,
          faceId: makeFaceId(),
          name: cloneName,
          clonedFrom: {
            personId: originalPersonId,
            familyId: originalFamilyId,
          },
        })
      )
    })

    it('should return the personId and the name of the person in the family', async () => {
      const res = await getPersonForUserForFamily({ userId, familyId: firstCloneFamilyId })

      expect(res).toMatchObject({ personId: firstCloneId, name: cloneName })
    })
  })

  describe('when the person is not in the family', () => {
    const firstCloneId = makePersonId()
    const originalPersonId = makePersonId()
    const originalFamilyId = makeFamilyId()
    const firstCloneFamilyId = makeFamilyId()
    const cloneName = 'John Doe'

    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserNamedThemself({
          userId,
          familyId: originalFamilyId,
          personId: originalPersonId,
          name: 'John',
        })
      )

      await addToHistory(
        PersonClonedForSharing({
          userId: makeAppUserId(),
          familyId: firstCloneFamilyId,
          personId: firstCloneId,
          faceId: makeFaceId(),
          name: cloneName,
          clonedFrom: {
            personId: originalPersonId,
            familyId: originalFamilyId,
          },
        })
      )
    })

    it('should return null', async () => {
      const res = await getPersonForUserForFamily({ userId, familyId: makeFamilyId() })

      expect(res).toBeNull()
    })
  })
})
