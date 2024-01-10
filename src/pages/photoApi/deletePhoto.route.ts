import zod from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { pageRouter } from '../pageRouter'
import { zIsPhotoId } from '../../domain/PhotoId'
import { doesPhotoExist } from '../_doesPhotoExist'
import { UserDeletedPhoto } from './UserDeletedPhoto'
import { PhotoListPageUrl } from '../photoList/PhotoListPageUrl'

pageRouter.route('/delete-photo').post(requireAuth(), async (request, response) => {
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
    return response.status(500).send('La suppression de la photo a échoué.')
  }
})
