import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch/lite'
import { useEffect, useState } from 'react'

const isServerContext = typeof window === 'undefined'
export const useSearchClient = () => {
  const [searchClient, setSearchClient] = useState<SearchClient | null>(null)
  const [index, setIndex] = useState<SearchIndex | null>(null)

  useEffect(() => {
    if (isServerContext) return

    const { appId, searchKey } = (window as any).__ALGOLIA__

    const searchClient = algoliasearch(appId, searchKey)
    setSearchClient(searchClient)
    const index = searchClient.initIndex('persons')
    setIndex(index)
  }, [setSearchClient, setIndex])

  return { searchClient, index }
}
