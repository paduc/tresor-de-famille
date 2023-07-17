import { Combobox, Dialog, Transition } from '@headlessui/react'
import { CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import React, { Fragment, useState } from 'react'
import { UUID } from '../../../domain/UUID'
import { usePersonSearch } from '../../_components/usePersonSearch'

type SearchPersonHitDTO = {
  objectID: string
  name: string
  bornOn?: string
  sex?: 'M' | 'F'
}

type PersonSearchProps = {
  onPersonSelected: (personId: UUID) => unknown
  open: boolean
  setOpen: (isOpen: boolean) => unknown
  personFaceUrl?: string
}

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const PersonSearch = ({ onPersonSelected, open, setOpen, personFaceUrl }: PersonSearchProps) => {
  const [query, setQuery] = useState('')

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
    <Transition.Root show={open} as={Fragment} afterLeave={() => setQuery('')} appear>
      <Dialog as='div' className='relative z-50' onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'>
          <div className='fixed inset-0 bg-white bg-opacity-100 lg:bg-opacity-50 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20'>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'>
            <Dialog.Panel className='mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all'>
              <Combobox onChange={(person: any) => onPersonSelected(person.objectID)}>
                <div className='relative'>
                  {personFaceUrl ? <img src={personFaceUrl} className='h-12 w-12 absolute left-0 top-0' /> : null}
                  <MagnifyingGlassIcon
                    className={`pointer-events-none absolute ${
                      personFaceUrl ? 'left-16' : 'left-4'
                    } top-3.5 h-5 w-5 text-gray-400 right-`}
                    aria-hidden='true'
                  />
                  <Combobox.Input
                    className={`h-12 w-full border-0 bg-transparent ${
                      personFaceUrl ? 'pl-24' : 'pl-11'
                    } pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm`}
                    placeholder='Search...'
                    onChange={(event) => setQuery(event.target.value.trim())}
                  />
                </div>

                {hits.length > 0 && (
                  <Combobox.Options className='max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800'>
                    {hits.map((hit) => (
                      <Combobox.Option
                        key={`hit_${hit.objectID}`}
                        value={hit}
                        className={({ active }) =>
                          classNames('cursor-default select-none px-4 py-2', active && 'bg-indigo-600 text-white')
                        }>
                        {({ active, selected }) => (
                          <>
                            <div className='sm:flex'>
                              <div className={classNames('truncate', selected && 'font-semibold')}>{hit.name}</div>
                              {hit.bornOn ? (
                                <div
                                  className={classNames(
                                    'sm:ml-2 truncate text-gray-500',
                                    active ? 'text-indigo-200' : 'text-gray-500'
                                  )}>
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
                  </Combobox.Options>
                )}

                {query !== '' && hits.length === 0 && (
                  <p className='p-4 text-sm text-gray-500'>Cette personne n'est pas encore connu ?!</p>
                )}
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
