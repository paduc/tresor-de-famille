import { resetDatabase } from '../../dependencies/__test__/resetDatabase'
import { addToHistory } from '../../dependencies/addToHistory'
import { getUuid } from '../../libs/getUuid'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { makePhotoId } from '../../libs/makePhotoId'
import { makeThreadId } from '../../libs/makeThreadId'
import { makeAppUserId } from '../../libs/makeUserId'
import { UserAddedCaptionToPhoto } from '../photo/UserAddedCaptionToPhoto'
import { UserSetPhotoLocation } from '../photo/UserSetPhotoLocation'
import { PhotoGPSReverseGeocodedUsingMapbox } from '../photoApi/PhotoGPSReverseGeocodedUsingMapbox'
import { UserUploadedPhoto } from '../photoApi/UserUploadedPhoto'
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

  describe('when a photo has a location thanks to PhotoGPSReverseGeocodedUsingMapbox', () => {
    const threadId = makeThreadId()
    const photoId = makePhotoId()
    const userId = makeAppUserId()
    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserUploadedPhoto({
          userId,
          photoId,
          location: {} as UserUploadedPhoto['payload']['location'],
          exif: {
            GPSLongitude: [1, 32, 22.5],
            GPSLongitudeRef: 'W', // N W E S
            GPSLatitude: [46, 14, 37.34],
            GPSLatitudeRef: 'N',
          },
        })
      )

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
        PhotoGPSReverseGeocodedUsingMapbox({
          photoId,
          geocodeApiVersion: '5',
          geocode: {
            features: [{ place_name: 'Maison de mère-grand' }],
          } as PhotoGPSReverseGeocodedUsingMapbox['payload']['geocode'],
        })
      )
    })

    it('should add the locationName to the photo attributes', async () => {
      const res = await getThreadPageProps({ threadId, userId })

      expect(res.contentAsJSON).toMatchObject({
        type: 'doc',
        content: [
          {
            type: 'photoNode',
            attrs: {
              photoId,
              locationName: 'Maison de mère-grand',
            },
          },
        ],
      })
    })
  })

  describe('when a photo has a location thanks to UserSetPhotoLocation', () => {
    const threadId = makeThreadId()
    const photoId = makePhotoId()
    const userId = makeAppUserId()
    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(
        UserUploadedPhoto({
          userId,
          photoId,
          location: {} as UserUploadedPhoto['payload']['location'],
          exif: undefined,
        })
      )

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
        UserSetPhotoLocation({
          photoId,
          gpsOption: 'none',
          name: {
            option: 'user',
            locationName: 'Maison de grand-père',
          },
          isIrrelevant: false,
          userId,
        })
      )
    })

    it('should add the locationName to the photo attributes', async () => {
      const res = await getThreadPageProps({ threadId, userId })

      expect(res.contentAsJSON).toMatchObject({
        type: 'doc',
        content: [
          {
            type: 'photoNode',
            attrs: {
              photoId,
              locationName: 'Maison de grand-père',
            },
          },
        ],
      })
    })
  })
})
