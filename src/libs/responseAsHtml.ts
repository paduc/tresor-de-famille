import type { Response, Request } from 'express'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { LocationContext } from '../pages/_components/LocationContext'
import { Session, SessionContext } from '../pages/_components/SessionContext'

/**
 * Call ReactDOMServer.renderToString on the element and send the response
 * @param request Express.Request instance
 * @param response Express.Response instance
 * @param element React element to render to html
 */
export function responseAsHtml(request: Request, response: Response, element: JSX.Element) {
  if (element === null) {
    return
  }

  const session: Session = !request.session.user
    ? { isLoggedIn: false }
    : { isLoggedIn: true, userName: request.session.user.name }

  response.send(
    ReactDOMServer.renderToString(
      React.createElement(
        LocationContext.Provider,
        { value: request.url },
        React.createElement(SessionContext.Provider, { value: session }, element)
      )
    )
  )
}
