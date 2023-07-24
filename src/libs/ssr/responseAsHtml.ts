import { SearchIndex } from 'algoliasearch/lite'
import type { Request, Response } from 'express'
import ReactDOMServer from 'react-dom/server'
import { ADMIN_USERID } from '../../dependencies/env'
import { LocationContext } from '../../pages/_components/LocationContext'
import { Session, SessionContext } from '../../pages/_components/SessionContext'
import { PersonSearchContext } from '../../pages/_components/usePersonSearch'
import { withContext } from './withContext'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { UserUploadedPhotoToChat } from '../../pages/chat/uploadPhotoToChat/UserUploadedPhotoToChat'
import { OnboardingUserUploadedPhotoOfFamily } from '../../pages/bienvenue/step2-userUploadsPhoto/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from '../../pages/bienvenue/step1-userTellsAboutThemselves/OnboardingUserUploadedPhotoOfThemself'
import { UserHasDesignatedThemselfAsPerson } from '../../events/UserHasDesignatedThemselfAsPerson'
import { OnboardingUserNamedThemself } from '../../pages/bienvenue/step1-userTellsAboutThemselves/OnboardingUserNamedThemself'
import { UUID } from '../../domain'
import { OnboardingUserConfirmedHisFace } from '../../pages/bienvenue/step2-userUploadsPhoto/OnboardingUserConfirmedHisFace'
import { OnboardingUserNamedPersonInFamilyPhoto } from '../../pages/bienvenue/step3-learnAboutUsersFamily/OnboardingUserNamedPersonInFamilyPhoto'
import { OnboardingUserRecognizedPersonInFamilyPhoto } from '../../pages/bienvenue/step3-learnAboutUsersFamily/OnboardingUserRecognizedPersonInFamilyPhoto'
import { PhotoManuallyAnnotated } from '../../pages/photo/annotateManually/PhotoManuallyAnnotated'
import { PhotoAnnotationConfirmed } from '../../pages/photo/confirmPhotoAnnotation/PhotoAnnotationConfirmed'
import { UserSentMessageToChat } from '../../pages/chat/sendMessageToChat/UserSentMessageToChat'
import { OnboardingUserStartedFirstThread } from '../../pages/bienvenue/step4-start-thread/OnboardingUserStartedFirstThread'

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
      <html class="h-full bg-gray-100">
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
        <body class="h-full">
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
    >(['OnboardingUserUploadedPhotoOfFamily', 'OnboardingUserUploadedPhotoOfThemself', 'UserUploadedPhotoToChat'], {
      uploadedBy: userId,
    })

    const hasThreads = await getSingleEvent<UserSentMessageToChat | OnboardingUserStartedFirstThread>(
      ['UserSentMessageToChat', 'OnboardingUserStartedFirstThread'],
      { userId }
    )

    const profilePic = await getProfilePicUrlForUser(userId)

    return {
      isLoggedIn: true,
      userName: user.name,
      isAdmin: userId === ADMIN_USERID,
      profilePic,
      arePhotosEnabled: !!hasPhotos,
      areThreadsEnabled: !!hasThreads,
      areVideosEnabled: false,
    }
  }

  return { isLoggedIn: false }
}

const getProfilePicUrlForUser = async (userId: UUID): Promise<string | null> => {
  const person = await getSingleEvent<UserHasDesignatedThemselfAsPerson | OnboardingUserNamedThemself>(
    ['OnboardingUserNamedThemself', 'UserHasDesignatedThemselfAsPerson'],
    { userId }
  )

  if (!person) return null

  const { personId } = person.payload

  const faceEvent = await getSingleEvent<
    | PhotoAnnotationConfirmed
    | PhotoManuallyAnnotated
    | OnboardingUserConfirmedHisFace
    | OnboardingUserNamedPersonInFamilyPhoto
    | OnboardingUserRecognizedPersonInFamilyPhoto
  >(
    [
      'OnboardingUserConfirmedHisFace',
      'OnboardingUserNamedPersonInFamilyPhoto',
      'OnboardingUserRecognizedPersonInFamilyPhoto',
      'PhotoAnnotationConfirmed',
      'PhotoManuallyAnnotated',
    ],
    { personId }
  )

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
