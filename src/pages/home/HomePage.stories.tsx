import * as React from 'react'
import { SessionContext } from '../_components'

import { HomePage } from './HomePage'

export default { title: "Page d'accueil", component: HomePage }

export const Basique = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto' }}>
    <HomePage person={null} />
  </SessionContext.Provider>
)
