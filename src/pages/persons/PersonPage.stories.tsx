import * as React from 'react'

import { PersonPage } from './PersonPage'

export default { title: 'Page de profil', component: PersonPage }

export const Basique = () => (
  <PersonPage
    children={[]}
    spouse={[]}
    siblings={[]}
    parents={[]}
    person={{ id: '12', name: 'Clement', bornIn: '12 septembre 05' }}
    userId=''
    personId=''
  />
)
