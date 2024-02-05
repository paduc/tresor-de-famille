import { SearchIndex } from 'algoliasearch/lite'
import type { Request, Response } from 'express'
import ReactDOMServer from 'react-dom/server'
import { ADMIN_USERID, IS_SHARING_ENABLED } from '../../dependencies/env'
import { LocationContext } from '../../pages/_components/LocationContext'
import { Session, SessionContext } from '../../pages/_components/SessionContext'
import { PersonSearchContext } from '../../pages/_components/usePersonSearch'
import { withContext } from './withContext'

import manifest from '../../assets/js/manifest.json'
import { makeSearchKey } from '../../dependencies/search'
import { FamilyId } from '../../domain/FamilyId'
import { getPersonIdForUser } from '../../pages/_getPersonIdForUser'
import { getProfilePicUrlForPerson } from '../../pages/_getProfilePicUrlForPerson'
import { getUserFamilies } from '../../pages/_getUserFamilies'
import { InvitationWithCodeUrl } from '../../pages/share/InvitationWithCodeUrl'
import { FamilyColorCodes } from './FamilyColorCodes'

const html = String.raw

const assetByPageName: Record<string, string> = manifest

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

  const { ALGOLIA_APPID } = process.env

  response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  response.setHeader('Pragma', 'no-cache')
  response.setHeader('Expires', '0')

  response.send(
    html`
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <link rel="apple-touch-icon-precomposed" sizes="57x57" href="/apple-touch-icon-57x57.png" />
          <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/apple-touch-icon-114x114.png" />
          <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/apple-touch-icon-72x72.png" />
          <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/apple-touch-icon-144x144.png" />
          <link rel="apple-touch-icon-precomposed" sizes="60x60" href="/apple-touch-icon-60x60.png" />
          <link rel="apple-touch-icon-precomposed" sizes="120x120" href="/apple-touch-icon-120x120.png" />
          <link rel="apple-touch-icon-precomposed" sizes="76x76" href="/apple-touch-icon-76x76.png" />
          <link rel="apple-touch-icon-precomposed" sizes="152x152" href="/apple-touch-icon-152x152.png" />
          <link rel="icon" type="image/png" href="/favicon-196x196.png" sizes="196x196" />
          <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
          <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
          <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
          <link rel="icon" type="image/png" href="/favicon-128.png" sizes="128x128" />
          <meta name="application-name" content="Trésor de famille" />
          <meta name="msapplication-TileColor" content="#FFFFFF" />
          <meta name="msapplication-TileImage" content="mstile-144x144.png" />
          <meta name="msapplication-square70x70logo" content="mstile-70x70.png" />
          <meta name="msapplication-square150x150logo" content="mstile-150x150.png" />
          <meta name="msapplication-wide310x150logo" content="mstile-310x150.png" />
          <meta name="msapplication-square310x310logo" content="mstile-310x310.png" />

          <link href="/style.css" rel="stylesheet" />
          ${bundle.shouldIncludeBrowserBundle
            ? html`
                ${assetByPageName?.shared
                  ? html`
                      <script src="/js/${assetByPageName?.shared}"></script>
                    `
                  : ``}
                ${assetByPageName?.[bundle.name]
                  ? html`
                      <script src="/js/${assetByPageName?.[bundle.name]}"></script>
                    `
                  : ``}
              `
            : ''}
        </head>
        <body>
          <!-- prettier-ignore -->
          <div id="root">${ReactDOMServer.renderToString(
            withContext(
              LocationContext,
              request.url,
              withContext(
                SessionContext,
                session as Session | undefined,
                withContext(PersonSearchContext, null as SearchIndex | null, element)
              )
            )
          )}</div>
          ${bundle.shouldIncludeBrowserBundle
            ? html`
                <!-- prettier-ignore -->
                <script>
                  window.__INITIAL_PROPS__ = ${JSON.stringify(bundle.props || {})};
                  window.__SESSION__ = ${JSON.stringify(session || {})};
                  window.__ALGOLIA_APPID__ = "${ALGOLIA_APPID!}";
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
  const isOnboarding = request.session.isOnboarding
  if (user) {
    const userId = user.id

    const userFamilies = await getUserFamilies(user.id)

    const hasFamiliesOtherThanDefault = userFamilies.some((f) => f.familyId !== (userId as string as FamilyId))

    const searchKey = makeSearchKey(
      user.id,
      userFamilies.map((f) => f.familyId)
    )

    const personId = await getPersonIdForUser({ userId })
    const profilePic = personId ? await getProfilePicUrlForPerson({ userId, personId }) : ''

    return {
      isLoggedIn: true,
      userName: user.name,
      userId: user.id,
      userFamilies: userFamilies.map(({ familyId, familyName, about, shareCode }, index) => ({
        familyId,
        familyName,
        about,
        isUserSpace: (familyId as string) === (user.id as string),
        color: FamilyColorCodes[index % FamilyColorCodes.length],
        shareUrl: InvitationWithCodeUrl(familyId, shareCode),
      })),
      hasFamiliesOtherThanDefault,
      hasCreatedFamilies: userFamilies.some((family) => family.isCreator),
      searchKey,
      isAdmin: userId === ADMIN_USERID,
      personId,
      profilePic,
      arePhotosEnabled: !!user.name,
      arePersonsEnabled: !!user.name,
      areThreadsEnabled: !!user.name,
      isFamilyPageEnabled: !!user.name,
      areVideosEnabled: false,
      isSharingEnabled: IS_SHARING_ENABLED && !isOnboarding,
      isOnboarding: !!isOnboarding,
    }
  }

  return { isLoggedIn: false, isSharingEnabled: IS_SHARING_ENABLED }
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
