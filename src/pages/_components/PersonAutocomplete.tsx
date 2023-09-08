import { Combobox } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/20/solid'
import React, { useState } from 'react'
import { UUID } from '../../domain/UUID'
import { usePersonSearch } from './usePersonSearch'

type SearchPersonHitDTO = {
  objectID: string
  name: string
  bornOn?: string
  sex?: 'M' | 'F'
}

type PersonAutocompleteProps = {
  onPersonSelected: (person: { type: 'known'; personId: UUID } | { type: 'unknown'; name: string }) => unknown
  className?: string
  presentPerson?: { name: string; personId: UUID }
}

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const PersonAutocomplete = ({ onPersonSelected, className, presentPerson }: PersonAutocompleteProps) => {
  const [query, setQuery] = useState('Jo')

  const index = usePersonSearch()
  if (index === null) return null

  const [hits, setHits] = React.useState<SearchPersonHitDTO[]>([])

  React.useEffect(() => {
    if (!index) return

    const fetchResults = async () => {
      if (query === '') {
        setHits([])
        return
      }
      const { hits } = await index.search(query)
      setHits(hits as SearchPersonHitDTO[])
    }

    fetchResults()
  }, [index, setHits, query])

  return (
    <Combobox defaultValue={presentPerson?.name || ''} onChange={(person: any) => onPersonSelected(person)}>
      <div className={`relative sm:ml-0 ${className || ''}`}>
        <div className='overflow-hidden shadow-sm border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
          <label htmlFor='familyMemberName' className='sr-only'>
            Nom complet
          </label>
          <Combobox.Input
            className='block w-full resize-none border-0 py-3 px-4 focus:ring-0 text-lg'
            placeholder='...'
            autoFocus
            onChange={(event) => setQuery(event.target.value.trim())}
          />
        </div>

        <Combobox.Options className='max-h-72 w-full shadow-sm border border-gray-200 border-t-none bg-white absolute top-full z-10 scroll-py-2 overflow-y-auto text-lg text-gray-800 divide-y divide-gray-100'>
          {query.length > 0 && !firstHitStartsWithQuery(hits, query) ? <NewPersonFromQuery query={query} /> : null}
          {hits.map((hit) => (
            <Combobox.Option
              key={`hit_${hit.objectID}`}
              value={{ type: 'known', personId: hit.objectID }}
              className={({ active }) =>
                classNames('cursor-default select-none py-3 px-4', active && 'bg-indigo-600 text-white')
              }>
              {({ active, selected }) => (
                <>
                  <div className='sm:flex'>
                    <div className={classNames('truncate', selected && 'font-semibold')}>{hit.name}</div>
                    {hit.bornOn ? (
                      <div
                        className={classNames('sm:ml-2 truncate text-gray-500', active ? 'text-indigo-200' : 'text-gray-500')}>
                        {hit.sex === 'M' ? 'né le ' : 'née le '}
                        {hit.bornOn}
                      </div>
                    ) : (
                      ''
                    )}
                  </div>

                  {selected && (
                    <span
                      className={classNames(
                        'absolute inset-y-0 right-0 flex items-center pr-4',
                        active ? 'text-white' : 'text-indigo-600'
                      )}>
                      <CheckIcon className='h-5 w-5' aria-hidden='true' />
                    </span>
                  )}
                </>
              )}
            </Combobox.Option>
          ))}
          {query.length > 0 && firstHitStartsWithQuery(hits, query) ? <NewPersonFromQuery query={query} /> : null}
        </Combobox.Options>
      </div>
    </Combobox>
  )
}
function NewPersonFromQuery({ query }: { query: string }) {
  return (
    <Combobox.Option
      key={`hit_new_object`}
      value={{ type: 'unknown', name: query }}
      className={({ active }) =>
        classNames('cursor-default select-none text-base py-2 px-4', active && 'bg-indigo-600 text-white')
      }>
      {({ active, selected }) => (
        <>
          <div className='sm:flex'>
            <div className={classNames('truncate italic', selected && 'font-semibold')}>Nouvelle personne: {query}</div>
          </div>

          {selected && (
            <span
              className={classNames(
                'absolute inset-y-0 right-0 flex items-center pr-4',
                active ? 'text-white' : 'text-indigo-600'
              )}>
              <CheckIcon className='h-5 w-5' aria-hidden='true' />
            </span>
          )}
        </>
      )}
    </Combobox.Option>
  )
}

function firstHitStartsWithQuery(hits: SearchPersonHitDTO[], query: string) {
  return hits[0]?.name.toLowerCase().startsWith(query.toLowerCase())
}
