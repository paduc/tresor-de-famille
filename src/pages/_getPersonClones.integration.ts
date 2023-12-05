import { resetDatabase } from '../dependencies/__test__/resetDatabase'
import { addToHistory } from '../dependencies/addToHistory'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { makeFaceId } from '../libs/makeFaceId'
import { makeFamilyId } from '../libs/makeFamilyId'
import { makePersonId } from '../libs/makePersonId'
import { makePhotoId } from '../libs/makePhotoId'
import { makeAppUserId } from '../libs/makeUserId'
import { getPersonClones } from './_getPersonClones'
import { PersonClonedForSharing } from './share/PersonClonedForSharing'

describe('getPersonClones', () => {
  describe('when the person is a clone of an original item', () => {
    const clonePersonId = makePersonId()
    const cloneFamilyId = makeFamilyId()
    const originalPersonId = makePersonId()
    const originalFamilyId = makeFamilyId()
    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserNamedPersonInPhoto({
          userId: makeAppUserId(),
          familyId: originalFamilyId,
          personId: originalPersonId,
          photoId: makePhotoId(),
          faceId: makeFaceId(),
          name: '',
        })
      )

      await addToHistory(
        PersonClonedForSharing({
          userId: makeAppUserId(),
          familyId: cloneFamilyId,
          personId: clonePersonId,
          faceId: makeFaceId(),
          name: '',
          clonedFrom: {
            personId: originalPersonId,
            familyId: originalFamilyId,
          },
        })
      )
    })

    it('should return an array with the original and the clone', async () => {
      const res = await getPersonClones({ personId: clonePersonId })

      expect(res).toHaveLength(2)
      expect(res).toContainEqual({ personId: originalPersonId, familyId: originalFamilyId })
      expect(res).toContainEqual({ personId: clonePersonId, familyId: cloneFamilyId })
    })
  })

  describe('when the person is a clone of a clone of a clone of an original item', () => {
    const thirdClone = makePersonId()
    const secondClone = makePersonId()
    const firstClone = makePersonId()
    const originalPersonId = makePersonId()
    const originalFamilyId = makeFamilyId()
    const firstCloneFamilyId = makeFamilyId()
    const secondCloneFamilyId = makeFamilyId()
    const thirdCloneFamilyId = makeFamilyId()
    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserNamedPersonInPhoto({
          userId: makeAppUserId(),
          familyId: originalFamilyId,
          personId: originalPersonId,
          photoId: makePhotoId(),
          faceId: makeFaceId(),
          name: '',
        })
      )

      await addToHistory(
        PersonClonedForSharing({
          userId: makeAppUserId(),
          familyId: firstCloneFamilyId,
          personId: firstClone,
          faceId: makeFaceId(),
          name: '',
          clonedFrom: {
            personId: originalPersonId,
            familyId: originalFamilyId,
          },
        })
      )
      await addToHistory(
        PersonClonedForSharing({
          userId: makeAppUserId(),
          familyId: secondCloneFamilyId,
          personId: secondClone,
          faceId: makeFaceId(),
          name: '',
          clonedFrom: {
            personId: firstClone,
            familyId: firstCloneFamilyId,
          },
        })
      )
      await addToHistory(
        PersonClonedForSharing({
          userId: makeAppUserId(),
          familyId: thirdCloneFamilyId,
          personId: thirdClone,
          faceId: makeFaceId(),
          name: '',
          clonedFrom: {
            personId: secondClone,
            familyId: secondCloneFamilyId,
          },
        })
      )
    })

    it('should return an array with the original, the first clone and second clone', async () => {
      const res = await getPersonClones({ personId: thirdClone })

      expect(res).toHaveLength(4)
      expect(res).toContainEqual({ personId: originalPersonId, familyId: originalFamilyId })
      expect(res).toContainEqual({ personId: firstClone, familyId: firstCloneFamilyId })
      expect(res).toContainEqual({ personId: secondClone, familyId: secondCloneFamilyId })
      expect(res).toContainEqual({ personId: thirdClone, familyId: thirdCloneFamilyId })
    })
  })

  describe('when the person is an original item and has multiple clones', () => {
    const firstClone = makePersonId()
    const firstCloneFamilyId = makeFamilyId()
    const secondClone = makePersonId()
    const secondCloneFamilyId = makeFamilyId()
    const originalPersonId = makePersonId()
    const originalFamilyId = makeFamilyId()
    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserNamedPersonInPhoto({
          userId: makeAppUserId(),
          familyId: originalFamilyId,
          personId: originalPersonId,
          photoId: makePhotoId(),
          faceId: makeFaceId(),
          name: '',
        })
      )

      await addToHistory(
        PersonClonedForSharing({
          userId: makeAppUserId(),
          familyId: firstCloneFamilyId,
          personId: firstClone,
          faceId: makeFaceId(),
          name: '',
          clonedFrom: {
            personId: originalPersonId,
            familyId: originalFamilyId,
          },
        })
      )

      await addToHistory(
        PersonClonedForSharing({
          userId: makeAppUserId(),
          familyId: secondCloneFamilyId,
          personId: secondClone,
          faceId: makeFaceId(),
          name: '',
          clonedFrom: {
            personId: originalPersonId,
            familyId: originalFamilyId,
          },
        })
      )
    })

    it('should return an array with the original and clones', async () => {
      const res = await getPersonClones({ personId: originalPersonId })

      expect(res).toHaveLength(3)
      expect(res).toContainEqual({ personId: originalPersonId, familyId: originalFamilyId })
      expect(res).toContainEqual({ personId: firstClone, familyId: firstCloneFamilyId })
      expect(res).toContainEqual({ personId: secondClone, familyId: secondCloneFamilyId })
    })
  })
})
