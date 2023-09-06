import { SearchIndex } from 'algoliasearch/lite'
import type { Request, Response } from 'express'
import ReactDOMServer from 'react-dom/server'
import { ADMIN_USERID } from '../../dependencies/env'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { UUID } from '../../domain'
import { LocationContext } from '../../pages/_components/LocationContext'
import { Session, SessionContext } from '../../pages/_components/SessionContext'
import { PersonSearchContext } from '../../pages/_components/usePersonSearch'
import { UserNamedThemself } from '../../pages/bienvenue/step1-userTellsAboutThemselves/UserNamedThemself'
import { UserConfirmedHisFace } from '../../pages/bienvenue/step2-userUploadsPhoto/UserConfirmedHisFace'
import { OnboardingUserUploadedPhotoOfFamily } from '../../pages/bienvenue/step2-userUploadsPhoto/OnboardingUserUploadedPhotoOfFamily'
import { UserNamedPersonInPhoto } from '../../pages/bienvenue/step3-learnAboutUsersFamily/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../../pages/bienvenue/step3-learnAboutUsersFamily/UserRecognizedPersonInPhoto'
import { OnboardingUserStartedFirstThread } from '../../pages/bienvenue/step4-start-thread/OnboardingUserStartedFirstThread'
import { UserSentMessageToChat } from '../../pages/chat/sendMessageToChat/UserSentMessageToChat'
import { UserUploadedPhotoToChat } from '../../pages/chat/uploadPhotoToChat/UserUploadedPhotoToChat'
import { PhotoManuallyAnnotated } from '../../pages/photo/annotateManually/PhotoManuallyAnnotated'
import { PhotoAnnotationConfirmed } from '../../pages/photo/confirmPhotoAnnotation/PhotoAnnotationConfirmed'
import { withContext } from './withContext'

const html = String.raw

/**
 * Call ReactDOMServer.renderToString on the element and send the response
 * @param request Express.Request instance
 * @param response Express.Response instance
 * @param element React element to render to html
 */
export async function responseAsHtml(
  request: Request,
  response: Response,
  element: JSX.Element & { outerProps?: any; componentName?: string }
) {
  if (element === null) {
    return
  }

  const bundle = extractBundleInfo(element)

  const session = await getSession(request)

  const searchKey = request.session.searchKey

  const { ALGOLIA_APPID } = process.env

  response.send(
    html`
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <link href="/style.css" rel="stylesheet" />
          ${bundle.shouldIncludeBrowserBundle
            ? html`
                <script src="/js/shared.js"></script>
                <script src="/js/${bundle.name}.js?${process.env.npm_package_version}"></script>
              `
            : ''}
        </head>
        <body>
          <!-- prettier-ignore -->
          <div id="root">${ReactDOMServer.renderToString(
            withContext(
              LocationContext,
              request.url,
              withContext(SessionContext, session, withContext(PersonSearchContext, null as SearchIndex | null, element))
            )
          )}</div>
          ${bundle.shouldIncludeBrowserBundle
            ? html`
                <!-- prettier-ignore -->
                <script>
                  window.__INITIAL_PROPS__ = ${JSON.stringify(bundle.props || {})};
                  window.__SESSION__ = ${JSON.stringify(session || {})};
                  window.__ALGOLIA__ = ${JSON.stringify({ appId: ALGOLIA_APPID!, searchKey } || {})};
                  window.__URL__ = '${request.url}';
                </script>
              `
            : ''}
        </body>
      </html>
    `
  )
}

async function getSession(request: Request): Promise<Session> {
  const user = request.session.user
  if (user) {
    const userId = user.id

    const hasPhotos = await getSingleEvent<UserUploadedPhotoToChat | OnboardingUserUploadedPhotoOfFamily>(
      ['OnboardingUserUploadedPhotoOfFamily', 'UserUploadedPhotoToChat'],
      {
        uploadedBy: userId,
      }
    )

    const hasThreads = await getSingleEvent<UserSentMessageToChat | OnboardingUserStartedFirstThread>(
      ['UserSentMessageToChat', 'OnboardingUserStartedFirstThread'],
      { userId }
    )

    const hasPersons = await getSingleEvent<UserNamedPersonInPhoto>('UserNamedPersonInPhoto', { userId })

    const profilePic = await getProfilePicUrlForUser(userId)

    return {
      isLoggedIn: true,
      userName: user.name,
      isAdmin: userId === ADMIN_USERID,
      profilePic,
      arePhotosEnabled: !!hasPhotos,
      arePersonsEnabled: !!hasPersons,
      areThreadsEnabled: !!hasThreads,
      areVideosEnabled: false,
    }
  }

  return { isLoggedIn: false }
}

const getProfilePicUrlForUser = async (userId: UUID): Promise<string | null> => {
  const person = await getSingleEvent<UserNamedThemself>(['UserNamedThemself'], { userId })

  if (!person) return null

  const { personId } = person.payload

  const faceEvent = await getSingleEvent<UserConfirmedHisFace>(['UserConfirmedHisFace'], { personId })

  if (!faceEvent) return null

  const { photoId, faceId } = faceEvent.payload

  return `/photo/${photoId}/face/${faceId}`
}

type BundleInfo =
  | {
      shouldIncludeBrowserBundle: true
      props: any
      name: string
    }
  | { shouldIncludeBrowserBundle: false }

/**
 * Extract information from a JSX.Element.
 * If it passed through withBrowserBundle first shouldIncludeBrowserBundle is true, and props and name are provided.
 * If it's just a plain old React element, shouldIncludeBrowserBundle is false
 * @param element the JSX.Element that may have passed through withBrowserBundle
 * @returns BundleInfo
 */
function extractBundleInfo(element: JSX.Element & { outerProps?: any; componentName?: string }): BundleInfo {
  const shouldIncludeBrowserBundle = element.hasOwnProperty('outerProps')
  if (shouldIncludeBrowserBundle) {
    const { children, ...props } = element.outerProps || {}

    return { props, name: element.componentName!, shouldIncludeBrowserBundle }
  }

  return { shouldIncludeBrowserBundle }
}
