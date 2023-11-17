import type { SearchIndex } from 'algoliasearch/lite'
import React, { useContext } from 'react'

export const PersonSearchContext = React.createContext<SearchIndex | null>(null)

export const usePersonSearch = () => {
  const personSearch = useContext(PersonSearchContext)
  if (!personSearch) {
    throw new Error('You cannot call usePersonSearch outside of a PersonSearchContext.Provider')
  }

  return personSearch
}
