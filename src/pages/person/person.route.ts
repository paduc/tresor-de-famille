import { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory.js'
import { requireAuth } from '../../dependencies/authn.js'
import { changePersonNameInIndex, personsIndex } from '../../dependencies/search.js'
import { zIsFaceId } from '../../domain/FaceId.js'
import { zIsPersonId } from '../../domain/PersonId.js'
import { zIsPhotoId } from '../../domain/PhotoId.js'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml.js'
import { pageRouter } from '../pageRouter.js'
import { PersonPage } from './PersonPage.js'
import { PersonPageURL } from './PersonPageURL.js'
import { UserChangedPersonName } from './UserChangedPersonName.js'
import { UserSelectedNewProfilePic } from './UserSelectedNewProfilePic.js'
import { getPersonPageProps } from './getPersonPageProps.js'

pageRouter
  .route(PersonPageURL())
  .get(requireAuth(), async (request, response, next) => {
    try {
      const { personId } = z.object({ personId: zIsPersonId }).parse(request.params)
      const userId = request.session.user!.id

      const props = await getPersonPageProps({ personId, userId })

      responseAsHtml(request, response, PersonPage(props))
    } catch (error) {
      console.error('Failed to load profile', error)
      return response.status(500).send("Le chargement du profile n'a pas fonctionné.")
    }
  })
  .post(requireAuth(), async (request, response, next) => {
    try {
      const { action } = z
        .object({
          action: z.string(),
        })
        .parse(request.body)

      const userId = request.session.user!.id

      if (action === 'selectNewProfilePic') {
        const { faceId, photoId, personId } = z
          .object({
            photoId: zIsPhotoId,
            faceId: zIsFaceId,
            personId: zIsPersonId,
          })
          .parse(request.body)

        await addToHistory(
          UserSelectedNewProfilePic({
            personId,
            photoId,
            faceId,
            userId,
          })
        )
        return response.redirect(PersonPageURL(personId))
      }

      if (action === 'changeName') {
        const { oldName, newName, personId } = z
          .object({
            newName: z.string(),
            oldName: z.string(),
            personId: zIsPersonId,
          })
          .parse(request.body)

        if (oldName !== newName) {
          await addToHistory(
            UserChangedPersonName({
              personId,
              name: newName,
              userId,
            })
          )

          await changePersonNameInIndex({ personId, name: newName })
        }

        return response.redirect(PersonPageURL(personId))
      }

      throw new Error('POST on person route without or unknown action')
    } catch (error) {
      console.error('Failed to select new profile pic', error)
      return response.status(500).send("Quelque n'a pas fonctionné dans votre demande.")
    }
  })
