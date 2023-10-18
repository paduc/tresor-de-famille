import React from 'react'
import { FactViewerPage } from './FactViewerPage'
import { getUuid } from '../../libs/getUuid'

export default { title: 'FactViewerPage', component: FactViewerPage }

const facts = [
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
    type: 'ByeByeBaby',
    id: getUuid(),
    payload: {},
    occurredAt: new Date(),
  },
  {
    type: 'HelloWorld123',
    id: getUuid(),
    payload: {},
    occurredAt: new Date(),
  },
  {
    type: 'HelloWorld456',
    id: getUuid(),
    payload: {},
    occurredAt: new Date(),
  },
  {
    type: 'HelloWorld768',
    id: getUuid(),
    payload: {},
    occurredAt: new Date(),
  },
]

const factTypes = Array.from(new Set(facts.map((fact) => fact.type))).sort()

export const primary = () => <FactViewerPage factTypes={factTypes} facts={facts} />
