import React, { Fragment, useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { Combobox, Dialog, Transition } from '@headlessui/react'
import { UUID } from '../../../domain/UUID'

type PersonSearchProps = {
  onPersonSelected: (personId: UUID) => unknown
  open: boolean
  setOpen: (isOpen: boolean) => unknown
}

const people = [
  { id: 1, name: 'Leslie Alexander', url: '#' },
  // More people...
]

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const PersonSearch = ({ onPersonSelected, open, setOpen }: PersonSearchProps) => {
  const [query, setQuery] = useState('')

  const filteredPeople =
    query === ''
      ? []
      : people.filter((person) => {
          return person.name.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <>
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
            <div className='fixed inset-0 bg-white bg-opacity-100 transition-opacity' />
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
                <Combobox onChange={(person: any) => onPersonSelected(person.id)}>
                  <div className='relative'>
                    <MagnifyingGlassIcon
                      className='pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400'
                      aria-hidden='true'
                    />
                    <Combobox.Input
                      className='h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm'
                      placeholder='Search...'
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </div>

                  {filteredPeople.length > 0 && (
                    <Combobox.Options static className='max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800'>
                      {filteredPeople.map((person) => (
                        <Combobox.Option
                          key={person.id}
                          value={person}
                          className={({ active }) =>
                            classNames('cursor-default select-none px-4 py-2', active && 'bg-indigo-600 text-white')
                          }>
                          {person.name}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  )}

                  {query !== '' && filteredPeople.length === 0 && <p className='p-4 text-sm text-gray-500'>No people found.</p>}
                </Combobox>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
