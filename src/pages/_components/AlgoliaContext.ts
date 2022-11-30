import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch/lite'
import React, { useEffect, useState } from 'react'

export const AlgoliaContext = React.createContext<SearchClient | null>(null)

const isServerContext = typeof window === 'undefined'
export const useSearchClient = () => {
  const [searchClient, setSearchClient] = useState<SearchClient | null>(null)
  const [index, setIndex] = useState<SearchIndex | null>(null)

  useEffect(() => {
    if (isServerContext) return

    const { appId, searchKey } = (window as any).__ALGOLIA__

    console.log('Setting searchClient')
    const searchClient = algoliasearch(appId, searchKey)
    setSearchClient(searchClient)
    const index = searchClient.initIndex('persons')
    setIndex(index)
  }, [setSearchClient, setIndex])

  return { searchClient, index }
}
