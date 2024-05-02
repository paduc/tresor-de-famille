import React from 'react'
import { makePersonId } from '../../../../libs/makePersonId.js'
import { CloseFamilyFamilyTree } from './CloseFamilyFamilyTree.js'
import { ContextualMenu, ContextualMenuProvider } from '../ContextualMenu.js'
import { RelationshipId } from '../../../../domain/RelationshipId.js'

export default {
  title: 'Arbre Famille Proche',
  component: CloseFamilyFamilyTree,
  parameters: { layout: 'fullscreen' },
}

const john = { name: 'John', personId: makePersonId(), profilePicUrl: '' }
const jane = { name: 'Jane', personId: makePersonId(), profilePicUrl: '' }
export const Template = () => (
  <div style={{ width: '100%', height: '100vh' }}>
    <ContextualMenuProvider>
      <CloseFamilyFamilyTree
        persons={[john, jane]}
        relationships={[{ id: '1' as RelationshipId, spouseIds: [john.personId, jane.personId], type: 'spouses' }]}
        origin={{ personId: john.personId, x: 0, y: 0 }}
        onSelectionChange={() => {}}
      />
    </ContextualMenuProvider>
  </div>
)
