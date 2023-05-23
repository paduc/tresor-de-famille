import React from 'react'
import { FactViewerPage } from './FactViewerPage'
import { getUuid } from '../libs/getUuid'

export default { title: 'FactViewerPage', component: FactViewerPage }

export const primary = () => (
  <FactViewerPage
    facts={[
      {
        type: 'HelloWorld',
        id: getUuid(),
        payload: {
          chatId: 1234,
          addedBy: 'person1234',
        },
        occurredAt: new Date('1/1/1000'),
      },
      {
        type: 'HelloWorld',
        id: getUuid(),
        payload: {},
        occurredAt: new Date(),
      },
      {
        type: 'HelloWorld',
        id: getUuid(),
        payload: {},
        occurredAt: new Date(),
      },
    ]}
  />
)
