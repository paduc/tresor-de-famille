import multer from 'multer'
import fs from 'node:fs'
import { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { uploadPhoto } from '../../dependencies/photo-storage'
import { personsIndex } from '../../dependencies/search'
import { AppUserId } from '../../domain/AppUserId'
import { FaceId, zIsFaceId } from '../../domain/FaceId'
import { FamilyId } from '../../domain/FamilyId'
import { PhotoId, zIsPhotoId } from '../../domain/PhotoId'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { UserConfirmedHisFace } from '../../events/onboarding/UserConfirmedHisFace'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself'
import { makePersonId } from '../../libs/makePersonId'
import { makePhotoId } from '../../libs/makePhotoId'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { getPersonForUser } from '../_getPersonForUser'
import { pageRouter } from '../pageRouter'
import { detectFacesInPhotoUsingAWS } from '../photo/recognizeFacesInChatPhoto/detectFacesInPhotoUsingAWS'
import { HomePage } from './HomePage'
import { getHomePageProps } from './getHomePageProps'
import { asFamilyId } from '../../libs/typeguards'
import { PersonId, zIsPersonId } from '../../domain/PersonId'
import { UserRecognizedThemselfAsPerson } from '../../events/onboarding/UserRecognizedThemselfAsPerson'
import { getPersonFamily } from '../_getPersonFamily'
import { OnboardingUserStartedFirstThread } from '../../events/onboarding/OnboardingUserStartedFirstThread'
import { ThreadClonedForSharing } from '../thread/ThreadPage/ThreadClonedForSharing'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread'
import { UserSetChatTitle } from '../thread/UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from '../thread/UserUpdatedThreadAsRichText'
import { UserSentMessageToChat } from '../../events/deprecated/UserSentMessageToChat'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { PersonClonedForSharing } from '../share/PersonClonedForSharing'
import { getFaceAndPhotoForPerson } from '../_getProfilePicUrlForPerson'
import { getPersonById } from '../_getPersonById'

pageRouter
  .route('/')
  .get(requireAuth(), async (request, response) => {
    try {
      const userId = request.session.user!.id
      const props = await getHomePageProps(userId)

      // if (request.session.isOnboarding && !props.isOnboarding && !(await hasUserCreatedAThread(userId))) {
      //   return response.redirect('/thread.html')
      // }

      responseAsHtml(request, response, HomePage(props))
    } catch (error) {
      return response.send('Erreur de chargement de page home')
    }
  })
  .post(requireAuth(), async (request, response) => {
    const { action } = z
      .object({
        action: z.enum(['setUserPerson']),
      })
      .parse(request.body)

    const userId = request.session.user!.id

    if (action === 'setUserPerson') {
      const { existingPersonId, newPersonWithName } = z
        .object({
          existingPersonId: zIsPersonId.optional(),
          newPersonWithName: z.string().optional(),
        })
        .parse(request.body)

      if (!existingPersonId && !newPersonWithName) {
        console.error('setUserPerson is missing an option', { existingPersonId, newPersonWithName })
        return response.redirect('/')
      }

      if (newPersonWithName) {
        const personId = makePersonId()
        await addToHistory(
          UserNamedThemself({
            userId,
            personId,
            name: newPersonWithName,
            familyId: asFamilyId(userId),
          })
        )

        request.session.user!.name = newPersonWithName

        try {
          await personsIndex.saveObject({
            objectID: personId,
            personId,
            name: newPersonWithName,
            familyId: asFamilyId(userId),
            visible_by: [`family/${asFamilyId(userId)}`, `user/${userId}`],
          })
        } catch (error) {
          console.error('Could not add new user to algolia index', error)
        }

        request.session.isOnboarding = false
        return response.redirect('/')
      }

      if (existingPersonId) {
        const personFamilyId = await getPersonFamily(existingPersonId)

        if (!personFamilyId) {
          console.error('setUserPerson existingPersonId is unknown')
          return response.redirect('/')
        }

        await addToHistory(
          UserRecognizedThemselfAsPerson({
            userId,
            personId: existingPersonId,
            familyId: personFamilyId,
          })
        )

        if (personFamilyId !== asFamilyId(userId)) {
          // The person needs to exist in the user's personnal space
          const { faceId, profilePicPhotoId } = await fetchFaceAndPhotoForPerson({ userId, personId: existingPersonId })

          const personWithName = await getPersonById({ personId: existingPersonId })
          const name = personWithName ? personWithName.name : ''

          request.session.user!.name = name

          const newCloneId = makePersonId()
          await addToHistory(
            PersonClonedForSharing({
              personId: newCloneId,
              familyId: asFamilyId(userId),
              faceId,
              profilePicPhotoId,
              name,
              clonedFrom: {
                personId: existingPersonId,
                familyId: personFamilyId,
              },
              userId,
            })
          )

          try {
            await personsIndex.saveObject({
              objectID: newCloneId,
              personId: newCloneId,
              name,
              familyId: asFamilyId(userId),
              visible_by: [`user/${userId}`],
            })
          } catch (error) {
            console.error('Could not add person clone to algolia index', error)
          }
        }

        request.session.isOnboarding = false
      }
    }

    return response.redirect('/')
  })

async function hasUserCreatedAThread(userId: AppUserId): Promise<boolean> {
  type ThreadEvent =
    | UserSentMessageToChat
    | OnboardingUserStartedFirstThread
    | UserUpdatedThreadAsRichText
    | UserInsertedPhotoInRichTextThread
    | ThreadClonedForSharing
    | UserSetChatTitle

  const threadEvent = await getSingleEvent<ThreadEvent>(
    [
      'OnboardingUserStartedFirstThread',
      'UserSentMessageToChat',
      'UserUpdatedThreadAsRichText',
      'UserInsertedPhotoInRichTextThread',
      'ThreadClonedForSharing',
      'UserSetChatTitle',
    ],
    { userId }
  )

  return !!threadEvent
}

async function fetchFaceAndPhotoForPerson({
  userId,
  personId,
}: {
  userId: AppUserId
  personId: PersonId
}): Promise<{ faceId: FaceId | undefined; profilePicPhotoId: PhotoId | undefined }> {
  const faceAndPhotoForPerson = await getFaceAndPhotoForPerson({ userId, personId })
  if (faceAndPhotoForPerson) {
    const { faceId, photoId } = faceAndPhotoForPerson
    return { faceId, profilePicPhotoId: photoId }
  }

  return {
    faceId: undefined,
    profilePicPhotoId: undefined,
  }
}
