import { resetDatabase } from '../../dependencies/__test__/resetDatabase'
import { addToHistory } from '../../dependencies/addToHistory'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself'
import { getUuid } from '../../libs/getUuid'
import { makeFamilyId } from '../../libs/makeFamilyId'
import { makePersonId } from '../../libs/makePersonId'
import { makePhotoId } from '../../libs/makePhotoId'
import { makeThreadId } from '../../libs/makeThreadId'
import { makeAppUserId } from '../../libs/makeUserId'
import { UserAddedCaptionToPhoto } from '../photo/UserAddedCaptionToPhoto'
import { UserSetPhotoDate } from '../photo/UserSetPhotoDate'
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

  describe('when a photo has a datetime thanks to UserSetPhotoDate', () => {
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
        UserSetPhotoDate({
          photoId,
          userId,
          dateAsText: 'Le jour de mon anniversaire',
          dateOption: 'user',
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
              datetime: {
                userOption: 'user',
                userProvided: 'Le jour de mon anniversaire',
                exifDatetime: undefined,
              },
            },
          },
        ],
      })
    })
  })

  describe('when the thread has an author', () => {
    const threadId = makeThreadId()
    const userId = makeAppUserId()
    const personId = makePersonId()
    const familyId = makeFamilyId()
    beforeAll(async () => {
      await resetDatabase()

      await addToHistory(UserNamedThemself({ userId, name: 'Toto', personId, familyId }))

      await addToHistory(
        UserUpdatedThreadAsRichText({
          userId,
          threadId,
          familyId: makeFamilyId(),
          contentAsJSON: {
            type: 'doc',
            content: [],
          },
        })
      )
    })

    it('should add the authorName', async () => {
      const res = await getThreadPageProps({ threadId, userId })

      expect(res.authorName).toEqual('Toto')
    })
  })
})
