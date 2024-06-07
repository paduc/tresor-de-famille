import React from 'react'
import { makePersonId } from '../../../../libs/makePersonId.js'
import { makeRelationshipId } from '../../../../libs/makeRelationshipId.js'
import { ContextualMenuProvider } from '../../_components/ContextualMenu.js'
import { EntireFamilyFamilyTree } from './EntireFamilyFamilyTree.js'

export default {
  title: 'Arbre Famille',
  component: EntireFamilyFamilyTree,
  parameters: { layout: 'fullscreen' },
}

const john = { name: 'John', personId: makePersonId(), profilePicUrl: '' }
const jane = { name: 'Jane', personId: makePersonId(), profilePicUrl: '' }

const johnsFather = { name: 'John Senior', personId: makePersonId(), profilePicUrl: '' }
const johnsMother = { name: 'Mother of John', personId: makePersonId(), profilePicUrl: '' }

const janesFather = { name: 'Father of Jane', personId: makePersonId(), profilePicUrl: '' }
const janesMother = { name: 'Mother of Jane', personId: makePersonId(), profilePicUrl: '' }

const child1 = { name: 'Child 1', personId: makePersonId(), profilePicUrl: '' }
const inlaw1 = { name: 'Inlaw 1', personId: makePersonId(), profilePicUrl: '' }
const grandChild1 = { name: 'Grandchild 1', personId: makePersonId(), profilePicUrl: '' }
const grandChild2 = { name: 'Grandchild 2', personId: makePersonId(), profilePicUrl: '' }
const grandChild3 = { name: 'Grandchild 3', personId: makePersonId(), profilePicUrl: '' }

const child2 = { name: 'Child 2', personId: makePersonId(), profilePicUrl: '' }
const inlaw2 = { name: 'Inlaw 2', personId: makePersonId(), profilePicUrl: '' }

const child3 = { name: 'Child 3', personId: makePersonId(), profilePicUrl: '' }
const inlaw3 = { name: 'Inlaw 3', personId: makePersonId(), profilePicUrl: '' }
const grandChild4 = { name: 'Grandchild 4', personId: makePersonId(), profilePicUrl: '' }
const greatGrandChild1 = { name: 'Great Grandchild 1', personId: makePersonId(), profilePicUrl: '' }
const greatGrandChild2 = { name: 'Great Grandchild 2', personId: makePersonId(), profilePicUrl: '' }

const persons = [
  john,
  jane,
  child1,
  inlaw1,
  child2,
  inlaw2,
  child3,
  inlaw3,
  grandChild1,
  grandChild2,
  grandChild3,
  grandChild4,
  greatGrandChild1,
  greatGrandChild2,
  johnsFather,
  johnsMother,
  janesFather,
  janesMother,
]

export const Seul = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ContextualMenuProvider>
        <EntireFamilyFamilyTree
          persons={persons}
          relationships={
            [
              // { id: makeRelationshipId(), spouseIds: [john.personId, jane.personId], type: 'spouses' },
              // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child1.personId },
              // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child1.personId, inlaw1.personId] },
              // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild1.personId },
              // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild2.personId },
              // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild3.personId },
              // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child2.personId },
              // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child2.personId, inlaw2.personId] },
              // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child3.personId },
              // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child3.personId, inlaw3.personId] },
              // { id: makeRelationshipId(), type: 'parent', parentId: child3.personId, childId: grandChild4.personId },
              // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild1.personId },
              // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild2.personId },
            ]
          }
          originPersonId={john.personId}
        />
      </ContextualMenuProvider>
    </div>
  )
}

export const SeulUnEnfant = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ContextualMenuProvider>
        <EntireFamilyFamilyTree
          persons={persons}
          relationships={[
            // { id: makeRelationshipId(), spouseIds: [john.personId, jane.personId], type: 'spouses' },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child1.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child1.personId, inlaw1.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild2.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild3.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child2.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child2.personId, inlaw2.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child3.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child3.personId, inlaw3.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: child3.personId, childId: grandChild4.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild2.personId },
          ]}
          originPersonId={john.personId}
        />
      </ContextualMenuProvider>
    </div>
  )
}

export const SeulAvecEnfants = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ContextualMenuProvider>
        <EntireFamilyFamilyTree
          persons={persons}
          relationships={[
            // { id: makeRelationshipId(), spouseIds: [john.personId, jane.personId], type: 'spouses' },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child1.personId },
            { id: makeRelationshipId(), type: 'spouses', spouseIds: [child1.personId, inlaw1.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild2.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild3.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child2.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child2.personId, inlaw2.personId] },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child3.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child3.personId, inlaw3.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: child3.personId, childId: grandChild4.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild2.personId },
          ]}
          originPersonId={john.personId}
        />
      </ContextualMenuProvider>
    </div>
  )
}

export const Couple = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ContextualMenuProvider>
        <EntireFamilyFamilyTree
          persons={persons}
          relationships={[
            { id: makeRelationshipId(), spouseIds: [john.personId, jane.personId], type: 'spouses' },
            // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child1.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child1.personId, inlaw1.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild2.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild3.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child2.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child2.personId, inlaw2.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child3.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child3.personId, inlaw3.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: child3.personId, childId: grandChild4.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild2.personId },
          ]}
          originPersonId={john.personId}
        />
      </ContextualMenuProvider>
    </div>
  )
}

export const CoupleUnEnfant = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ContextualMenuProvider>
        <EntireFamilyFamilyTree
          persons={persons}
          relationships={[
            { id: makeRelationshipId(), spouseIds: [john.personId, jane.personId], type: 'spouses' },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child1.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child1.personId, inlaw1.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild2.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild3.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child2.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child2.personId, inlaw2.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child3.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child3.personId, inlaw3.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: child3.personId, childId: grandChild4.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild2.personId },
          ]}
          originPersonId={john.personId}
        />
      </ContextualMenuProvider>
    </div>
  )
}

export const CoupleUnEnfant2Petits = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ContextualMenuProvider>
        <EntireFamilyFamilyTree
          persons={persons}
          relationships={[
            { id: makeRelationshipId(), spouseIds: [john.personId, jane.personId], type: 'spouses' },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child1.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child1.personId, inlaw1.personId] },

            { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild1.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild2.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild3.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child2.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child2.personId, inlaw2.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child3.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child3.personId, inlaw3.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: child3.personId, childId: grandChild4.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild2.personId },
          ]}
          originPersonId={john.personId}
        />
      </ContextualMenuProvider>
    </div>
  )
}

export const CoupleUnEnfantUnGendre = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ContextualMenuProvider>
        <EntireFamilyFamilyTree
          persons={persons}
          relationships={[
            { id: makeRelationshipId(), spouseIds: [john.personId, jane.personId], type: 'spouses' },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child1.personId },
            { id: makeRelationshipId(), type: 'spouses', spouseIds: [child1.personId, inlaw1.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild2.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild3.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child2.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child2.personId, inlaw2.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child3.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child3.personId, inlaw3.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: child3.personId, childId: grandChild4.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild2.personId },
          ]}
          originPersonId={john.personId}
        />
      </ContextualMenuProvider>
    </div>
  )
}

export const CoupleNEnfants = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ContextualMenuProvider>
        <EntireFamilyFamilyTree
          persons={persons}
          relationships={[
            { id: makeRelationshipId(), spouseIds: [john.personId, jane.personId], type: 'spouses' },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child1.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child1.personId, inlaw1.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild2.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild3.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child2.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child2.personId, inlaw2.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child3.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child3.personId, inlaw3.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: child3.personId, childId: grandChild4.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild2.personId },
          ]}
          originPersonId={john.personId}
        />
      </ContextualMenuProvider>
    </div>
  )
}
export const CoupleNEnfantsGendre = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ContextualMenuProvider>
        <EntireFamilyFamilyTree
          persons={persons}
          relationships={[
            { id: makeRelationshipId(), spouseIds: [john.personId, jane.personId], type: 'spouses' },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child1.personId },
            { id: makeRelationshipId(), type: 'spouses', spouseIds: [child1.personId, inlaw1.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild2.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild3.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child2.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child2.personId, inlaw2.personId] },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child3.personId },
            // { id: makeRelationshipId(), type: 'spouses', spouseIds: [child3.personId, inlaw3.personId] },
            // { id: makeRelationshipId(), type: 'parent', parentId: child3.personId, childId: grandChild4.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild2.personId },
          ]}
          originPersonId={john.personId}
        />
      </ContextualMenuProvider>
    </div>
  )
}

export const CouplePetitsEnfants = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ContextualMenuProvider>
        <EntireFamilyFamilyTree
          persons={persons}
          relationships={[
            { id: makeRelationshipId(), spouseIds: [john.personId, jane.personId], type: 'spouses' },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child1.personId },
            { id: makeRelationshipId(), type: 'spouses', spouseIds: [child1.personId, inlaw1.personId] },
            { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild1.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild2.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild3.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child2.personId },
            { id: makeRelationshipId(), type: 'spouses', spouseIds: [child2.personId, inlaw2.personId] },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child3.personId },
            { id: makeRelationshipId(), type: 'spouses', spouseIds: [child3.personId, inlaw3.personId] },
            { id: makeRelationshipId(), type: 'parent', parentId: child3.personId, childId: grandChild4.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild1.personId },
            // { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild2.personId },
          ]}
          originPersonId={john.personId}
        />
      </ContextualMenuProvider>
    </div>
  )
}

export const CoupleArrierePetitsEnfants = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ContextualMenuProvider>
        <EntireFamilyFamilyTree
          persons={persons}
          relationships={[
            { id: makeRelationshipId(), spouseIds: [john.personId, jane.personId], type: 'spouses' },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child1.personId },
            { id: makeRelationshipId(), type: 'spouses', spouseIds: [child1.personId, inlaw1.personId] },
            { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild1.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild2.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild3.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child2.personId },
            { id: makeRelationshipId(), type: 'spouses', spouseIds: [child2.personId, inlaw2.personId] },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child3.personId },
            { id: makeRelationshipId(), type: 'spouses', spouseIds: [child3.personId, inlaw3.personId] },
            { id: makeRelationshipId(), type: 'parent', parentId: child3.personId, childId: grandChild4.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild1.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild2.personId },
          ]}
          originPersonId={john.personId}
        />
      </ContextualMenuProvider>
    </div>
  )
}

export const CoupleArrierePetitsEnfantsEtAscendants = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ContextualMenuProvider>
        <EntireFamilyFamilyTree
          persons={persons}
          relationships={[
            { id: makeRelationshipId(), spouseIds: [john.personId, jane.personId], type: 'spouses' },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child1.personId },
            { id: makeRelationshipId(), type: 'spouses', spouseIds: [child1.personId, inlaw1.personId] },
            { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild1.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild2.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: child1.personId, childId: grandChild3.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child2.personId },
            { id: makeRelationshipId(), type: 'spouses', spouseIds: [child2.personId, inlaw2.personId] },
            { id: makeRelationshipId(), type: 'parent', parentId: john.personId, childId: child3.personId },
            { id: makeRelationshipId(), type: 'spouses', spouseIds: [child3.personId, inlaw3.personId] },
            { id: makeRelationshipId(), type: 'parent', parentId: child3.personId, childId: grandChild4.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild1.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: grandChild4.personId, childId: greatGrandChild2.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: johnsFather.personId, childId: john.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: johnsMother.personId, childId: john.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: janesFather.personId, childId: jane.personId },
            { id: makeRelationshipId(), type: 'parent', parentId: janesMother.personId, childId: jane.personId },
          ]}
          originPersonId={john.personId}
        />
      </ContextualMenuProvider>
    </div>
  )
}
