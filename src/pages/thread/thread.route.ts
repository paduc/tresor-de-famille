import multer from 'multer'
import fs from 'node:fs'
import z from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { postgres } from '../../dependencies/database'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { uploadPhoto } from '../../dependencies/photo-storage'
import { AppUserId } from '../../domain/AppUserId'
import { FaceId } from '../../domain/FaceId'
import { FamilyId, zIsFamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'
import { ThreadId, zIsThreadId } from '../../domain/ThreadId'
import { getUuid } from '../../libs/getUuid'
import { makePersonId } from '../../libs/makePersonId'
import { makePhotoId } from '../../libs/makePhotoId'
import { makeThreadId } from '../../libs/makeThreadId'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { getFacesInPhoto } from '../_getFacesInPhoto'
import { getPersonByIdOrThrow } from '../_getPersonById'
import { pageRouter } from '../pageRouter'
import { UserAddedCaptionToPhoto } from '../photo/UserAddedCaptionToPhoto'
import { detectFacesInPhotoUsingAWS } from '../photo/recognizeFacesInChatPhoto/detectFacesInPhotoUsingAWS'
import { PersonClonedForSharing } from '../share/PersonClonedForSharing'
import { PhotoClonedForSharing } from './ThreadPage/PhotoClonedForSharing'
import { ThreadClonedForSharing } from './ThreadPage/ThreadClonedForSharing'
import { ThreadPage } from './ThreadPage/ThreadPage'
import { TipTapContentAsJSON, decodeTipTapJSON, encodeStringy } from './TipTapTypes'
import { UserInsertedPhotoInRichTextThread } from './UserInsertedPhotoInRichTextThread'
import { UserSetChatTitle } from './UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from './UserUpdatedThreadAsRichText'
import { getThreadContents, getThreadPageProps } from './getThreadPageProps'
import { UserSentMessageToChat } from './sendMessageToChat/UserSentMessageToChat'
import { getThreadFamily } from '../_getThreadFamily'
import { getThreadAuthor } from '../_getThreadAuthor'
import { ReadOnlyThreadPage } from './ThreadPage/ReadonlyThreadPage'
import { ThreadUrl } from './ThreadUrl'
import { getUserFamilies } from '../_getUserFamilies'

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

const FILE_SIZE_LIMIT_MB = 50
const upload = multer({
  dest: 'temp/photos',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

pageRouter
  .route('/thread.html')
  .get(requireAuth(), async (request, response) => {
    const newThreadId = makeThreadId()

    response.redirect(ThreadUrl(newThreadId, true))
  })
  .post(requireAuth(), async (request, response) => {
    const userId = request.session.user!.id

    const threadId = makeThreadId()

    const { message } = request.body

    if (message) {
      const messageId = getUuid()

      await addToHistory(
        UserSentMessageToChat({
          chatId: threadId,
          userId,
          message,
          messageId,
          familyId: userId as string as FamilyId,
        })
      )
    }

    // TODO: try catch error and send it back as HTML (or redirect if OK)
    return response.redirect(ThreadUrl(threadId, true))
  })

pageRouter
  .route(ThreadUrl())
  .get(requireAuth(), async (request, response) => {
    const { edit, threadId } = z.object({ edit: z.literal('edit').optional(), threadId: zIsThreadId }).parse(request.params)

    const userId = request.session.user!.id
    const isEditable = edit === 'edit'

    const props = await getThreadPageProps({ threadId, userId })

    if (isEditable) {
      // If it is new or it's someone that has the right to edit
      if (props.isNewThread || (await canEditThread({ threadId, userId }))) {
        return responseAsHtml(request, response, ThreadPage(props))
      }

      // remove the edit
      return response.redirect(ThreadUrl(threadId))
    }

    // Add edit
    if (props.isNewThread) {
      return response.redirect(ThreadUrl(threadId, true))
    }

    // By default, return the readonly version
    return responseAsHtml(request, response, ReadOnlyThreadPage(props))
  })
  .post(requireAuth(), upload.single('photo'), async (request, response) => {
    try {
      const userId = request.session.user!.id
      const { threadId } = z.object({ threadId: zIsThreadId }).parse(request.params)

      const { action } = z
        .object({
          action: z.enum([
            'clientsideTitleUpdate',
            'newMessage',
            'saveRichContentsAsJSON',
            'insertPhotoAtMarker',
            'clientsideUpdate',
            'shareWithFamily',
          ]),
        })
        .parse(request.body)

      const familyId = (await getThreadFamily(threadId)) || (userId as string as FamilyId)

      if (action === 'newMessage') {
        const { message } = z.object({ message: z.string() }).parse(request.body)
        const messageId = getUuid()

        if (message.trim().length) {
          await addToHistory(
            UserSentMessageToChat({
              chatId: threadId,
              userId,
              message: message.trim(),
              messageId,
              familyId,
            })
          )
        }

        return response.redirect(ThreadUrl(threadId, true))
      } else if (action === 'clientsideUpdate') {
        try {
          const { contentAsJSON } = z.object({ contentAsJSON: z.any() }).parse(request.body)

          await addToHistory(
            UserUpdatedThreadAsRichText({
              chatId: threadId,
              contentAsJSON,
              userId,
              familyId,
            })
          )
          return response.status(200).send('ok')
        } catch (error) {
          console.error('Impossible to save UserThread')
        }

        return response.status(500).send('Oops')
      } else if (action === 'clientsideTitleUpdate') {
        const { title } = z.object({ title: z.string() }).parse(request.body)

        await addToHistory(
          UserSetChatTitle({
            chatId: threadId,
            userId,
            title: title.trim(),
            familyId,
          })
        )
        return response.redirect(ThreadUrl(threadId, true))
      } else if (action === 'insertPhotoAtMarker') {
        const requestId = getUuid()
        const { file } = request
        const photoId = makePhotoId()

        if (!file) return new Error('We did not receive any image.')
        const { path: originalPath } = file

        const { contentAsJSONEncoded } = z.object({ contentAsJSONEncoded: z.string() }).parse(request.body)

        const contentAsJSON = decodeTipTapJSON(contentAsJSONEncoded)

        const markerIndex = contentAsJSON.content.findIndex((node) => node.type === 'insertPhotoMarker')
        if (markerIndex === -1) throw new Error('Cannot find marker in content')

        contentAsJSON.content.splice(markerIndex, 1, {
          type: 'photoNode',
          attrs: {
            photoId,
            threadId,
            personsInPhoto: encodeStringy([]),
            unrecognizedFacesInPhoto: 0,
            description: '',
            url: '',
          },
        })

        const location = await uploadPhoto({ contents: fs.createReadStream(originalPath), id: photoId })

        await addToHistory(
          UserInsertedPhotoInRichTextThread({
            chatId: threadId,
            photoId,
            userId,
            location,
            contentAsJSON,
            familyId,
          })
        )

        await detectFacesInPhotoUsingAWS({ file, photoId })

        return response.redirect(ThreadUrl(threadId, true))
      } else if (action === 'shareWithFamily') {
        const { familyId: destinationFamilyId } = z.object({ familyId: zIsFamilyId }).parse(request.body)

        const authorId = await getThreadAuthor(threadId)

        if (authorId !== userId) {
          throw new Error("Seul l'auteur d'une histoire peut la partager.")
        }

        const cloneThreadId = makeThreadId()
        const contents = await getThreadContents(threadId)
        if (contents === null) {
          throw new Error('Histoire introuvable.')
        }
        const { title, contentAsJSON: originalContents, familyId: originalFamilyId } = contents

        const cloneContentAsJSON = await makeCloneOfContentAsJSON({
          originalContents,
          userId,
          originalFamilyId,
          destinationFamilyId,
          cloneThreadId,
          originalThreadId: threadId,
        })

        await addToHistory(
          ThreadClonedForSharing({
            threadId: cloneThreadId,
            userId,
            familyId: destinationFamilyId,
            title,
            contentAsJSON: cloneContentAsJSON,
            clonedFrom: {
              threadId,
              familyId: originalFamilyId,
            },
          })
        )
        return response.redirect(ThreadUrl(cloneThreadId))
      }

      // TODO: try catch error and send it back as HTML (or redirect if OK)
      return response.redirect(ThreadUrl(threadId))
    } catch (error) {
      console.error(error)
      return response.status(500).send(
        `Votre requête a provoqué une erreur.
          Merci de faire attention la prochaine fois ! ;)
          Plus sérieusement, l'administrateur a été prévenu et corrige dès que possible. Merci de votre patience.`
      )
    }
  })

async function makeCloneOfContentAsJSON({
  originalContents,
  userId,
  destinationFamilyId,
  cloneThreadId,
  originalFamilyId,
  originalThreadId,
}: {
  userId: AppUserId
  originalFamilyId: FamilyId
  destinationFamilyId: FamilyId
  originalContents: TipTapContentAsJSON
  cloneThreadId: ThreadId
  originalThreadId: ThreadId
}): Promise<TipTapContentAsJSON> {
  const cloneContentAsJSON: TipTapContentAsJSON = { type: 'doc', content: [] }
  for (const contentNode of originalContents.content) {
    if (contentNode.type !== 'photoNode') {
      cloneContentAsJSON.content.push(contentNode)
      continue
    }

    const { photoId: originalPhotoId } = contentNode.attrs

    if (!originalPhotoId) continue

    const destinationPhotoId = makePhotoId()

    const caption = await getCaptionByPhotoId(originalPhotoId)

    const faces = await makeCloneOfFacesInPhoto({
      userId,
      originalPhotoId,
      destinationPhotoId,
      originalFamilyId,
      destinationFamilyId,
    })

    await addToHistory(
      PhotoClonedForSharing({
        userId,
        familyId: destinationFamilyId,

        photoId: destinationPhotoId,

        faces,
        caption,

        threadId: cloneThreadId,

        clonedFrom: {
          familyId: originalFamilyId,
          photoId: originalPhotoId,
          threadId: originalThreadId,
        },
      })
    )

    // TODO: clone the people tagged in the photos (if don't exist in the family)
    cloneContentAsJSON.content.push({
      type: 'photoNode',
      attrs: {
        photoId: originalPhotoId,
        threadId: originalThreadId,
        description: '',
        personsInPhoto: encodeStringy([]),
        unrecognizedFacesInPhoto: 0,
        url: '',
      },
    })
  }
  return cloneContentAsJSON
}

async function getCaptionByPhotoId(originalPhotoId: PhotoId) {
  return (await getSingleEvent<UserAddedCaptionToPhoto>('UserAddedCaptionToPhoto', { photoId: originalPhotoId }))?.payload
    .caption.body
}

async function makeCloneOfFacesInPhoto({
  userId,
  originalPhotoId,
  destinationPhotoId,
  originalFamilyId,
  destinationFamilyId,
}: {
  userId: AppUserId
  originalPhotoId: PhotoId
  destinationPhotoId: PhotoId
  originalFamilyId: FamilyId
  destinationFamilyId: FamilyId
}): Promise<
  {
    faceId: FaceId
    personId?: PersonId | undefined
    isIgnored?: boolean
  }[]
> {
  // Get all faces from original photo
  // Get the persons that have been tagged (in original family)
  // Get the faces that were ignored (in original family)
  const facesInOriginalFamily = await getFacesInPhoto({ photoId: originalPhotoId })

  const facesInDestinationFamily: {
    faceId: FaceId
    personId?: PersonId | undefined
    isIgnored?: boolean
  }[] = []

  for (const face of facesInOriginalFamily) {
    if (face.personId) {
      const { rows } = await postgres.query<PersonClonedForSharing>(
        `SELECT * FROM history WHERE type='PersonClonedForSharing' AND payload->'clonedFrom'->>'personId'=$1 LIMIT 1`,
        [face.personId]
      )

      const personClonedEvent = rows[0]

      if (personClonedEvent) {
        // there is an equivalent, substitute
        facesInDestinationFamily.push({
          faceId: face.faceId,
          personId: personClonedEvent.payload.personId,
        })
        continue
      }

      const personId = makePersonId()
      const { name } = await getPersonByIdOrThrow({ personId: face.personId })

      // No equivalent, time to create one !
      await addToHistory(
        PersonClonedForSharing({
          userId,
          familyId: destinationFamilyId,
          personId,

          name,
          faceId: face.faceId,
          profilePicPhotoId: destinationPhotoId,

          clonedFrom: {
            familyId: originalFamilyId,
            personId: face.personId,
          },
        })
      )

      facesInDestinationFamily.push({
        faceId: face.faceId,
        personId,
      })
    } else {
      facesInDestinationFamily.push({
        faceId: face.faceId,
        isIgnored: face.isIgnored,
      })
    }
  }

  // Replace all personIds from the original family to the destinationFamily
  // If personId, get the equivalent thanks to PersonClonedForSharing
  // or clone the original if no equivalent exists

  return facesInDestinationFamily
}

async function canEditThread({ userId, threadId }: { userId: AppUserId; threadId: ThreadId }): Promise<boolean> {
  const authorId = await getThreadAuthor(threadId)

  if (authorId && authorId === userId) return true

  const threadFamily = await getThreadFamily(threadId)

  if (threadFamily) {
    const userFamilies = await getUserFamilies(userId)
    if (userFamilies.map((f) => f.familyId).includes(threadFamily)) {
      return true
    }
  }

  return false
}
