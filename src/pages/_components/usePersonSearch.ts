import type { SearchIndex } from 'algoliasearch/lite'
import React, { useContext } from 'react'

export const PersonSearchContext = React.createContext<SearchIndex | null>(null)

export const usePersonSearch = () => {
  const personSearch = useContext(PersonSearchContext)
  if (!personSearch) return

  return personSearch
}
