import * as React from 'react'
import { useState } from 'react'
import { FamilyId } from '../../../domain/FamilyId.js'
import { PersonId } from '../../../domain/PersonId.js'
import { primaryButtonStyles, smallButtonStyles } from '../../_components/Button.js'
import { useLoggedInSession } from '../../_components/SessionContext.js'
import { usePersonSearch } from '../../_components/usePersonSearch.js'

type SearchPersonHitDTO = {
  objectID: PersonId
  name: string
  bornOn?: string
  sex?: 'M' | 'F'
  familyId: FamilyId
}
type PersonAutocompleteProps = {
  onPersonSelected: (person: { type: 'known'; personId: PersonId } | { type: 'unknown'; name: string }) => unknown
  className?: string
  presentPerson?: { name: string; personId: PersonId }
  unselectableIds?: PersonId[]
  currentFamilyId: FamilyId
  inCurrentFamilyOnly?: boolean
}

export const PersonAutocomplete = ({
  onPersonSelected,
  className,
  presentPerson,
  unselectableIds,
  currentFamilyId,
  inCurrentFamilyOnly,
}: PersonAutocompleteProps) => {
  const [query, setQuery] = useState('')
  const index = usePersonSearch()
  const { userFamilies } = useLoggedInSession()
  function getFamilyName(familyId: FamilyId) {
    return userFamilies.find((f) => f.familyId === familyId)?.familyName
  }

  const [hits, setHits] = React.useState<SearchPersonHitDTO[]>([])

  React.useEffect(() => {
    if (!index) return

    const fetchResults = async () => {
      const trimmedQuery = query.trim()
      if (trimmedQuery === '') {
        setHits([])
        return
      }
      const { hits } = (await index.search(
        trimmedQuery,
        inCurrentFamilyOnly ? { filters: `familyId:${currentFamilyId}` } : {}
      )) as {
        hits: SearchPersonHitDTO[]
      }
      const selectableHits = unselectableIds ? hits.filter((hit) => !unselectableIds.includes(hit.objectID)) : hits
      setHits(selectableHits as SearchPersonHitDTO[])
    }

    fetchResults()
  }, [index, setHits, query])

  const handlePersonSelected = (person: { type: 'known'; personId: PersonId } | { type: 'unknown'; name: string }) => {
    setQuery('')
    onPersonSelected(person)
  }

  return (
    <div className={`relative ${className || ''}`}>
      <div className='w-full min-w-screen overflow-hidden shadow-sm border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
        <input
          role='combobox'
          type='text'
          aria-expanded='true'
          aria-autocomplete='list'
          name='newName'
          autoFocus
          value={query}
          className='block w-full resize-none border-0 py-3 px-4 focus:ring-0 text-base'
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div>
        <ul role='list' className='divide-y divide-gray-100'>
          {query.length > 0 && !firstHitStartsWithQuery(hits, query) ? (
            <NewPersonFromQuery query={query} onPersonSelected={handlePersonSelected} />
          ) : null}
          {hits.map((hit) => (
            <li key={`hit_${hit.objectID}`} className='flex items-center justify-between gap-x-6 py-5'>
              <div className='flex min-w-0 gap-x-4'>
                {/* <img className='h-12 w-12 flex-none rounded-full bg-gray-50' src={person.imageUrl} alt='' /> */}
                <div className='min-w-0 flex-auto'>
                  <p className=''>{hit.name}</p>
                  {hit.bornOn ? (
                    <p className='mt-1 truncate text-xs leading-5 text-gray-500'>
                      {hit.sex === 'F' ? 'née le ' : 'né le '}
                      {hit.bornOn}
                    </p>
                  ) : (
                    ''
                  )}
                  {hit.familyId !== currentFamilyId ? (
                    <div className='mt-1 w-60 text-xs text-gray-500'>
                      Cette personne est dans{' '}
                      {getFamilyName(hit.familyId) ? `${getFamilyName(hit.familyId)}` : 'une autre famille'}.
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              </div>
              <button
                name='existingFamilyMemberId'
                value={hit.objectID}
                onClick={() => handlePersonSelected({ type: 'known', personId: hit.objectID as PersonId })}
                className={`${primaryButtonStyles} ${smallButtonStyles}`}>
                Sélectionner
              </button>
            </li>
          ))}
          {query.length > 0 && firstHitStartsWithQuery(hits, query) ? (
            <NewPersonFromQuery query={query} onPersonSelected={handlePersonSelected} />
          ) : null}
        </ul>
      </div>
    </div>
  )
}
function NewPersonFromQuery({
  query,
  onPersonSelected,
}: {
  query: string
  onPersonSelected: (person: { type: 'unknown'; name: string }) => unknown
}) {
  return (
    <li key={`hit_new_object`} className='flex items-center justify-between gap-x-6 py-5'>
      <div className='flex min-w-0 gap-x-4'>
        {/* <img className='h-12 w-12 flex-none rounded-full bg-gray-50' src={person.imageUrl} alt='' /> */}
        <div className='min-w-0 flex-auto'>
          <p className=''>{query}</p>
          <p className='mt-1 truncate text-xs leading-5 text-gray-500'>Nouvelle personne à créer</p>
        </div>
      </div>
      <button
        onClick={() => onPersonSelected({ type: 'unknown', name: query })}
        className={`${primaryButtonStyles} ${smallButtonStyles}`}>
        Créer
      </button>
    </li>
  )
}
function firstHitStartsWithQuery(hits: SearchPersonHitDTO[], query: string) {
  return hits[0]?.name.toLowerCase().startsWith(query.toLowerCase())
}
