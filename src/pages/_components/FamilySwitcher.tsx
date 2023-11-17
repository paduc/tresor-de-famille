import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import classNames from 'classnames'
import React, { Fragment } from 'react'
import { ClientOnly } from './ClientOnly'
import { useSession } from './SessionContext'

type FamilySwitcherProps = {}

export const FamilySwitcher = (props: FamilySwitcherProps) => {
  const session = useSession()
  const formRef = React.useRef<HTMLFormElement>(null)

  if (!session.isLoggedIn) return null

  const { userFamilies, currentFamilyId } = session

  if (!userFamilies || !currentFamilyId) return null

  const selected = userFamilies.find(({ familyId }) => familyId === currentFamilyId)!
  // const [selected, setSelected] = useState(userFamilies.find(({ familyId }) => familyId === currentFamilyId)!)

  const handleChange = (newFamily: typeof userFamilies[number]) => {
    // TODO : POST a form to /switchFamily with newFamily id (current url should be in the origin header)
    // TODO create /switchFamily entry point and see
    if (formRef.current !== null) {
      const form = formRef.current

      const inputs = form.getElementsByTagName('input')

      const newFamilyIdInput = Array.from(inputs).find((input) => input.name === 'newFamilyId')

      if (newFamilyIdInput) {
        newFamilyIdInput.value = newFamily.familyId
      }

      form.submit()
    }
  }

  return (
    <div className='max-w-fit'>
      <form method='POST' action='/switchFamily' ref={formRef}>
        <input type='hidden' name='newFamilyId' value={selected.familyId} />
        <ClientOnly>
          <InputWithUrl />
        </ClientOnly>
      </form>
      <Listbox value={selected} onChange={handleChange}>
        {({ open }) => (
          <>
            <Listbox.Label className='sr-only'>Changer de famille</Listbox.Label>
            <div className='relative'>
              <div className='inline-flex divide-x divide-indigo-700 rounded-md shadow-sm'>
                <div className='inline-flex items-center gap-x-1.5 rounded-l-md bg-indigo-600 px-3 py-2 text-white shadow-sm'>
                  <p className='text-sm font-semibold'>Changer d'espace</p>
                </div>
                <Listbox.Button className='inline-flex items-center rounded-l-none rounded-r-md bg-indigo-600 p-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-50'>
                  <span className='sr-only'>Changer de famille</span>
                  <ChevronDownIcon className='h-5 w-5 text-white' aria-hidden='true' />
                </Listbox.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                leave='transition ease-in duration-100'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'>
                <Listbox.Options className='absolute left-0 z-10 mt-2 w-72 origin-top-left divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                  {userFamilies.map((family) => (
                    <Listbox.Option
                      key={family.familyId}
                      className={({ active }) =>
                        classNames(
                          active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                          'cursor-default select-none p-4 text-sm'
                        )
                      }
                      value={family}>
                      {({ selected, active }) => (
                        <div className='flex flex-col'>
                          <div className='flex justify-between'>
                            <p className={selected ? 'font-semibold' : 'font-normal'}>{family.familyName}</p>
                            {selected ? (
                              <span className={active ? 'text-white' : 'text-indigo-600'}>
                                <CheckIcon className='h-5 w-5' aria-hidden='true' />
                              </span>
                            ) : null}
                          </div>
                          <p className={classNames(active ? 'text-indigo-200' : 'text-gray-500', 'mt-2')}>{family.about}</p>
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

function InputWithUrl() {
  return <input type='hidden' name='currentPage' value={window.location.href} />
}
