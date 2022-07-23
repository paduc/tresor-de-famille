import callsites from 'callsites'
import React from 'react'
import { hydrate } from 'react-dom'
import { LocationContext } from '../../pages/_components/LocationContext'
import { SessionContext } from '../../pages/_components/SessionContext'
import { withContext } from './withContext'

const isServerContext = typeof window === 'undefined'

export function withBrowserBundle<ComponentProps>(Component: (props: ComponentProps) => JSX.Element) {
  // This will be executed twice
  // 1) On the server, for server-side rendering
  // 2) On the browser, for client-side hydrating

  if (isServerContext) {
    return serverCode<ComponentProps>(Component)
  }

  return browserCode(Component)
}

/**
 * Add componentName and outerProps (used by responseAsHtml)
 * @param Component
 * @returns Component with additional outerProps and componentName properties
 */
function serverCode<ComponentProps>(Component: (props: ComponentProps) => JSX.Element) {
  const componentName = getComponentNameFromCallsite()
  return (props?: ComponentProps) => {
    // Call React.createElement to transform pure function to React Function Component
    // this enables hooks
    return { ...React.createElement(Component, props), outerProps: props, componentName }
  }
}

const browserCode = (Component: (props?: any) => JSX.Element) => {
  // The following code executes in the browser

  window.addEventListener('DOMContentLoaded', function () {
    // Retrieve props and contexts from global variable
    // (see responseAsHtml)

    const props = (window as any).__INITIAL_PROPS__
    const session = (window as any).__SESSION__
    const url = (window as any).__URL__

    hydrate(
      withContext(LocationContext, url, withContext(SessionContext, session, React.createElement(Component, props))),
      document.querySelector('#root')
    )
  })

  return Component
}

function getComponentNameFromCallsite() {
  const callsite = callsites()
  const callsiteFilename = callsite[3].getFileName() // The first 3 callsites are this file and src/libs/ssr/index.ts, the forth is the one we're looking for
  if (!callsiteFilename) {
    throw new Error('failed to find name of callsite')
  }
  return getBasename(callsiteFilename)
}

function getBasename(path: string) {
  return path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'))
}
