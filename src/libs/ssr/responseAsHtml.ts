import type { Response, Request } from 'express'
import ReactDOMServer from 'react-dom/server'
import { LocationContext } from '../../pages/_components/LocationContext'
import { AlgoliaContext } from '../../pages/_components/AlgoliaContext'
import { Session, SessionContext } from '../../pages/_components/SessionContext'
import { withContext } from './withContext'
import { SearchClient } from 'algoliasearch/lite'
import { ADMIN_USERID } from '../../dependencies/env'

const html = String.raw

/**
 * Call ReactDOMServer.renderToString on the element and send the response
 * @param request Express.Request instance
 * @param response Express.Response instance
 * @param element React element to render to html
 */
export function responseAsHtml(
  request: Request,
  response: Response,
  element: JSX.Element & { outerProps?: any; componentName?: string }
) {
  if (element === null) {
    return
  }

  const bundle = extractBundleInfo(element)

  const { shouldIncludeBrowserBundle } = bundle

  const session = getSession(request)

  const { ALGOLIA_APPID, ALGOLIA_SEARCHKEY } = process.env

  response.send(
    html`
      <html class="h-full bg-gray-100">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <link href="/style.css" rel="stylesheet" />
          ${shouldIncludeBrowserBundle
            ? html`
                <script src="/js/shared.js"></script>
                <script src="/js/${bundle.name}.js?${process.env.npm_package_version}"></script>
              `
            : ''}
        </head>
        <body class="h-full overflow-hidden">
          <!-- prettier-ignore -->
          <div id="root">${ReactDOMServer.renderToString(
            withContext(
              LocationContext,
              request.url,
              withContext(SessionContext, session, withContext(AlgoliaContext, null as SearchClient | null, element))
            )
          )}</div>
          ${shouldIncludeBrowserBundle
            ? html`
                <!-- prettier-ignore -->
                <script>
                  window.__INITIAL_PROPS__ = ${JSON.stringify(bundle.props || {})};
                  window.__SESSION__ = ${JSON.stringify(session || {})};
                  window.__ALGOLIA__ = ${JSON.stringify({ appId: ALGOLIA_APPID!, searchKey: ALGOLIA_SEARCHKEY! } || {})};
                  window.__URL__ = '${request.url}';
                </script>
              `
            : ''}
        </body>
      </html>
    `
  )
}

function getSession(request: Request): Session {
  if (request.session.user) {
    return { isLoggedIn: true, userName: request.session.user.name, isAdmin: request.session.user.id === ADMIN_USERID }
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
