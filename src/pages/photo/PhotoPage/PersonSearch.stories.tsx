import React from 'react'
import { getUuid } from '../../../libs/getUuid'
import { PersonSearch } from './PersonSearch'

export default { title: 'Person Search', component: PersonSearch, parameters: { layout: 'fullscreen' } }

export const Basique = () => (
  <PersonSearch
    onPersonSelected={(personId) => {
      window.alert(`User selected person ${personId}`)
    }}
    open={true}
    setOpen={(isOpen) => window.alert(`setOpen called with ${isOpen}`)}
  />
)
