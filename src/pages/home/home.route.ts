import { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { addFamilyVisibilityToIndex, personsIndex } from '../../dependencies/search'
import { zIsPersonId } from '../../domain/PersonId'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself'
import { UserRecognizedThemselfAsPerson } from '../../events/onboarding/UserRecognizedThemselfAsPerson'
import { makePersonId } from '../../libs/makePersonId'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { asFamilyId } from '../../libs/typeguards'
import { getOriginalPersonFamily } from '../_getOriginalPersonFamily'
import { getPersonById } from '../_getPersonById'
import { pageRouter } from '../pageRouter'
import { HomePage } from './HomePage'
import { getHomePageProps } from './getHomePageProps'

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
            visible_by: [`family/${asFamilyId(userId)}`],
          })
        } catch (error) {
          console.error('Could not add new user to algolia index', error)
        }

        request.session.isOnboarding = false
        return response.redirect('/')
      }

      if (existingPersonId) {
        const personFamilyId = await getOriginalPersonFamily(existingPersonId)

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

        const personWithName = await getPersonById({ personId: existingPersonId })
        const name = personWithName ? personWithName.name : ''
        request.session.user!.name = name

        await addFamilyVisibilityToIndex({ personId: existingPersonId, familyId: personFamilyId })

        request.session.isOnboarding = false
      }
    }

    return response.redirect('/')
  })
