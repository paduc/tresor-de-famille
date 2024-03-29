import zod from 'zod'
import { addToHistory } from '../../dependencies/addToHistory.js'
import { requireAuth } from '../../dependencies/authn.js'
import { pageRouter } from '../pageRouter.js'
import { zIsPhotoId } from '../../domain/PhotoId.js'
import { doesPhotoExist } from '../_doesPhotoExist.js'
import { UserDeletedPhoto } from './UserDeletedPhoto.js'
import { PhotoListPageUrl } from '../photoList/PhotoListPageUrl.js'

pageRouter.route('/delete-photo').post(requireAuth(), async (request, response, next) => {
  try {
    const { photoId } = zod.object({ photoId: zIsPhotoId }).parse(request.body)
    const userId = request.session.user!.id

    // TODO: Make sure the user is the author of the photo
    const isAllowed = await doesPhotoExist({ photoId })

    if (!isAllowed) {
      return response.status(403).send("La suppression de la photo a échoué parce que vous n'en êtes pas l'auteur.")
    }

    // Emit
    await addToHistory(
      UserDeletedPhoto({
        photoId,
        userId,
      })
    )

    return response.redirect(PhotoListPageUrl)
  } catch (error) {
    console.error('Error in photo route')
    next(error)
  }
})
