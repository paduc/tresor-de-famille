import { resetDatabase } from '../../dependencies/__test__/resetDatabase'
import { addToHistory } from '../../dependencies/addToHistory'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { getUuid } from '../../libs/getUuid'
import { OnboardingUserNamedThemself } from '../bienvenue/step1-userTellsAboutThemselves/OnboardingUserNamedThemself'
import { OnboardingUserUploadedPhotoOfThemself } from '../bienvenue/step1-userTellsAboutThemselves/OnboardingUserUploadedPhotoOfThemself'
import { OnboardingUserConfirmedHisFace } from '../bienvenue/step2-userUploadsPhoto/OnboardingUserConfirmedHisFace'
import { AWSDetectedFacesInPhoto } from '../photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { getHomePageProps } from './getHomePageProps'

describe('getHomePageProps', () => {
  const userId = getUuid()

  describe('get-user-name step', () => {
    describe('before OnboardingUserNamedThemself', () => {
      beforeAll(async () => {
        await resetDatabase()
      })

      it('should return pending state', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps['get-user-name']).toEqual('pending')
      })
    })

    describe('after OnboardingUserNamedThemself', () => {
      const name = 'John Doe'
      const personId = getUuid()
      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          OnboardingUserNamedThemself({
            userId,
            personId,
            name,
          })
        )
      })

      it('should return done state', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps).toMatchObject({ 'get-user-name': 'done', name, personId })
      })
    })
  })

  describe('upload-first-photo step', () => {
    describe('before any event', () => {
      beforeAll(async () => {
        await resetDatabase()
      })

      it('should return pending state', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps['upload-first-photo']).toEqual('pending')
      })
    })

    describe('after OnboardingUserUploadedPhotoOfThemself', () => {
      const photoId = getUuid()
      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          OnboardingUserUploadedPhotoOfThemself({
            uploadedBy: userId,
            photoId,
            location: { type: 'localfile' },
          })
        )
      })

      it('should return photo-uploaded state', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps).toMatchObject({
          'upload-first-photo': 'photo-uploaded',
          photoId,
          photoUrl: getPhotoUrlFromId(photoId),
          faces: [],
        })
      })
    })

    describe('after OnboardingUserUploadedPhotoOfThemself and AWSDetectedFacesInPhoto', () => {
      const photoId = getUuid()
      const faceId = getUuid()
      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          OnboardingUserUploadedPhotoOfThemself({
            uploadedBy: userId,
            photoId,
            location: { type: 'localfile' },
          })
        )
        await addToHistory(
          AWSDetectedFacesInPhoto({
            photoId,
            faces: [
              {
                faceId,
                awsFaceId: '',
                confidence: 0,
                position: {},
              },
            ],
          })
        )
      })

      it('should return photo-uploaded state and faces', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps).toMatchObject({
          'upload-first-photo': 'photo-uploaded',
          photoId,
          photoUrl: getPhotoUrlFromId(photoId),
          faces: [{ faceId }],
        })
      })
    })

    describe('after OnboardingUserConfirmedHisFace', () => {
      const photoId = getUuid()
      const faceId = getUuid()
      const personId = getUuid()
      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          OnboardingUserConfirmedHisFace({
            userId,
            faceId,
            photoId,
            personId,
          })
        )
      })

      it('should return user-face-confirmed', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps).toMatchObject({
          'upload-first-photo': 'user-face-confirmed',
          photoId,
          photoUrl: getPhotoUrlFromId(photoId),
          faceId,
        })
      })
    })
  })
})
