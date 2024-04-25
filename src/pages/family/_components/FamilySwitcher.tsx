import * as React from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { FamilyId } from '../../../domain/FamilyId.js'
import { secondaryButtonStyles, smallButtonIconStyles, smallButtonStyles } from '../../_components/Button.js'
import { useLoggedInSession } from '../../_components/SessionContext.js'
import { FamilyPageURLWithFamily } from '../FamilyPageURL.js'
import { classNames } from '../FamilyPage.js'

type FamilySwitcherProps = { currentFamilyId: FamilyId }
export const FamilySwitcher = ({ currentFamilyId }: FamilySwitcherProps) => {
  const { userFamilies } = useLoggedInSession()
  if (!userFamilies || userFamilies.length < 2 || !currentFamilyId) return null

  const selected = userFamilies.find(({ familyId }) => familyId === currentFamilyId)

  if (!selected) return null

  const handleChange = (newFamily: typeof userFamilies[number]) => {
    if (newFamily.familyId === selected.familyId) return

    if (typeof window !== 'undefined') {
      window.location.href = FamilyPageURLWithFamily(newFamily.familyId)
    }
  }

  return (
    <div className='inline-flex items-center'>
      <div className='text-gray-600 mr-3'>
        Vous regardez l'arbre de <b>{selected.familyName}</b>
      </div>
      <Listbox value={selected} onChange={handleChange}>
        {({ open }) => (
          <>
            <Listbox.Label className='sr-only'>Changer de famille</Listbox.Label>
            <div className='relative'>
              <div className='inline-flex divide-x divide-indigo-700 rounded-md shadow-sm'>
                <Listbox.Button className={`${secondaryButtonStyles} ${smallButtonStyles}`}>
                  <ChevronDownIcon className={`${smallButtonIconStyles}`} aria-hidden='true' />
                  Changer
                  <span className='sr-only'>Changer de famille</span>
                </Listbox.Button>
              </div>

              <Transition
                show={open}
                as={React.Fragment}
                leave='transition ease-in duration-100'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'>
                <Listbox.Options className='absolute -left-2 z-50 mt-2 w-64 origin-top-left divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                  {userFamilies.map((family) => (
                    <Listbox.Option
                      key={family.familyId}
                      className={({ active }) =>
                        classNames(active ? 'bg-indigo-100' : '', 'cursor-default rounded-md select-none p-4 text-sm')
                      }
                      value={family}>
                      {({ selected, active }) => (
                        <div className={`${selected ? '' : 'cursor-pointer'} flex flex-col`}>
                          <div className='flex justify-between'>
                            <p className={selected ? 'font-semibold' : 'font-normal'}>{family.familyName}</p>
                            {selected ? (
                              <span className={'text-indigo-600'}>
                                <CheckIcon className='h-5 w-5' aria-hidden='true' />
                              </span>
                            ) : null}
                          </div>
                          <p className={classNames('mt-2 text-gray-500')}>{family.about}</p>
                        </div>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  )
}
