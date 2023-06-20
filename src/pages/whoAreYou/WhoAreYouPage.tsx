import * as React from 'react'
import { Combobox } from '@headlessui/react'

import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { useSearchClient } from '../_components/useSearchClient'
import { AppLayout } from '../_components/layout/AppLayout'
import { useState } from 'react'
import { CheckIcon } from '@heroicons/react/20/solid'
import { SuccessError } from '../_components/SuccessError'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type WhoAreYouPageProps = {
  error?: string
}

export const WhoAreYouPage = withBrowserBundle(({ error }: WhoAreYouPageProps) => {
  const { index } = useSearchClient()

  const [hits, setHits] = useState<any[]>([])
  const [query, setQuery] = useState<string>('')
  const [selectedPerson, setSelectedPerson] = useState<any | undefined>()

  React.useEffect(() => {
    if (!index) return

    const fetchResults = async () => {
      console.log('Fetching results')
      const { hits } = await index.search(query)
      console.log(`got ${hits.length} results from index`)
      setHits(hits)
    }

    fetchResults()
  }, [index, setHits, query])

  return (
    <AppLayout>
      <div className='bg-white h-screen	'>
        <div className='max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <p className='mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl'>Qui es-tu ?</p>
            <p className='max-w-xl mt-5 mx-auto text-xl text-gray-500'>
              Eh oui, on n'accède pas au trésor aussi facilement. <br />
              Il faut montrer patte blanche en se désignant dans l'arbre généalogique ! Logique !!!
            </p>
            <SuccessError error={error} />
            {index ? (
              <Combobox as='div' value={selectedPerson} onChange={setSelectedPerson}>
                <div className='relative mt-3 max-w-lg mx-auto'>
                  <Combobox.Input
                    className='w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm'
                    placeholder='Ton nom'
                    onChange={(event) => setQuery(event.target.value)}
                    displayValue={(selectedPerson: any) => selectedPerson?.name}
                  />

                  {hits.length > 0 && (
                    <Combobox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                      {hits.map((hit) => (
                        <Combobox.Option
                          key={hit.objectID}
                          value={hit}
                          className={({ active }) =>
                            classNames(
                              'relative cursor-default select-none py-2 pl-3 pr-9',
                              active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                            )
                          }>
                          {({ active, selected }) => (
                            <>
                              <div className='sm:flex'>
                                <div className={classNames('truncate', selected && 'font-semibold')}>{hit.name}</div>
                                <div
                                  className={classNames(
                                    'sm:ml-2 truncate text-gray-500',
                                    active ? 'text-indigo-200' : 'text-gray-500'
                                  )}>
                                  {hit.sex === 'M' ? 'né le ' : 'née le '}
                                  {hit.bornOn}
                                </div>
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
                    </Combobox.Options>
                  )}
                </div>
              </Combobox>
            ) : (
              <div>Pas dispo</div>
            )}
            <form method='POST'>
              <input type='hidden' name='selectedPersonId' defaultValue={selectedPerson?.objectID} />
              <button
                type='submit'
                className='inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 mt-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                disabled={!selectedPerson}>
                Valider
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  )
})
