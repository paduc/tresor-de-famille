import { z } from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { BienvenuePage } from './BienvenuePage'
import { parseFirstPresentation } from './step1-userTellsAboutThemselves/parseFirstPresentation'
import { getPreviousMessages } from './getPreviousMessages'
import { onboardingUrl } from './onboardingUrl'
import { zIsUUID } from '../../domain'
import { addToHistory } from '../../dependencies/addToHistory'
import { UserConfirmedHisFaceDuringOnboarding } from './step2-userUploadsPhoto/UserConfirmedHisFaceDuringOnboarding'

pageRouter
  .route(onboardingUrl)
  .get(requireAuth(), async (request, response) => {
    const props = await getPreviousMessages(request.session.user!.id)
    responseAsHtml(
      request,
      response,
      BienvenuePage({
        ...props,
      })
    )
  })
  .post(requireAuth(), async (request, response) => {
    const { action, presentation, faceId, photoId } = z
      .object({
        action: z.string(),
        presentation: z.string().optional(),
        faceId: zIsUUID.optional(),
        photoId: zIsUUID.optional(),
      })
      .parse(request.body)

    const userId = request.session.user!.id

    if (action === 'submitPresentation' && presentation) {
      await parseFirstPresentation({ userAnswer: presentation, userId })
    } else if (action === 'confirmFaceIsUser' && faceId && photoId) {
      await addToHistory(
        UserConfirmedHisFaceDuringOnboarding({
          userId,
          photoId,
          faceId,
        })
      )
    }

    const props = await getPreviousMessages(request.session.user!.id)

    return responseAsHtml(
      request,
      response,
      BienvenuePage({
        ...props,
      })
    )
  })
