import * as React from 'react'
import { SessionContext } from '../_components'
import { BienvenuePage } from './BienvenuePage'

export default { title: 'Page de bienvenue', component: BienvenuePage }

export const Basique = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
    <BienvenuePage
      messages={[
        {
          role: 'assistant',
          content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
        },
        {
          role: 'user',
          content: 'Bonjour, je suis un homme de 37ans.',
        },
        {
          role: 'assistant',
          content: "Bonjour ! Je suis ravi de te rencontrer. Pourriez-vous me dire votre prénom s'il vous plaît ?",
        },
        {
          role: 'user',
          content: 'Pierre-Antoine.',
        },
      ]}
    />
  </SessionContext.Provider>
)
