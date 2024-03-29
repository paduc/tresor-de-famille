import { add } from 'date-fns'
import { resetDatabase } from '../../dependencies/__test__/resetDatabase.js'
import { addToHistory } from '../../dependencies/addToHistory.js'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself.js'
import { getUuid } from '../../libs/getUuid.js'
import { makeFamilyId } from '../../libs/makeFamilyId.js'
import { makeMediaId } from '../../libs/makeMediaId.js'
import { makePersonId } from '../../libs/makePersonId.js'
import { makePhotoId } from '../../libs/makePhotoId.js'
import { makeThreadId } from '../../libs/makeThreadId.js'
import { makeAppUserId } from '../../libs/makeUserId.js'
import { UserAddedCaptionToPhoto } from '../photo/UserAddedCaptionToPhoto.js'
import { UserSetPhotoDate } from '../photo/UserSetPhotoDate.js'
import { UserSetPhotoLocation } from '../photo/UserSetPhotoLocation.js'
import { PhotoGPSReverseGeocodedUsingMapbox } from '../photoApi/PhotoGPSReverseGeocodedUsingMapbox.js'
import { UserUploadedPhoto } from '../photoApi/UserUploadedPhoto.js'
import { UserSetCaptionOfPhotoInThread } from './UserSetCaptionOfPhotoInThread.js'
import { UserUpdatedThreadAsRichText } from './UserUpdatedThreadAsRichText.js'
import { getThreadPageProps } from './getThreadPageProps.js'
import { BunnyMediaStatusUpdated } from '../media/BunnyMediaStatusUpdated.js'
import { BunnyMediaUploaded } from '../media/BunnyMediaUploaded.js'
import { UserSetCaptionOfMediaInThread } from './UserSetCaptionOfMediaInThread.js'

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

  describe('when the thread has a MediaNode with a new status', () => {
    const threadId = makeThreadId()
    const mediaId = makeMediaId()
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
                type: 'mediaNode',
                attrs: {
                  mediaId,
                  caption: '',
                  url: 'https://example.com',
                  status: 0,
                },
              },
            ],
          },
        })
      )

      await addToHistory(
        BunnyMediaUploaded({
          bunnyLibraryId: 'libraryId',
          bunnyVideoId: 'videoId',
          mediaId,
          userId,
        })
      )

      await addToHistory(BunnyMediaStatusUpdated({ LibraryId: 'libraryId', VideoId: 'videoId', Status: 1 }))

      await addToHistory(BunnyMediaStatusUpdated({ LibraryId: 'libraryId', VideoId: 'videoId', Status: 4 }))
    })

    it('should return the value in the last BunnyMediaStatusUpdated', async () => {
      const res = await getThreadPageProps({ threadId, userId })

      expect(res.contentAsJSON).toMatchObject({
        type: 'doc',
        content: [
          {
            type: 'mediaNode',
            attrs: {
              mediaId,
              caption: '',
              url: 'https://example.com',
              status: 4, // <---
            },
          },
        ],
      })
    })
  })

  describe('when a media has a UserAddedCaptionToPhoto', () => {
    const threadId = makeThreadId()
    const mediaId = makeMediaId()
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
                type: 'mediaNode',
                attrs: {
                  mediaId,
                  caption: '',
                  url: 'https://example.com',
                  status: 0,
                },
              },
            ],
          },
        })
      )

      await addToHistory(
        BunnyMediaUploaded({
          bunnyLibraryId: 'libraryId',
          bunnyVideoId: 'videoId',
          mediaId,
          userId,
        })
      )
      await addToHistory(
        UserSetCaptionOfMediaInThread({
          mediaId,
          userId,
          threadId,
          caption: 'Well',
        })
      )
      await addToHistory(
        UserSetCaptionOfMediaInThread({
          mediaId,
          userId,
          threadId,
          caption: 'Hello',
        })
      )
    })

    it('should return the value in the UserAddedCaptionToPhoto', async () => {
      const res = await getThreadPageProps({ threadId, userId })

      expect(res.contentAsJSON).toMatchObject({
        type: 'doc',
        content: [
          {
            type: 'mediaNode',
            attrs: {
              mediaId,
              caption: 'Hello',
              status: 0,
              url: 'https://example.com',
            },
          },
        ],
      })
    })
  })
})
