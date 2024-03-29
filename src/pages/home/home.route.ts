import { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory.js'
import { requireAuth } from '../../dependencies/authn.js'
import { addFamilyVisibilityToIndex, personsIndex } from '../../dependencies/search.js'
import { zIsPersonId } from '../../domain/PersonId.js'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself.js'
import { UserRecognizedThemselfAsPerson } from '../../events/onboarding/UserRecognizedThemselfAsPerson.js'
import { makePersonId } from '../../libs/makePersonId.js'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml.js'
import { asFamilyId } from '../../libs/typeguards.js'
import { getOriginalPersonFamily } from '../_getOriginalPersonFamily.js'
import { getPersonById } from '../_getPersonById.js'
import { pageRouter } from '../pageRouter.js'
import { HomePage } from './HomePage.js'
import { getHomePageProps } from './getHomePageProps.js'
import { LandingPage } from '../landing/LandingPage.js'

pageRouter
  .route('/')
  .get(async (request, response, next) => {
    try {
      if (!request.session.user) {
        return responseAsHtml(request, response, LandingPage({}))
      }

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
    } catch (error) {
      next(error)
    }
  })
  .post(requireAuth(), async (request, response, next) => {
    try {
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
    } catch (error) {
      next(error)
    }
  })
