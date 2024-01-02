import { SearchIndex } from 'algoliasearch/lite'
import React from 'react'
import { getUuid } from '../../../libs/getUuid'
import { PersonSearchContext } from '../usePersonSearch'
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

export const AvecVisage = () => (
  <PersonSearchContext.Provider value={{ search: fakePersonSearch } as unknown as SearchIndex}>
    <PersonSearch
      onPersonSelected={(personId) => {
        window.alert(`User selected person ${personId}`)
      }}
      open={true}
      setOpen={(isOpen) => window.alert(`setOpen called with ${isOpen}`)}
      personFaceUrl='https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80'
    />
  </PersonSearchContext.Provider>
)
