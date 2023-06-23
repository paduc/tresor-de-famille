import callsites from 'callsites'
import React, { FunctionComponent } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { LocationContext } from '../../pages/_components/LocationContext'
import { SessionContext } from '../../pages/_components/SessionContext'
import { withContext } from './withContext'
import algoliasearch, { SearchIndex } from 'algoliasearch/lite'
import { PersonSearchContext } from '../../pages/_components/usePersonSearch'

const isServerContext = typeof window === 'undefined'

export function withBrowserBundle<ComponentType extends FunctionComponent<any>>(Component: ComponentType) {
  // This will be executed twice

  if (isServerContext) {
    // 1) On the server, for server-side rendering
    return serverCode(Component)
  }

  // 2) On the browser, for client-side hydrating
  return browserCode(Component)
}

/**
 * Add componentName and outerProps (used by responseAsHtml)
 * @param Component
 * @returns Component with additional outerProps and componentName properties
 */
function serverCode<ComponentType extends FunctionComponent>(Component: ComponentType) {
  const componentName = getComponentNameFromCallsite()
  return (props?: ExtractPropsType<ComponentType>) => {
    // Call React.createElement to transform pure function to React Function Component
    // this enables hooks (see https://stackoverflow.com/questions/65982665/react-17-0-1-invalid-hook-call-hooks-can-only-be-called-inside-of-the-body-of)

    return { ...React.createElement(Component, props), outerProps: props, componentName }
  }
}

type ExtractPropsType<ComponentType extends FunctionComponent> = ComponentType extends FunctionComponent<infer Props>
  ? Props
  : never

const browserCode = <ComponentType extends FunctionComponent>(Component: ComponentType) => {
  // The following code executes in the browser

  window.addEventListener('DOMContentLoaded', function () {
    // Retrieve props and contexts from global variable
    // (see responseAsHtml)

    const props = (window as any).__INITIAL_PROPS__
    const session = (window as any).__SESSION__
    const url = (window as any).__URL__
    const algolia = (window as any).__ALGOLIA__ as { appId: string; searchKey: string | undefined } | null

    let index: SearchIndex | null = null

    if (algolia && algolia.searchKey) {
      const { appId, searchKey } = algolia

      const searchClient = algoliasearch(appId, searchKey)
      index = searchClient.initIndex('persons')
    }

    const container = document.getElementById('root')

    const rawElement = React.createElement(Component, props)

    const elementWithSearch = index ? withContext(PersonSearchContext, index as SearchIndex | null, rawElement) : rawElement

    hydrateRoot(container!, withContext(LocationContext, url, withContext(SessionContext, session, elementWithSearch)))
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
