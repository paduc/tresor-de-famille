import { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { personsIndex } from '../../dependencies/search'
import { zIsFaceId } from '../../domain/FaceId'
import { zIsPersonId } from '../../domain/PersonId'
import { zIsPhotoId } from '../../domain/PhotoId'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { PersonPage } from './PersonPage'
import { PersonPageURL } from './PersonPageURL'
import { UserChangedPersonName } from './UserChangedPersonName'
import { UserSelectedNewProfilePic } from './UserSelectedNewProfilePic'
import { getPersonPageProps } from './getPersonPageProps'

pageRouter
  .route(PersonPageURL())
  .get(requireAuth(), async (request, response) => {
    try {
      const { personId } = z.object({ personId: zIsPersonId }).parse(request.params)
      const userId = request.session.user!.id

      const props = await getPersonPageProps(personId, userId)

      responseAsHtml(request, response, PersonPage(props))
    } catch (error) {
      console.error('Failed to load profile', error)
      return response.status(500).send("Le chargement du profile n'a pas fonctionné.")
    }
  })
  .post(requireAuth(), async (request, response) => {
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

          try {
            await personsIndex.partialUpdateObject({
              objectID: personId,
              name: newName,
            })
          } catch (error) {
            console.error('Could not change persons name in algolia index', error)
          }
        }

        return response.redirect(PersonPageURL(personId))
      }

      throw new Error('POST on person route without or unknown action')
    } catch (error) {
      console.error('Failed to select new profile pic', error)
      return response.status(500).send("Quelque n'a pas fonctionné dans votre demande.")
    }
  })
