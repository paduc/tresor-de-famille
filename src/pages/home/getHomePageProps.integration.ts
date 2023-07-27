import { resetDatabase } from '../../dependencies/__test__/resetDatabase'
import { addToHistory } from '../../dependencies/addToHistory'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { getUuid } from '../../libs/getUuid'
import { UserNamedThemself } from '../bienvenue/step1-userTellsAboutThemselves/UserNamedThemself'
import { OnboardingUserUploadedPhotoOfThemself } from '../bienvenue/step1-userTellsAboutThemselves/OnboardingUserUploadedPhotoOfThemself'
import { UserConfirmedHisFace } from '../bienvenue/step2-userUploadsPhoto/UserConfirmedHisFace'
import { OnboardingUserUploadedPhotoOfFamily } from '../bienvenue/step2-userUploadsPhoto/OnboardingUserUploadedPhotoOfFamily'
import { BeneficiariesChosen } from '../bienvenue/step3-learnAboutUsersFamily/BeneficiariesChosen'
import { FaceIgnoredInPhoto } from '../bienvenue/step3-learnAboutUsersFamily/FaceIgnoredInPhoto'
import { OnboardingFamilyMemberAnnotationIsDone } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingFamilyMemberAnnotationIsDone'
import { OnboardingReadyForBeneficiaries } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingReadyForBeneficiaries'
import { UserConfirmedRelationUsingOpenAI } from '../bienvenue/step3-learnAboutUsersFamily/UserConfirmedRelationUsingOpenAI'
import { UserIgnoredRelationship } from '../bienvenue/step3-learnAboutUsersFamily/UserIgnoredRelationship'
import { UserNamedPersonInPhoto } from '../bienvenue/step3-learnAboutUsersFamily/UserNamedPersonInPhoto'
import { UserPostedRelationUsingOpenAI } from '../bienvenue/step3-learnAboutUsersFamily/UserPostedRelationUsingOpenAI'
import { OnboardingUserStartedFirstThread } from '../bienvenue/step4-start-thread/OnboardingUserStartedFirstThread'
import { AWSDetectedFacesInPhoto } from '../photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { RELATIONSHIPS_ENABLED, getHomePageProps } from './getHomePageProps'
import { UUID } from '../../domain'
import { HomePageProps } from './HomePage'
import { UserRecognizedPersonInPhoto } from '../bienvenue/step3-learnAboutUsersFamily/UserRecognizedPersonInPhoto'

const getHomePagePropsOnboarding = async (userId: UUID): Promise<HomePageProps & { isOnboarding: true }> => {
  const props = await getHomePageProps(userId)
  if (!props.isOnboarding) throw 'onboarding only'

  return props
}

describe('getHomePageProps', () => {
  const userId = getUuid()

  describe('get-user-name step', () => {
    describe('before UserNamedThemself', () => {
      beforeAll(async () => {
        await resetDatabase()
      })

      it('should return pending state', async () => {
        const { steps } = await getHomePagePropsOnboarding(userId)
        expect(steps['get-user-name']).toEqual('pending')
      })
    })

    describe('after UserNamedThemself', () => {
      const name = 'John Doe'
      const personId = getUuid()
      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          UserNamedThemself({
            userId,
            personId,
            name,
          })
        )
      })

      it('should return done state', async () => {
        const { steps } = await getHomePagePropsOnboarding(userId)
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
        const { steps } = await getHomePagePropsOnboarding(userId)
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
        const { steps } = await getHomePagePropsOnboarding(userId)
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
        const { steps } = await getHomePagePropsOnboarding(userId)
        expect(steps).toMatchObject({
          'upload-first-photo': 'photo-uploaded',
          photoId,
          photoUrl: getPhotoUrlFromId(photoId),
          faces: [{ faceId }],
        })
      })
    })

    describe('after UserConfirmedHisFace', () => {
      const photoId = getUuid()
      const faceId = getUuid()
      const personId = getUuid()
      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          UserConfirmedHisFace({
            userId,
            faceId,
            photoId,
            personId,
          })
        )
      })

      it('should return user-face-confirmed', async () => {
        const { steps } = await getHomePagePropsOnboarding(userId)
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
        const { steps } = await getHomePagePropsOnboarding(userId)
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
        const { steps } = await getHomePagePropsOnboarding(userId)
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
        const { steps } = await getHomePagePropsOnboarding(userId)
        expect(steps).toMatchObject({
          'upload-family-photo': 'annotating-photo',
          photos: [{ photoId, photoUrl: getPhotoUrlFromId(photoId), faces: [{ faceId, stage: 'awaiting-name' }] }],
        })
      })
    })

    describe('after FaceIgnoredInPhoto', () => {
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
        await addToHistory(
          FaceIgnoredInPhoto({
            photoId,
            faceId,
            ignoredBy: userId,
          })
        )
      })

      it('should return face in ignored stage', async () => {
        const { steps } = await getHomePagePropsOnboarding(userId)
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

    describe('after UserNamedPersonInPhoto', () => {
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
          UserNamedPersonInPhoto({
            photoId,
            faceId,
            personId,
            userId,
            name,
          })
        )
      })

      it('should return face in awaiting-relationship or done (depending on RELATIONSHIPS_ENABLED) stage and have name and personId', async () => {
        const { steps } = await getHomePagePropsOnboarding(userId)

        if (RELATIONSHIPS_ENABLED) {
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
        } else {
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
        }
      })
    })

    describe('after UserRecognizedPersonInPhoto', () => {
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
          UserNamedThemself({
            personId,
            userId,
            name,
          })
        )
        await addToHistory(
          UserRecognizedPersonInPhoto({
            photoId,
            faceId,
            personId,
            userId,
          })
        )
      })

      it('should return face in awaiting-relationship or done stage and have name and personId', async () => {
        const { steps } = await getHomePagePropsOnboarding(userId)
        expect(steps).toMatchObject({
          'upload-family-photo': 'annotating-photo',
          photos: [
            {
              photoId,
              photoUrl: getPhotoUrlFromId(photoId),
              faces: [{ faceId, personId, name, stage: RELATIONSHIPS_ENABLED ? 'awaiting-relationship' : 'done' }],
            },
          ],
        })
      })
    })

    describe('after UserIgnoredRelationship', () => {
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
          UserNamedPersonInPhoto({
            photoId,
            faceId,
            personId,
            userId,
            name,
          })
        )
        await addToHistory(
          UserIgnoredRelationship({
            personId,
            userId,
          })
        )
      })

      it('should return face in done stage and have name and personId but no relationship', async () => {
        const { steps } = await getHomePagePropsOnboarding(userId)
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

    if (RELATIONSHIPS_ENABLED) {
      describe('after UserPostedRelationUsingOpenAI', () => {
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
            UserNamedPersonInPhoto({
              photoId,
              faceId,
              personId,
              userId,
              name,
            })
          )
          await addToHistory(
            UserPostedRelationUsingOpenAI({
              personId,
              userId,
              messages: [],
              userAnswer: 'my mothers sister',
              relationship: { relationship: 'aunt', side: 'maternal' },
            })
          )
        })

        it('should return face in awaiting-relationship-confirmation stage and include the relationship deduced by openAI', async () => {
          const { steps } = await getHomePagePropsOnboarding(userId)
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
    }

    if (RELATIONSHIPS_ENABLED) {
      describe('after UserConfirmedRelationUsingOpenAI', () => {
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
            UserNamedPersonInPhoto({
              photoId,
              faceId,
              personId,
              userId,
              name,
            })
          )
          await addToHistory(
            UserPostedRelationUsingOpenAI({
              personId,
              userId,
              messages: [],
              userAnswer: 'my mothers sister',
              relationship: { relationship: 'aunt', side: 'maternal' },
            })
          )
          await addToHistory(
            UserConfirmedRelationUsingOpenAI({
              personId,
              userId,
              relationship: { relationship: 'aunt', side: 'maternal' },
            })
          )
        })

        it('should return face in done stage and include the confirmed relationship', async () => {
          const { steps } = await getHomePagePropsOnboarding(userId)
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
    }

    describe('if we know this face from elsewhere', () => {
      const photoId = getUuid()
      const faceId = getUuid()
      const personId = getUuid()
      const name = 'Jhon'

      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          UserNamedThemself({
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
          UserConfirmedHisFace({
            userId,
            faceId,
            photoId,
            personId,
          })
        )
      })

      it('should return face in done stage but not include relationship yet (todo)', async () => {
        const { steps } = await getHomePagePropsOnboarding(userId)
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
        const { steps } = await getHomePagePropsOnboarding(userId)
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

    describe('after OnboardingFamilyMemberAnnotationIsDone', () => {
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
        await addToHistory(
          OnboardingFamilyMemberAnnotationIsDone({
            userId,
          })
        )
      })

      it('should return a done state', async () => {
        const { steps } = await getHomePagePropsOnboarding(userId)
        expect(steps).toMatchObject({
          'upload-family-photo': 'done',
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
        const { steps } = await getHomePagePropsOnboarding(userId)
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
        const { steps } = await getHomePagePropsOnboarding(userId)
        expect(steps).toMatchObject({ 'create-first-thread': 'thread-written', threadId, message })
      })
    })

    describe('after OnboardingReadyForBeneficiaries', () => {
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
        await addToHistory(
          OnboardingReadyForBeneficiaries({
            userId,
          })
        )
      })

      it('should return done state', async () => {
        const { steps } = await getHomePagePropsOnboarding(userId)
        expect(steps).toMatchObject({ 'create-first-thread': 'done', threadId, message })
      })
    })
  })
  describe('chose-beneficiaries step', () => {
    describe('before BeneficiariesChosen', () => {
      beforeAll(async () => {
        await resetDatabase()
      })

      it('should return awaiting-input state', async () => {
        const { steps } = await getHomePagePropsOnboarding(userId)
        expect(steps['chose-beneficiaries']).toEqual('awaiting-input')
      })
    })

    describe('after BeneficiariesChosen', () => {
      beforeAll(async () => {
        await resetDatabase()
        await addToHistory(
          BeneficiariesChosen({
            userId,
            mode: 'user-distributes-codes',
          })
        )
      })

      it('should return isOnboarding: false', async () => {
        const { isOnboarding } = await getHomePageProps(userId)
        expect(isOnboarding).toBe(false)
      })
    })
  })
})
