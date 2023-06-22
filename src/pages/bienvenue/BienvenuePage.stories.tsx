import * as React from 'react'
import { SessionContext } from '../_components'
import { BienvenuePage } from './BienvenuePage'

export default { title: 'Page de bienvenue', component: BienvenuePage }

export const Basique = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
    <BienvenuePage />
  </SessionContext.Provider>
)
