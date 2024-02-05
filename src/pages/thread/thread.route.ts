import multer from 'multer'
import z from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId, zIsFamilyId } from '../../domain/FamilyId'
import { ThreadId, zIsThreadId } from '../../domain/ThreadId'
import { makeThreadId } from '../../libs/makeThreadId'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { getThreadAuthor } from '../_getThreadAuthor'
import { getThreadFamilies } from '../_getThreadFamilies'
import { getThreadFamily } from '../_getThreadFamily'
import { isPhotoAccessibleToFamily } from '../_isPhotoAccessibleToFamily'
import { pageRouter } from '../pageRouter'
import { PhotoAutoSharedWithThread } from './PhotoAutoSharedWithThread'
import { ReadOnlyThreadPage } from './ThreadPage/ReadonlyThreadPage'
import { ThreadPage } from './ThreadPage/ThreadPage'
import { ThreadSharedWithFamilies } from './ThreadPage/ThreadSharedWithFamilies'
import { ThreadUrl } from './ThreadUrl'
import { PhotoNode, TipTapJSON, zIsTipTapContentAsJSON } from './TipTapTypes'
import { UserSetChatTitle } from './UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from './UserUpdatedThreadAsRichText'
import { getThreadContents, getThreadPageProps } from './getThreadPageProps'
import { UserAddedCaptionToPhoto } from '../photo/UserAddedCaptionToPhoto'
import { UserSetCaptionOfPhotoInThread } from './UserSetCaptionOfPhotoInThread'
import { zIsPhotoId } from '../../domain/PhotoId'

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

const FILE_SIZE_LIMIT_MB = 50
const upload = multer({
  dest: 'temp/photos',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

pageRouter.route('/thread.html').get(requireAuth(), async (request, response) => {
  const newThreadId = makeThreadId()

  response.redirect(ThreadUrl(newThreadId, true))
})

pageRouter
  .route(ThreadUrl())
  .get(requireAuth(), async (request, response) => {
    const { edit, threadId } = z.object({ edit: z.literal('edit').optional(), threadId: zIsThreadId }).parse(request.params)

    const userId = request.session.user!.id
    const isEditable = edit === 'edit'

    try {
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
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Unauthorized')) {
        return response.status(403).send(error.message)
      }

      return response.status(500).send(`Il y a eu un problème lors du chargement de cette histoire.`)
    }
  })
  .post(requireAuth(), upload.single('photo'), async (request, response) => {
    try {
      const userId = request.session.user!.id
      const { threadId } = z.object({ threadId: zIsThreadId }).parse(request.params)

      // Check rights
      if (!(await canEditThread({ userId, threadId }))) {
        throw new Error("Seul l'auteur d'une histoire peut la modifier.")
      }

      const { action } = z
        .object({
          action: z.enum(['clientsideTitleUpdate', 'clientsideUpdate', 'shareWithMultipleFamilies', 'clientsideCaptionUpdate']),
        })
        .parse(request.body)

      const familyId = (await getThreadFamily(threadId)) || (userId as string as FamilyId)

      if (action === 'clientsideUpdate') {
        try {
          const { contentAsJSON } = z.object({ contentAsJSON: zIsTipTapContentAsJSON }).parse(request.body)

          const photoIds = contentAsJSON.content
            .filter((node): node is TipTapJSON & { type: 'photoNode' } => node.type === 'photoNode')
            .map((node) => node.attrs.photoId)

          // For each photoId, make sure the photo is accessible to the Thread family
          const threadFamilies = await getThreadFamilies(threadId)
          if (threadFamilies) {
            for (const photoId of photoIds) {
              for (const familyId of threadFamilies) {
                if (!(await isPhotoAccessibleToFamily({ photoId, familyId }))) {
                  await addToHistory(
                    PhotoAutoSharedWithThread({
                      photoId,
                      threadId,
                      familyId,
                    })
                  )
                }
              }
            }
          }

          await addToHistory(
            UserUpdatedThreadAsRichText({
              threadId,
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
            threadId,
            userId,
            title: title.trim(),
            familyId,
          })
        )
        return response.redirect(ThreadUrl(threadId, true))
      } else if (action === 'clientsideCaptionUpdate') {
        const { caption, photoId } = z.object({ caption: z.string(), photoId: zIsPhotoId }).parse(request.body)

        await addToHistory(
          UserSetCaptionOfPhotoInThread({
            caption,
            photoId,
            threadId,
            userId,
          })
        )
        return response.redirect(ThreadUrl(threadId, true))
      } else if (action === 'shareWithMultipleFamilies') {
        let { familiesToShareWith } = z
          .object({ familiesToShareWith: z.array(zIsFamilyId).or(zIsFamilyId).optional() })
          .parse(request.body)

        if (!familiesToShareWith) {
          // Trigger ThreadSharedWithFamilies with no families
          await addToHistory(
            ThreadSharedWithFamilies({
              threadId,
              familyIds: [],
              userId,
            })
          )

          return response.redirect(ThreadUrl(threadId))
        }

        if (!Array.isArray(familiesToShareWith)) {
          familiesToShareWith = [familiesToShareWith]
        }

        // TODO: Check if no-op

        // Share photos in thread
        const threadContents = await getThreadContents(threadId)
        if (threadContents !== null) {
          const photoIds = threadContents.contentAsJSON.content
            .filter((c): c is PhotoNode => c.type === 'photoNode')
            .map((c) => c.attrs.photoId)

          for (const photoId of photoIds) {
            for (const familyId of familiesToShareWith) {
              if (!(await isPhotoAccessibleToFamily({ photoId, familyId }))) {
                await addToHistory(PhotoAutoSharedWithThread({ photoId, threadId, familyId }))
              }
            }
          }
        }

        // Trigger ThreadSharedWithFamilies
        await addToHistory(
          ThreadSharedWithFamilies({
            threadId,
            familyIds: familiesToShareWith,
            userId,
          })
        )

        return response.redirect(ThreadUrl(threadId))
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

async function canEditThread({ userId, threadId }: { userId: AppUserId; threadId: ThreadId }): Promise<boolean> {
  const authorId = await getThreadAuthor(threadId)

  if (authorId && authorId === userId) return true

  if (!authorId) return true

  return false
}
