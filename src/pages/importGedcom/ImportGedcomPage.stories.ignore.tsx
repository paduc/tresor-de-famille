import * as React from 'react'
import { SessionContext } from '../_components'

import { ImportGedcomPage } from './ImportGedcomPage'

export default { title: "Page d'import Gedcom", component: ImportGedcomPage }

export const Basique = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <ImportGedcomPage />
  </SessionContext.Provider>
)
