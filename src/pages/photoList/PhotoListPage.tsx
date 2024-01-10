import * as React from 'react'

import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { FamilyId } from '../../domain/FamilyId'
import { PhotoId } from '../../domain/PhotoId'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import {
  buttonIconStyles,
  linkStyles,
  primaryButtonStyles,
  secondaryButtonStyles,
  smallButtonIconStyles,
  smallButtonStyles,
} from '../_components/Button'
import { InlinePhotoUploadBtn } from '../_components/InlinePhotoUploadBtn'
import { useSession } from '../_components/SessionContext'
import { SuccessError } from '../_components/SuccessError'
import { AppLayout } from '../_components/layout/AppLayout'
import { PhotoIcon } from '../photo/PhotoPage/PhotoIcon'
import { PhotoListPageUrlWithFamily } from './PhotoListPageUrl'
import { Multiupload } from './Multiupload'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type PhotoListProps = {
  success?: string
  error?: string
  photos: {
    photoId: PhotoId
    url: string
  }[]
  currentFamilyId: FamilyId
}

export const PhotoListPage = withBrowserBundle(({ error, success, photos, currentFamilyId }: PhotoListProps) => {
  const session = useSession()

  if (!session.isLoggedIn) return <div />

  const { userFamilies } = session

  const photoPageUrl = (photo: PhotoListProps['photos'][number]) => `/photo/${photo.photoId}/photo.html`
  return (
    <AppLayout>
      {userFamilies.length > 1 ? (
        <div className='bg-white p-6 my-3'>
          <FamilySwitcher currentFamilyId={currentFamilyId} />
        </div>
      ) : null}
      <div className='bg-white p-6'>
        <SuccessError success={success} error={error} />
        {!photos.length ? (
          <div className='max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8'>
            <div className='text-center'>
              <svg
                className='mx-auto h-24 w-24 text-gray-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                aria-hidden='true'>
                <path
                  vectorEffect='non-scaling-stroke'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z'
                />
              </svg>
              <p className='mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl'>
                Pas de photos ?!
              </p>
              <p className='max-w-xl mt-5 mx-auto text-xl text-gray-500'>Lancez-vous en en envoyant une !</p>
              <InlinePhotoUploadBtn
                formAction='/add-photo.html'
                hiddenFields={{ familyId: currentFamilyId }}
                formKey={`uploadFamily${currentFamilyId}`}>
                <span className={`mt-4 ${primaryButtonStyles} ${smallButtonStyles}`}>
                  <PhotoIcon className={`${smallButtonIconStyles}`} aria-hidden='true' />
                  Ajouter une photo
                </span>
              </InlinePhotoUploadBtn>
            </div>
          </div>
        ) : (
          <>
            <h3 className='text-lg font-medium leading-6 text-gray-900'>Photos</h3>
            <Multiupload familyId={currentFamilyId}>
              {(open) => (
                <span onClick={open} className={`${linkStyles} text-base`}>
                  Ajouter des nouvelles photos
                </span>
              )}
            </Multiupload>
            {/* <InlinePhotoUploadBtn
              formAction='/add-photo.html'
              hiddenFields={{ familyId: currentFamilyId }}
              formKey={`uploadFamily${currentFamilyId}`}>
              <span className={`${linkStyles} text-base`}>Ajouter une nouvelle photo</span>
            </InlinePhotoUploadBtn> */}

            <ul
              role='list'
              className='grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 mt-3'>
              {photos.map((photo) => (
                <li key={photo.photoId} className='relative'>
                  <div className='group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100'>
                    <img src={photo.url} alt='' className='pointer-events-none object-cover group-hover:opacity-75' />
                    <a
                      href={photoPageUrl(photo) + `?photoListForFamilyId=${currentFamilyId}`}
                      className='absolute inset-0 focus:outline-none'>
                      <span className='sr-only'>Voir la photo</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
            <div className='mt-5'>
              <Multiupload familyId={currentFamilyId}>
                {(open) => (
                  <span onClick={open} className={`${primaryButtonStyles} ${smallButtonStyles}`}>
                    <PhotoIcon className={`${smallButtonIconStyles}`} aria-hidden='true' />
                    Ajouter des nouvelles photos
                  </span>
                )}
              </Multiupload>
              {/* <InlinePhotoUploadBtn
                formAction='/add-photo.html'
                hiddenFields={{ familyId: currentFamilyId }}
                formKey={`uploadFamily${currentFamilyId}`}>
                <span className={`${primaryButtonStyles} ${smallButtonStyles}`}>
                  <PhotoIcon className={`${smallButtonIconStyles}`} aria-hidden='true' />
                  Ajouter une nouvelle photo
                </span>
              </InlinePhotoUploadBtn> */}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
})

type FamilySwitcherProps = { currentFamilyId: FamilyId }

const FamilySwitcher = ({ currentFamilyId }: FamilySwitcherProps) => {
  const session = useSession()
  const formRef = React.useRef<HTMLFormElement>(null)

  if (!session.isLoggedIn) return null

  const { userFamilies } = session

  if (!userFamilies || userFamilies.length < 2 || !currentFamilyId) return null

  const selected = userFamilies.find(({ familyId }) => familyId === currentFamilyId)!

  if (!selected) return null

  const handleChange = (newFamily: typeof userFamilies[number]) => {
    if (newFamily.familyId === selected.familyId) return

    if (typeof window !== 'undefined') {
      window.location.href = PhotoListPageUrlWithFamily(newFamily.familyId)
    }
  }

  return (
    <div className='max-w-fit'>
      <div className='inline-flex items-center'>
        <div className='mr-3'>Vous regardez les photos de {selected.familyName}</div>
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
                  <Listbox.Options className='absolute -right-2 z-50 mt-2 w-64 origin-top-right divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
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
    </div>
  )
}
