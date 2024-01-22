import { resetDatabase } from '../../dependencies/__test__/resetDatabase'
import { addToHistory } from '../../dependencies/addToHistory'
import { UserConfirmedHisFace } from '../../events/onboarding/UserConfirmedHisFace'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../../events/onboarding/UserRecognizedPersonInPhoto'
import { makeFaceId } from '../../libs/makeFaceId'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { makePersonId } from '../../libs/makePersonId'
import { makePhotoId } from '../../libs/makePhotoId'
import { makeAppUserId } from '../../libs/makeUserId'
import { asFamilyId } from '../../libs/typeguards'
import { PhotoManuallyAnnotated } from '../photo/annotateManually/PhotoManuallyAnnotated'
import { AWSDetectedFacesInPhoto } from '../photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { UserDeletedPhoto } from '../photoApi/UserDeletedPhoto'
import { PhotoLocation, UserUploadedPhoto } from '../photoApi/UserUploadedPhoto'
import { getPersonPageProps } from './getPersonPageProps'

describe('getPersonPageProps', () => {
  describe('when the person was tagged in a photo that was uploaded by the user', () => {
    const userId = makeAppUserId()
    const photoId1 = makePhotoId()
    const photoId2 = makePhotoId()
    const photoId3 = makePhotoId()
    const photoId4 = makePhotoId()
    const faceId1 = makeFaceId()
    const faceId2 = makeFaceId()
    const faceId3 = makeFaceId()
    const faceId4 = makeFaceId()
    const personId = makePersonId()

    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserUploadedPhoto({
          location: {} as PhotoLocation,
          photoId: photoId1,
          userId,
        })
      )
      await addToHistory(
        UserUploadedPhoto({
          location: {} as PhotoLocation,
          photoId: photoId2,
          userId,
        })
      )
      await addToHistory(
        UserUploadedPhoto({
          location: {} as PhotoLocation,
          photoId: photoId3,
          userId,
        })
      )
      await addToHistory(
        UserUploadedPhoto({
          location: {} as PhotoLocation,
          photoId: photoId4,
          userId,
        })
      )

      await addToHistory(
        PhotoManuallyAnnotated({
          personId,
          faceId: faceId1,
          photoId: photoId1,
          userId,
          familyId: asFamilyId(userId),
          position: {} as PhotoManuallyAnnotated['payload']['position'],
        })
      )

      await addToHistory(
        UserRecognizedPersonInPhoto({
          personId,
          faceId: faceId2,
          photoId: photoId2,
          userId,
        })
      )
      await addToHistory(
        UserNamedPersonInPhoto({
          personId,
          faceId: faceId3,
          familyId: asFamilyId(userId),
          name: '',
          photoId: photoId3,
          userId,
        })
      )
      await addToHistory(
        UserConfirmedHisFace({
          personId,
          familyId: asFamilyId(userId),
          faceId: faceId4,
          photoId: photoId4,
          userId,
        })
      )

      // Add another person
      await addToHistory(
        UserRecognizedPersonInPhoto({
          personId: makePersonId(),
          faceId: makeFaceId(),
          photoId: photoId2,
          userId,
        })
      )
    })

    it('should return photos', async () => {
      const res = await getPersonPageProps({ personId, userId })

      expect(res.photos).toHaveLength(4)
      expect(res.photos[0]).toMatchObject({ photoId: photoId1 })
      expect(res.photos[1]).toMatchObject({ photoId: photoId2 })
      expect(res.photos[2]).toMatchObject({ photoId: photoId3 })
      expect(res.photos[3]).toMatchObject({ photoId: photoId4 })
    })

    it('should all face/photo couple as alternateProfilePics', async () => {
      const res = await getPersonPageProps({ personId, userId })

      expect(res.alternateProfilePics).toHaveLength(4)
      expect(res.alternateProfilePics[0]).toMatchObject({ photoId: photoId1, faceId: faceId1 })
      expect(res.alternateProfilePics[1]).toMatchObject({ photoId: photoId2, faceId: faceId2 })
      expect(res.alternateProfilePics[2]).toMatchObject({ photoId: photoId3, faceId: faceId3 })
      expect(res.alternateProfilePics[3]).toMatchObject({ photoId: photoId4, faceId: faceId4 })
    })
  })

  describe('when the person was tagged in a photo that someone else uploaded', () => {
    const userId = makeAppUserId()
    const photoId = makePhotoId()
    const faceId = makeFaceId()
    const personId = makePersonId()

    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserUploadedPhoto({
          location: {} as PhotoLocation,
          photoId,
          userId: makeAppUserId(),
        })
      )

      await addToHistory(
        PhotoManuallyAnnotated({
          personId,
          faceId,
          photoId,
          userId: makeAppUserId(),
          familyId: makeFamilyId(),
          position: {} as PhotoManuallyAnnotated['payload']['position'],
        })
      )

      await addToHistory(
        UserRecognizedPersonInPhoto({
          personId,
          faceId,
          photoId,
          userId: makeAppUserId(),
        })
      )
      await addToHistory(
        UserNamedPersonInPhoto({
          personId,
          faceId,
          familyId: makeFamilyId(),
          name: '',
          photoId,
          userId: makeAppUserId(),
        })
      )
      await addToHistory(
        UserConfirmedHisFace({
          personId,
          familyId: makeFamilyId(),
          faceId,
          photoId,
          userId: makeAppUserId(),
        })
      )
    })

    it('should not return photo', async () => {
      const res = await getPersonPageProps({ personId, userId })

      expect(res.photos).toHaveLength(0)
    })

    it('should not return alternativeProfilePics', async () => {
      const res = await getPersonPageProps({ personId, userId })

      expect(res.alternateProfilePics).toHaveLength(0)
    })
  })

  describe('when one of the persons faces has been auto-detected by Rekognition', () => {
    const photoId = makePhotoId()
    const userId = makeAppUserId()
    const personId = makePersonId()
    const faceId = makeFaceId()

    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserUploadedPhoto({
          location: {} as PhotoLocation,
          photoId,
          userId,
        })
      )

      // The face and person were linked by someone else in another photo
      await addToHistory(
        UserRecognizedPersonInPhoto({
          personId,
          faceId,
          photoId: makePhotoId(),
          userId: makeAppUserId(),
        })
      )

      // Rekognition returned this face in photo (indirect person-face link)
      await addToHistory(
        AWSDetectedFacesInPhoto({
          photoId,
          faces: [
            { awsFaceId: '', faceId, confidence: 0, position: {} },
            // Add another face that should not be returned
            { awsFaceId: '', faceId: makeFaceId(), confidence: 0, position: {} },
          ],
        })
      )
    })

    it('should return photo', async () => {
      const res = await getPersonPageProps({ personId, userId })

      expect(res.photos).toHaveLength(1)
      expect(res.photos[0]).toMatchObject({ photoId })
    })

    it('should return the photo/face as alternativeProfilePics', async () => {
      const res = await getPersonPageProps({ personId, userId })

      expect(res.alternateProfilePics).toHaveLength(1)
      expect(res.alternateProfilePics[0]).toMatchObject({ photoId, faceId })
    })
  })

  describe('when the person was tagged for a face in a photo but then that face was corrected with another person', () => {
    const userId = makeAppUserId()
    const photoId = makePhotoId()
    const faceId = makeFaceId()
    const personId = makePersonId()

    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserUploadedPhoto({
          location: {} as PhotoLocation,
          photoId,
          userId,
        })
      )

      await addToHistory(
        UserRecognizedPersonInPhoto({
          personId,
          faceId,
          photoId,
          userId,
        })
      )

      // The correction to another person
      await addToHistory(
        UserRecognizedPersonInPhoto({
          personId: makePersonId(),
          faceId,
          photoId,
          userId,
        })
      )
    })

    it('should not return photo', async () => {
      const res = await getPersonPageProps({ personId, userId })

      expect(res.photos).toHaveLength(0)
    })

    it('should not return alternativeProfilePics', async () => {
      const res = await getPersonPageProps({ personId, userId })

      expect(res.alternateProfilePics).toHaveLength(0)
    })
  })

  describe('when the person was tagged in a delete photo', () => {
    const userId = makeAppUserId()
    const photoId = makePhotoId()
    const faceId = makeFaceId()
    const personId = makePersonId()

    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserUploadedPhoto({
          location: {} as PhotoLocation,
          photoId,
          userId,
        })
      )

      await addToHistory(
        UserRecognizedPersonInPhoto({
          personId,
          faceId,
          photoId,
          userId,
        })
      )

      await addToHistory(
        UserDeletedPhoto({
          photoId,
          userId,
        })
      )
    })

    it('should not return photo', async () => {
      const res = await getPersonPageProps({ personId, userId })

      expect(res.photos).toHaveLength(0)
    })

    it('should not return alternativeProfilePics', async () => {
      const res = await getPersonPageProps({ personId, userId })

      expect(res.alternateProfilePics).toHaveLength(0)
    })
  })

  describe('when the person was tagged multiple times in a photo', () => {
    const userId = makeAppUserId()
    const photoId = makePhotoId()
    const faceId1 = makeFaceId()
    const faceId2 = makeFaceId()
    const personId = makePersonId()

    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserUploadedPhoto({
          location: {} as PhotoLocation,
          photoId,
          userId,
        })
      )

      await addToHistory(
        UserRecognizedPersonInPhoto({
          personId,
          faceId: faceId1,
          photoId,
          userId,
        })
      )

      await addToHistory(
        UserRecognizedPersonInPhoto({
          personId,
          faceId: faceId2,
          photoId,
          userId,
        })
      )
    })

    it('should return photos', async () => {
      const res = await getPersonPageProps({ personId, userId })

      expect(res.photos).toHaveLength(1)
      expect(res.photos[0]).toMatchObject({ photoId })
    })

    it('should add both face/photo couples as alternateProfilePics', async () => {
      const res = await getPersonPageProps({ personId, userId })

      expect(res.alternateProfilePics).toHaveLength(2)
      expect(res.alternateProfilePics[0]).toMatchObject({ photoId, faceId: faceId1 })
      expect(res.alternateProfilePics[1]).toMatchObject({ photoId, faceId: faceId2 })
    })
  })

  describe('when the person was auto recognized times in a photo', () => {
    const userId = makeAppUserId()
    const photoId = makePhotoId()
    const faceId1 = makeFaceId()
    const faceId2 = makeFaceId()
    const personId = makePersonId()

    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserUploadedPhoto({
          location: {} as PhotoLocation,
          photoId,
          userId,
        })
      )

      await addToHistory(
        UserRecognizedPersonInPhoto({
          personId,
          faceId: faceId1,
          photoId,
          userId: makeAppUserId(),
        })
      )

      await addToHistory(
        UserRecognizedPersonInPhoto({
          personId,
          faceId: faceId2,
          photoId,
          userId: makeAppUserId(),
        })
      )

      await addToHistory(
        AWSDetectedFacesInPhoto({
          photoId,
          faces: [
            { awsFaceId: '', faceId: faceId1, confidence: 0, position: {} },
            { awsFaceId: '', faceId: faceId2, confidence: 0, position: {} },
          ],
        })
      )
    })

    it('should return photos', async () => {
      const res = await getPersonPageProps({ personId, userId })

      expect(res.photos).toHaveLength(1)
      expect(res.photos[0]).toMatchObject({ photoId })
    })

    it('should add both face/photo couples as alternateProfilePics', async () => {
      const res = await getPersonPageProps({ personId, userId })

      expect(res.alternateProfilePics).toHaveLength(2)
      expect(res.alternateProfilePics[0]).toMatchObject({ photoId, faceId: faceId1 })
      expect(res.alternateProfilePics[1]).toMatchObject({ photoId, faceId: faceId2 })
    })
  })
})
