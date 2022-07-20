import * as React from 'react'

import { FakeConnexionPage } from './FakeConnexionPage'

export default { title: 'Fake Page de connexion', component: FakeConnexionPage }

export const Basique = () => (
  <FakeConnexionPage
    fakeUsers={[
      {
        userId: '123',
        nom: 'Peter',
      },
      {
        userId: '234',
        nom: 'Jacques',
      },
    ]}
  />
)
