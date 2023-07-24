import { resetDatabase } from '../../dependencies/__test__/resetDatabase'
import { addToHistory } from '../../dependencies/addToHistory'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { getUuid } from '../../libs/getUuid'
import { OnboardingUserNamedThemself } from '../bienvenue/step1-userTellsAboutThemselves/OnboardingUserNamedThemself'
import { OnboardingUserUploadedPhotoOfThemself } from '../bienvenue/step1-userTellsAboutThemselves/OnboardingUserUploadedPhotoOfThemself'
import { OnboardingUserConfirmedHisFace } from '../bienvenue/step2-userUploadsPhoto/OnboardingUserConfirmedHisFace'
import { OnboardingUserUploadedPhotoOfFamily } from '../bienvenue/step2-userUploadsPhoto/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingFaceIgnoredInFamilyPhoto } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingFaceIgnoredInFamilyPhoto'
import { OnboardingUserConfirmedRelationUsingOpenAI } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingUserConfirmedRelationUsingOpenAI'
import { OnboardingUserIgnoredRelationship } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingUserIgnoredRelationship'
import { OnboardingUserNamedPersonInFamilyPhoto } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingUserNamedPersonInFamilyPhoto'
import { OnboardingUserPostedRelationUsingOpenAI } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingUserPostedRelationUsingOpenAI'
import { OnboardingUserRecognizedPersonInFamilyPhoto } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingUserRecognizedPersonInFamilyPhoto'
import { OnboardingUserStartedFirstThread } from '../bienvenue/step4-start-thread/OnboardingUserStartedFirstThread'
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

    describe('after AWSDetectedFacesInPhoto', () => {
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

  describe('upload-family-photo step', () => {
    describe('before any event', () => {
      beforeAll(async () => {
        await resetDatabase()
      })

      it('should return pending state', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps['upload-family-photo']).toEqual('awaiting-upload')
      })
    })

    describe('after OnboardingUserUploadedPhotoOfFamily', () => {
      const photoId = getUuid()
      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          OnboardingUserUploadedPhotoOfFamily({
            uploadedBy: userId,
            photoId,
            location: { type: 'localfile' },
          })
        )
      })

      it('should return annotating-photo state', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps).toMatchObject({
          'upload-family-photo': 'annotating-photo',
          photos: [{ photoId, photoUrl: getPhotoUrlFromId(photoId), faces: [] }],
        })
      })
    })

    describe('after AWSDetectedFacesInPhoto', () => {
      const photoId = getUuid()
      const faceId = getUuid()
      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          OnboardingUserUploadedPhotoOfFamily({
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
          'upload-family-photo': 'annotating-photo',
          photos: [{ photoId, photoUrl: getPhotoUrlFromId(photoId), faces: [{ faceId, stage: 'awaiting-name' }] }],
        })
      })
    })

    describe('after OnboardingFaceIgnoredInFamilyPhoto', () => {
      const photoId = getUuid()
      const faceId = getUuid()
      const personId = getUuid()
      const name = 'Jhon'

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          OnboardingUserUploadedPhotoOfFamily({
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
        await addToHistory(
          OnboardingFaceIgnoredInFamilyPhoto({
            photoId,
            faceId,
            ignoredBy: userId,
          })
        )
      })

      it('should return face in ignored stage', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps).toMatchObject({
          'upload-family-photo': 'annotating-photo',
          photos: [
            {
              photoId,
              photoUrl: getPhotoUrlFromId(photoId),
              faces: [{ faceId, stage: 'ignored' }],
            },
          ],
        })
      })
    })

    describe('after OnboardingUserNamedPersonInFamilyPhoto', () => {
      const photoId = getUuid()
      const faceId = getUuid()
      const personId = getUuid()
      const name = 'Jhon'

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          OnboardingUserUploadedPhotoOfFamily({
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
        await addToHistory(
          OnboardingUserNamedPersonInFamilyPhoto({
            photoId,
            faceId,
            personId,
            userId,
            name,
          })
        )
      })

      it('should return face in awaiting-relationship stage and have name and personId', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps).toMatchObject({
          'upload-family-photo': 'annotating-photo',
          photos: [
            {
              photoId,
              photoUrl: getPhotoUrlFromId(photoId),
              faces: [{ faceId, personId, name, stage: 'awaiting-relationship' }],
            },
          ],
        })
      })
    })

    describe('after OnboardingUserRecognizedPersonInFamilyPhoto', () => {
      const photoId = getUuid()
      const faceId = getUuid()
      const personId = getUuid()
      const name = 'Jhon'

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          OnboardingUserUploadedPhotoOfFamily({
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
        await addToHistory(
          OnboardingUserNamedThemself({
            personId,
            userId,
            name,
          })
        )
        await addToHistory(
          OnboardingUserRecognizedPersonInFamilyPhoto({
            photoId,
            faceId,
            personId,
            userId,
          })
        )
      })

      it('should return face in awaiting-relationship stage and have name and personId', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps).toMatchObject({
          'upload-family-photo': 'annotating-photo',
          photos: [
            {
              photoId,
              photoUrl: getPhotoUrlFromId(photoId),
              faces: [{ faceId, personId, name, stage: 'awaiting-relationship' }],
            },
          ],
        })
      })
    })

    describe('after OnboardingUserIgnoredRelationship', () => {
      const photoId = getUuid()
      const faceId = getUuid()
      const personId = getUuid()
      const name = 'Jhon'

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          OnboardingUserUploadedPhotoOfFamily({
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
        await addToHistory(
          OnboardingUserNamedPersonInFamilyPhoto({
            photoId,
            faceId,
            personId,
            userId,
            name,
          })
        )
        await addToHistory(
          OnboardingUserIgnoredRelationship({
            personId,
            userId,
          })
        )
      })

      it('should return face in done stage and have name and personId but no relationship', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps).toMatchObject({
          'upload-family-photo': 'annotating-photo',
          photos: [
            {
              photoId,
              photoUrl: getPhotoUrlFromId(photoId),
              faces: [{ faceId, personId, name, stage: 'done' }],
            },
          ],
        })
      })
    })

    describe('after OnboardingUserPostedRelationUsingOpenAI', () => {
      const photoId = getUuid()
      const faceId = getUuid()
      const personId = getUuid()
      const name = 'Jhon'

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          OnboardingUserUploadedPhotoOfFamily({
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
        await addToHistory(
          OnboardingUserNamedPersonInFamilyPhoto({
            photoId,
            faceId,
            personId,
            userId,
            name,
          })
        )
        await addToHistory(
          OnboardingUserPostedRelationUsingOpenAI({
            personId,
            userId,
            messages: [],
            userAnswer: 'my mothers sister',
            relationship: { relationship: 'aunt', side: 'maternal' },
          })
        )
      })

      it('should return face in awaiting-relationship-confirmation stage and include the relationship deduced by openAI', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps).toMatchObject({
          'upload-family-photo': 'annotating-photo',
          photos: [
            {
              photoId,
              photoUrl: getPhotoUrlFromId(photoId),
              faces: [
                {
                  faceId,
                  personId,
                  name,
                  stage: 'awaiting-relationship-confirmation',
                  messages: [],
                  userAnswer: 'my mothers sister',
                  relationship: { relationship: 'aunt', side: 'maternal' },
                },
              ],
            },
          ],
        })
      })
    })

    describe('after OnboardingUserConfirmedRelationUsingOpenAI', () => {
      const photoId = getUuid()
      const faceId = getUuid()
      const personId = getUuid()
      const name = 'Jhon'

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          OnboardingUserUploadedPhotoOfFamily({
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
        await addToHistory(
          OnboardingUserNamedPersonInFamilyPhoto({
            photoId,
            faceId,
            personId,
            userId,
            name,
          })
        )
        await addToHistory(
          OnboardingUserPostedRelationUsingOpenAI({
            personId,
            userId,
            messages: [],
            userAnswer: 'my mothers sister',
            relationship: { relationship: 'aunt', side: 'maternal' },
          })
        )
        await addToHistory(
          OnboardingUserConfirmedRelationUsingOpenAI({
            personId,
            userId,
            relationship: { relationship: 'aunt', side: 'maternal' },
          })
        )
      })

      it('should return face in done stage and include the confirmed relationship', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps).toMatchObject({
          'upload-family-photo': 'annotating-photo',
          photos: [
            {
              photoId,
              photoUrl: getPhotoUrlFromId(photoId),
              faces: [
                {
                  faceId,
                  personId,
                  name,
                  stage: 'done',
                  relationship: { relationship: 'aunt', side: 'maternal' },
                },
              ],
            },
          ],
        })
      })
    })

    describe('if we know this face from elsewhere', () => {
      const photoId = getUuid()
      const faceId = getUuid()
      const personId = getUuid()
      const name = 'Jhon'

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          OnboardingUserNamedThemself({
            userId,
            personId,
            name,
          })
        )

        await addToHistory(
          OnboardingUserUploadedPhotoOfFamily({
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

        await addToHistory(
          OnboardingUserConfirmedHisFace({
            userId,
            faceId,
            photoId,
            personId,
          })
        )
      })

      it('should return face in done stage but not include relationship yet (todo)', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps).toMatchObject({
          'upload-family-photo': 'annotating-photo',
          photos: [
            {
              photoId,
              photoUrl: getPhotoUrlFromId(photoId),
              faces: [
                {
                  faceId,
                  personId,
                  name,
                  stage: 'done',
                },
              ],
            },
          ],
        })
      })
    })

    describe('when there are multiple photos', () => {
      const photoId = getUuid()
      const photoIdBis = getUuid()
      const faceId = getUuid()
      const faceIdBis = getUuid()
      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          OnboardingUserUploadedPhotoOfFamily({
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
        await addToHistory(
          OnboardingUserUploadedPhotoOfFamily({
            uploadedBy: userId,
            photoId: photoIdBis,
            location: { type: 'localfile' },
          })
        )
        await addToHistory(
          AWSDetectedFacesInPhoto({
            photoId: photoIdBis,
            faces: [
              {
                faceId: faceIdBis,
                awsFaceId: '',
                confidence: 0,
                position: {},
              },
            ],
          })
        )
      })

      it('should return an array of photos', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps).toMatchObject({
          'upload-family-photo': 'annotating-photo',
          photos: [
            { photoId, photoUrl: getPhotoUrlFromId(photoId), faces: [{ faceId, stage: 'awaiting-name' }] },
            {
              photoId: photoIdBis,
              photoUrl: getPhotoUrlFromId(photoIdBis),
              faces: [{ faceId: faceIdBis, stage: 'awaiting-name' }],
            },
          ],
        })
      })
    })
  })

  describe('create-first-thread step', () => {
    describe('before OnboardingUserStartedFirstThread', () => {
      beforeAll(async () => {
        await resetDatabase()
      })

      it('should return awaiting-input state', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps['create-first-thread']).toEqual('awaiting-input')
      })
    })

    describe('after OnboardingUserStartedFirstThread', () => {
      const threadId = getUuid()
      const message = 'This is my first thread'
      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          OnboardingUserStartedFirstThread({
            userId,
            threadId,
            message,
          })
        )
      })

      it('should return thread-written state', async () => {
        const { steps } = await getHomePageProps(userId)
        expect(steps).toMatchObject({ 'create-first-thread': 'thread-written', threadId, message })
      })
    })
  })
})
