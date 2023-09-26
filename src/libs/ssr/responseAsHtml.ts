import { SearchIndex } from 'algoliasearch/lite'
import type { Request, Response } from 'express'
import ReactDOMServer from 'react-dom/server'
import { ADMIN_USERID } from '../../dependencies/env'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { UUID } from '../../domain'
import { OnboardingUserStartedFirstThread } from '../../events/onboarding/OnboardingUserStartedFirstThread'
import { OnboardingUserUploadedPhotoOfFamily } from '../../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { UserConfirmedHisFace } from '../../events/onboarding/UserConfirmedHisFace'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself'
import { LocationContext } from '../../pages/_components/LocationContext'
import { Session, SessionContext } from '../../pages/_components/SessionContext'
import { PersonSearchContext } from '../../pages/_components/usePersonSearch'
import { UserSentMessageToChat } from '../../pages/chat/sendMessageToChat/UserSentMessageToChat'
import { UserUploadedPhotoToChat } from '../../pages/chat/uploadPhotoToChat/UserUploadedPhotoToChat'
import { withContext } from './withContext'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { getProfilePicUrlForUser } from '../../pages/_getProfilePicUrlForUser'

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

    const hasPhotos = await getSingleEvent<
      UserUploadedPhotoToChat | OnboardingUserUploadedPhotoOfFamily | OnboardingUserUploadedPhotoOfThemself
    >(['OnboardingUserUploadedPhotoOfFamily', 'UserUploadedPhotoToChat', 'OnboardingUserUploadedPhotoOfThemself'], {
      uploadedBy: userId,
    })

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
