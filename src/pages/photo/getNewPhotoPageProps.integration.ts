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
import { PhotoGPSReverseGeocodedUsingMapbox } from '../photoApi/PhotoGPSReverseGeocodedUsingMapbox'
import { UserUploadedPhoto } from '../photoApi/UserUploadedPhoto'
import { ThreadSharedWithFamilies } from '../thread/ThreadPage/ThreadSharedWithFamilies'
import { UserUpdatedThreadAsRichText } from '../thread/UserUpdatedThreadAsRichText'
import { UserSetPhotoDate } from './UserSetPhotoDate'
import { UserSetPhotoLocation } from './UserSetPhotoLocation'
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

  describe('when a photo has a location thanks to PhotoGPSReverseGeocodedUsingMapbox', () => {
    const userId = makeAppUserId()

    const targetPhotoId = makePhotoId()
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

      await addToHistory(
        PhotoGPSReverseGeocodedUsingMapbox({
          photoId: targetPhotoId,
          geocodeApiVersion: '5',
          geocode: {
            features: [{ place_name: 'Maison de mère-grand, Fin fond de la forêt, Pays enchanté' }],
          } as PhotoGPSReverseGeocodedUsingMapbox['payload']['geocode'],
        })
      )
    })

    it('should return that location', async () => {
      const res = await getNewPhotoPageProps({ photoId: targetPhotoId, userId })
      expect(res.location).toMatchObject({
        isIrrelevant: false,
        GPSCoords: {
          exif: undefined,
          userOption: 'none',
        },
        name: {
          userProvided: '',
          mapbox: {
            exif: 'Maison de mère-grand, Fin fond de la forêt, Pays enchanté',
          },
          userOption: 'mapboxFromExif',
        },
      })
    })
  })

  describe('when a photo has a location thanks to UserSetPhotoLocation', () => {
    const userId = makeAppUserId()

    const targetPhotoId = makePhotoId()
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

      await addToHistory(
        UserSetPhotoLocation({
          photoId: targetPhotoId,
          userId,
          isIrrelevant: false,
          gpsOption: 'none',
          name: {
            option: 'user',
            locationName: 'My house, in the middle of the street',
          },
        })
      )
    })

    it('should return that location', async () => {
      const res = await getNewPhotoPageProps({ photoId: targetPhotoId, userId })
      expect(res.location).toMatchObject({
        isIrrelevant: false,
        GPSCoords: {
          exif: undefined,
          userOption: 'none',
        },
        name: {
          userProvided: 'My house, in the middle of the street',
          mapbox: {
            exif: undefined,
          },
          userOption: 'user',
        },
      })
    })
  })

  describe('when a photo has a UserSetPhotoLocation that sets the location as irrelevant', () => {
    const userId = makeAppUserId()

    const targetPhotoId = makePhotoId()
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

      await addToHistory(
        UserSetPhotoLocation({
          photoId: targetPhotoId,
          userId,
          isIrrelevant: true,
        })
      )
    })

    it('should return that location', async () => {
      const res = await getNewPhotoPageProps({ photoId: targetPhotoId, userId })
      expect(res.location).toMatchObject({
        isIrrelevant: true,
        GPSCoords: {
          exif: undefined,
          userOption: 'none',
        },
        name: {
          userProvided: undefined,
          mapbox: {
            exif: undefined,
          },
          userOption: 'none',
        },
      })
    })
  })

  describe('when a photo has a multiple location events', () => {
    const userId = makeAppUserId()

    const targetPhotoId = makePhotoId()
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
          exif: {
            GPSLongitude: [1, 32, 22.5],
            GPSLongitudeRef: 'W', // N W E S
            GPSLatitude: [46, 14, 37.34],
            GPSLatitudeRef: 'N',
          },
        })
      )

      await addToHistory(
        PhotoGPSReverseGeocodedUsingMapbox({
          photoId: targetPhotoId,
          geocodeApiVersion: '5',
          geocode: {
            features: [{ place_name: 'Maison de mère-grand, Fin fond de la forêt, Pays enchanté' }],
          } as PhotoGPSReverseGeocodedUsingMapbox['payload']['geocode'],
        })
      )

      await addToHistory(
        UserSetPhotoLocation({
          photoId: targetPhotoId,
          userId,
          isIrrelevant: false,
          gpsOption: 'exif',
          name: {
            option: 'user',
            locationName: 'My house',
          },
        })
      )

      await addToHistory(
        UserSetPhotoLocation({
          photoId: targetPhotoId,
          userId,
          isIrrelevant: false,
          gpsOption: 'none',
          name: {
            option: 'user',
            locationName: 'My house, in the middle of the street',
          },
        })
      )

      await addToHistory(
        UserSetPhotoLocation({
          photoId: targetPhotoId,
          userId,
          isIrrelevant: true,
        })
      )
    })

    it('should return a combination of the latest info', async () => {
      const res = await getNewPhotoPageProps({ photoId: targetPhotoId, userId })
      expect(res.location).toMatchObject({
        isIrrelevant: true,
        GPSCoords: {
          exif: { lat: 46.24370555555556, long: -1.5395833333333333 },
          userOption: 'none',
        },
        name: {
          userProvided: 'My house, in the middle of the street',
          mapbox: {
            exif: 'Maison de mère-grand, Fin fond de la forêt, Pays enchanté',
          },
          userOption: 'user',
        },
      })
    })
  })

  describe('when a photo has a datetime in EXIF', () => {
    const userId = makeAppUserId()

    const targetPhotoId = makePhotoId()
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
          exif: {
            DateTimeOriginal: '2022:04:20 19:25:41',
          },
        })
      )
    })

    it('should return that datetime', async () => {
      const res = await getNewPhotoPageProps({ photoId: targetPhotoId, userId })
      expect(res.datetime).toMatchObject({
        userOption: 'exif',
        userProvided: undefined,
        exifDatetime: '2022-04-20T17:25:41.000Z',
      })
    })
  })

  describe('when a photo has a datetime provided by the user', () => {
    const userId = makeAppUserId()

    const targetPhotoId = makePhotoId()
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
          exif: {
            DateTimeOriginal: '2022:04:20 19:25:41',
          },
        })
      )

      await addToHistory(UserSetPhotoDate({ userId, photoId: targetPhotoId, dateOption: 'user', dateAsText: 'Avril 1986' }))
    })

    it('should return that datetime', async () => {
      const res = await getNewPhotoPageProps({ photoId: targetPhotoId, userId })
      expect(res.datetime).toMatchObject({
        userOption: 'user',
        userProvided: 'Avril 1986',
        exifDatetime: '2022-04-20T17:25:41.000Z',
      })
    })
  })

  describe('when a photo has a datetime disabled by user', () => {
    const userId = makeAppUserId()

    const targetPhotoId = makePhotoId()
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
          exif: {
            DateTimeOriginal: '2022:04:20 19:25:41',
          },
        })
      )

      await addToHistory(UserSetPhotoDate({ userId, photoId: targetPhotoId, dateOption: 'user', dateAsText: 'Avril 1986' }))

      await addToHistory(UserSetPhotoDate({ userId, photoId: targetPhotoId, dateOption: 'none' }))
    })

    it('should return that datetime', async () => {
      const res = await getNewPhotoPageProps({ photoId: targetPhotoId, userId })
      expect(res.datetime).toMatchObject({
        userOption: 'none',
        userProvided: 'Avril 1986',
        exifDatetime: '2022-04-20T17:25:41.000Z',
      })
    })
  })
  describe('when a photo has no datetime ', () => {
    const userId = makeAppUserId()

    const targetPhotoId = makePhotoId()
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
          exif: undefined,
        })
      )
    })

    it('should return no datetime', async () => {
      const res = await getNewPhotoPageProps({ photoId: targetPhotoId, userId })
      expect(res.datetime).toMatchObject({
        userOption: 'none',
        userProvided: undefined,
        exifDatetime: undefined,
      })
    })
  })
})
