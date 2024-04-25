import * as React from 'react'
import { Dialog } from '@headlessui/react'
import { UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useMemo, useState } from 'react'
import { FamilyId } from '../../../domain/FamilyId.js'
import { PersonId } from '../../../domain/PersonId.js'
import { RelationshipId } from '../../../domain/RelationshipId.js'
import { makeRelationshipId } from '../../../libs/makeRelationshipId.js'
import { secondaryButtonStyles, smallButtonIconStyles, smallButtonStyles } from '../../_components/Button.js'
import { TDFModal } from '../../_components/TDFModal.js'
import { PersonInTree, RelationshipInTree } from './TreeTypes.js'
import { getInitials } from './getInitials.js'
import { PersonAutocomplete } from './PersonAutocomplete.js'
import { NewRelationshipAction } from './TreeTypes.js'
import { PendingNodeRelationshipAction } from './TreeTypes.js'

export type SearchPanelProps = {
  onPersonSelected: (
    args: {
      selectedPerson: { type: 'known'; personId: PersonId } | { type: 'unknown'; name: string }
      sourcePersonId: PersonId
      secondaryRelationshipsCb?: (personId: PersonId) => RelationshipInTree[]
      relationshipAction: NewRelationshipAction
    } | null
  ) => unknown
  onRemoveRelationship: (relationshipId: RelationshipId) => unknown
  pendingRelationshipAction: PendingNodeRelationshipAction | null
  relationships: RelationshipInTree[]
  persons: PersonInTree[]
  currentFamilyId: FamilyId
  inCurrentFamilyOnly?: boolean
}
export function SearchPanel({
  onPersonSelected,
  onRemoveRelationship,
  pendingRelationshipAction,
  relationships,
  persons,
  currentFamilyId,
  inCurrentFamilyOnly,
}: SearchPanelProps) {
  const close = () => onPersonSelected(null)

  const relativeIdsWithThisRelationship: { personId: PersonId; relationship: RelationshipInTree }[] = React.useMemo(() => {
    if (!pendingRelationshipAction) return []

    const { relationshipAction, personId } = pendingRelationshipAction

    switch (relationshipAction) {
      case 'addChild':
        return relationships
          .filter((rel): rel is RelationshipInTree & { type: 'parent' } => rel.type === 'parent' && rel.parentId === personId)
          .map((relationship) => ({ personId: relationship.childId, relationship }))
      case 'addParent':
        return relationships
          .filter((rel): rel is RelationshipInTree & { type: 'parent' } => rel.type === 'parent' && rel.childId === personId)
          .map((relationship) => ({ personId: relationship.parentId, relationship }))
      case 'addFriend':
        return relationships
          .filter(
            (rel): rel is RelationshipInTree & { type: 'friends' } => rel.type === 'friends' && rel.friendIds.includes(personId)
          )
          .map((relationship) => ({ personId: relationship.friendIds.find((fId) => fId !== personId)!, relationship }))
      case 'addSpouse':
        return relationships
          .filter(
            (rel): rel is RelationshipInTree & { type: 'spouses' } => rel.type === 'spouses' && rel.spouseIds.includes(personId)
          )
          .map((relationship) => ({ personId: relationship.spouseIds.find((fId) => fId !== personId)!, relationship }))
    }
  }, [pendingRelationshipAction, relationships])

  const unselectableIds: PersonId[] = React.useMemo(() => {
    if (!pendingRelationshipAction) return []

    const { relationshipAction, personId } = pendingRelationshipAction

    const existingParents = relationships
      .filter((rel): rel is RelationshipInTree & { type: 'parent' } => rel.type === 'parent' && rel.childId === personId)
      .map((relationship) => relationship.parentId)

    const existingChildren = relationships
      .filter((rel): rel is RelationshipInTree & { type: 'parent' } => rel.type === 'parent' && rel.parentId === personId)
      .map((relationship) => relationship.childId)

    const existingSpouses = relationships
      .filter(
        (rel): rel is RelationshipInTree & { type: 'spouses' } => rel.type === 'spouses' && rel.spouseIds.includes(personId)
      )
      .map((relationship) => relationship.spouseIds.find((fId) => fId !== personId)!)

    const existingFriends = relationships
      .filter(
        (rel): rel is RelationshipInTree & { type: 'friends' } => rel.type === 'friends' && rel.friendIds.includes(personId)
      )
      .map((relationship) => relationship.friendIds.find((fId) => fId !== personId)!)

    const currentPersonId = pendingRelationshipAction.personId

    switch (relationshipAction) {
      case 'addChild':
        return [currentPersonId, ...existingSpouses, ...existingChildren, ...existingParents]
      case 'addParent':
        return [currentPersonId, ...existingSpouses, ...existingChildren, ...existingParents]
      case 'addFriend':
        return [currentPersonId, ...existingFriends]
      case 'addSpouse':
        return [currentPersonId, ...existingSpouses, ...existingChildren, ...existingParents]
    }
  }, [pendingRelationshipAction, relationships])

  const [otherRelationshipIsAccepted, setOtherRelationshipIsAccepted] = useState<boolean>(true)

  // Reset the checkbox on each open/close
  React.useEffect(() => {
    setOtherRelationshipIsAccepted(true)
  }, [pendingRelationshipAction])

  const otherRelationships = useMemo<{ label: string; cb: (searchedPerson: PersonId) => RelationshipInTree[] } | null>(() => {
    // If addChild and there is a single spouse, offer to add it to her as well
    if (pendingRelationshipAction) {
      const { relationshipAction, personId: sourcePersonId } = pendingRelationshipAction
      if (relationshipAction === 'addSpouse') {
        // Get children with single parent
        const childrenWithSingleParent = getChildrenWithSingleParent(sourcePersonId, { relationships, persons })

        if (!childrenWithSingleParent.length) {
          return null
        }

        return {
          label: `est aussi le parent de ${childrenWithSingleParent.map((child) => child.name).join(', ')}`,
          cb: (searchedSpouse) =>
            childrenWithSingleParent.map((child) => ({
              id: makeRelationshipId(),
              type: 'parent',
              childId: child.personId,
              parentId: searchedSpouse,
            })),
        }
      } else if (relationshipAction === 'addChild') {
        // Single coparent
        const [coparent, ...otherCoparents] = getCoparents(sourcePersonId, { relationships, persons })
        if (coparent && !otherCoparents.length) {
          return {
            label: `${coparent.name} est l'autre parent`,
            cb: (searchedChild) => [
              {
                id: makeRelationshipId(),
                type: 'parent',
                childId: searchedChild,
                parentId: coparent.personId,
              },
            ],
          }
        }

        // Single spouse
        const [spouse, ...otherSpouses] = getSpousesOf(sourcePersonId, { relationships, persons })

        if (spouse && !otherSpouses.length) {
          return {
            label: `${spouse.name} est l'autre parent`,
            cb: (searchedChild) => [
              {
                id: makeRelationshipId(),
                type: 'parent',
                childId: searchedChild,
                parentId: spouse.personId,
              },
            ],
          }
        }
      }
    }
    return null
  }, [pendingRelationshipAction])

  return (
    <TDFModal isOpen={!!pendingRelationshipAction} close={close} placeAtTop>
      <div className='divide-y divider-gray-200'>
        <div className='sm:flex sm:items-start pb-5'>
          <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10'>
            <UserPlusIcon className='h-6 w-6 text-indigo-600' aria-hidden='true' />
          </div>
          <div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
            <Dialog.Title as='h3' className='text-base font-semibold leading-6 text-gray-900'>
              {(() => {
                if (!pendingRelationshipAction) return 'Ajouter un parent'
                switch (pendingRelationshipAction.relationshipAction) {
                  case 'addParent': {
                    return 'Ajouter un père ou une mère'
                  }
                  case 'addChild': {
                    return 'Ajouter un fils ou une fille'
                  }
                  case 'addFriend': {
                    return 'Ajouter un ami ou une connaissance'
                  }
                  case 'addSpouse': {
                    return 'Ajouter un compagne, un époux, ...'
                  }
                }
              })()}
            </Dialog.Title>
            <div className='mt-2'>
              <PersonAutocomplete
                onPersonSelected={(person) => {
                  if (!pendingRelationshipAction) return

                  const { personId, relationshipAction } = pendingRelationshipAction
                  onPersonSelected({
                    selectedPerson: person,
                    sourcePersonId: personId,
                    secondaryRelationshipsCb: otherRelationshipIsAccepted ? otherRelationships?.cb : undefined,
                    relationshipAction,
                  })
                }}
                unselectableIds={unselectableIds}
                className='max-w-xl text-gray-800'
                currentFamilyId={currentFamilyId}
                inCurrentFamilyOnly={inCurrentFamilyOnly}
              />
              {otherRelationships ? (
                <div className='flex items-center justify-between mt-2'>
                  <input
                    type='checkbox'
                    className='mr-1'
                    checked={otherRelationshipIsAccepted}
                    onChange={() => setOtherRelationshipIsAccepted((state) => !state)}
                  />
                  <div className='mx-2 min-w-0 flex-auto'>
                    <p className='text-base'>{otherRelationships.label}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {relativeIdsWithThisRelationship.length ? (
          <div className='pt-5'>
            <div>Actuellement, vous avez indiqué :</div>
            <ul role='list' className='divide-y divide-gray-100'>
              {relativeIdsWithThisRelationship.map(({ personId, relationship }) => {
                const person = persons.find((person) => person.personId === personId)
                if (!person) return null
                return (
                  <li key={personId} className='flex items-center justify-between gap-x-6 py-5'>
                    {person.profilePicUrl ? (
                      <img
                        className='h-12 w-12 flex-none rounded-full bg-gray-50 shadow-md border border-gray-200'
                        src={person.profilePicUrl}
                        alt=''
                      />
                    ) : (
                      <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-500`}>
                        <span className='text-xl font-medium leading-none text-white'>{getInitials(person.name)}</span>
                      </span>
                    )}
                    <div className='min-w-0 flex-auto'>
                      <p className='text-base'>{person.name}</p>
                    </div>
                    <button
                      onClick={() => onRemoveRelationship(relationship.id)}
                      className={`${secondaryButtonStyles} ${smallButtonStyles}`}>
                      <XMarkIcon className={smallButtonIconStyles} />
                      Retirer
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </TDFModal>
  )
}

function getChildrenWithSingleParent(
  sourceParentId: PersonId,
  args: { relationships: RelationshipInTree[]; persons: PersonInTree[] }
) {
  const { relationships } = args
  const childIds = new Set(
    relationships
      .filter((rel): rel is RelationshipInTree & { type: 'parent' } => rel.type === 'parent' && rel.parentId === sourceParentId)
      .map((rel) => rel.childId)
  )

  const childrenWithSingleParent = Array.from(childIds).filter((childId) => {
    const parents = relationships.filter(
      (rel): rel is RelationshipInTree & { type: 'parent' } => rel.type === 'parent' && rel.childId === childId
    )

    return parents.length === 1
  })

  return childrenWithSingleParent
    .map((childId) => args.persons.find((person) => person.personId === childId))
    .filter((item): item is PersonInTree => !!item)
}

function getSpousesOf(sourcePersonId: PersonId, args: { relationships: RelationshipInTree[]; persons: PersonInTree[] }) {
  const spouseRels = args.relationships.filter(
    (rel): rel is RelationshipInTree & { type: 'spouses' } => rel.type === 'spouses' && rel.spouseIds.includes(sourcePersonId)
  )

  const uniqueSpouseIds = new Set<PersonId>()
  for (const spouseRel of spouseRels) {
    const spouseId = spouseRel.spouseIds.find((id) => id !== sourcePersonId)
    if (spouseId) uniqueSpouseIds.add(spouseId)
  }

  return Array.from(uniqueSpouseIds)
    .map((spouseId) => args.persons.find((person) => person.personId === spouseId))
    .filter((item): item is PersonInTree => !!item)
}

function getCoparents(sourcePersonId: PersonId, args: { relationships: RelationshipInTree[]; persons: PersonInTree[] }) {
  const { relationships } = args
  const childIds = new Set(
    relationships
      .filter((rel): rel is RelationshipInTree & { type: 'parent' } => rel.type === 'parent' && rel.parentId === sourcePersonId)
      .map((rel) => rel.childId)
  )

  const coparentIds = new Set<PersonId>()
  for (const childId of childIds) {
    const otherParent = relationships.find(
      (rel): rel is RelationshipInTree & { type: 'parent' } =>
        rel.type === 'parent' && rel.childId === childId && rel.parentId !== sourcePersonId
    )?.parentId

    if (otherParent) coparentIds.add(otherParent)
  }

  return Array.from(coparentIds)
    .map((coparentId) => args.persons.find((person) => person.personId === coparentId))
    .filter((item): item is PersonInTree => !!item)
}
