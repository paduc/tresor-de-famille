import { SearchIndex } from 'algoliasearch/lite'
import React from 'react'
import { getUuid } from '../../../libs/getUuid'
import { PersonSearchContext } from '../../_components/usePersonSearch'
import { PersonSearch } from './PersonSearch'

export default { title: 'Person Search', component: PersonSearch, parameters: { layout: 'fullscreen' } }

const fakePersonSearch = async (query: string) => {
  return { hits: [{ objectID: getUuid(), name: 'John Doe' }] }
}

export const Basique = () => (
  <PersonSearchContext.Provider value={{ search: fakePersonSearch } as unknown as SearchIndex}>
    <PersonSearch
      onPersonSelected={(personId) => {
        window.alert(`User selected person ${personId}`)
      }}
      open={true}
      setOpen={(isOpen) => window.alert(`setOpen called with ${isOpen}`)}
    />
  </PersonSearchContext.Provider>
)
