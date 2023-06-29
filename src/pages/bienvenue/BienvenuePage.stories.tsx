import * as React from 'react'
import { SessionContext } from '../_components'
import { BienvenuePage } from './BienvenuePage'
import { getUuid } from '../../libs/getUuid'

export default { title: 'Onboarding', component: BienvenuePage }

export const Step1Start = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
    <BienvenuePage
      steps={[
        {
          goal: 'get-user-name',
          stage: 'in-progress',
          messages: [
            {
              role: 'assistant',
              content: "Faisons connaissance ! Pour commencer, comment t'appelles-tu ?",
            },
          ],
        },
      ]}
    />
  </SessionContext.Provider>
)
export const Step1InProgress = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
    <BienvenuePage
      steps={[
        {
          goal: 'get-user-name',
          stage: 'in-progress',
          messages: [
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
          ],
        },
      ]}
    />
  </SessionContext.Provider>
)

export const Step1Done = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: '', isAdmin: false }}>
    <BienvenuePage
      steps={[
        {
          goal: 'get-user-name',
          stage: 'done',
          result: {
            name: 'Pierre-Antoine',
            personId: getUuid(),
          },
          messages: [
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
          ],
        },
      ]}
    />
  </SessionContext.Provider>
)
