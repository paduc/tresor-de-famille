import * as React from 'react'

import { Dialog, Transition } from '@headlessui/react'
import {
  CameraIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { UUID } from '../../domain'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { InlinePhotoUploadBtn } from '../_components/InlinePhotoUploadBtn'
import { AppLayout } from '../_components/layout/AppLayout'
import { buttonIconStyles, primaryButtonStyles, secondaryButtonStyles, smallButtonStyles } from '../_components/Button'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type PersonPageProps = {
  person: {
    personId: UUID
    name: string
    profilePicUrl: string | null
  }
  photos: { photoId: UUID; url: string }[]
  alternateProfilePics: {
    faceId: UUID
    photoId: UUID
    url: string
  }[]
}

export const PersonPage = withBrowserBundle(({ person, photos, alternateProfilePics }: PersonPageProps) => {
  const [isProfilePicOpen, openProfilePic] = React.useState<boolean>(false)
  const closeProfilePic = React.useCallback(() => openProfilePic(false), [])

  const [isNameChangerOpen, openNameChanger] = React.useState<boolean>(false)
  const closeNameChanger = React.useCallback(() => openNameChanger(false), [])

  return (
    <AppLayout>
      <div className='my-5 bg-white p-6'>
        <div className=' md:flex md:items-center md:justify-between md:space-x-5'>
          <div className='flex items-start space-x-5'>
            <div className='flex-shrink-0'>
              <div className='relative'>
                {person.profilePicUrl ? (
                  <div className='flex flex-col items-center'>
                    <img
                      className='h-36 w-36 flex-none rounded-full bg-gray-50 shadow-md border border-gray-200'
                      src={person.profilePicUrl}
                      alt={`Photo de ${person.name}`}
                    />
                    {alternateProfilePics.length > 1 ? (
                      <button
                        type='button'
                        onClick={() => openProfilePic(true)}
                        className={`mt-2 inline-flex items-center cursor-pointer text-indigo-600 hover:text-indigo-500 text-md`}>
                        <CameraIcon className={`h-6 w-6 mr-1`} />
                        Changer
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <span className={`inline-flex h-36 w-36 items-center justify-center rounded-full bg-gray-500`}>
                    <span className='text-5xl font-medium leading-none text-white'>{getInitials(person.name)}</span>
                  </span>
                )}
              </div>
            </div>
            {/*
          Use vertical padding to simulate center alignment when both lines of text are one line,
          but preserve the same layout if the text wraps without making the image jump around.
        */}
            <div className='pt-1.5'>
              <h1 className='text-2xl font-bold text-gray-900'>
                {person.name}{' '}
                <button className='align-middle mb-1' onClick={() => openNameChanger(true)}>
                  <PencilSquareIcon className='text-gray-500 hover:text-gray-700 h-6 w-6 ml-2' />
                </button>
              </h1>
              {/* <p className='text-sm font-medium text-gray-500'>
                Applied for{' '}
                <a href='#' className='text-gray-900'>
                  Front End Developer
                </a>{' '}
                on <time dateTime='2020-08-25'>August 25, 2020</time>
              </p> */}
            </div>
          </div>
          <div className='mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3'>
            {/* <button
              type='button'
              className='inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
              Voir son arbre
            </button> */}
          </div>
        </div>
      </div>

      <div className='bg-white p-6'>
        <h3 className='text-lg font-medium leading-6 text-gray-900'>Photos de {person.name}</h3>

        <InlinePhotoUploadBtn formAction='/add-photo.html'>
          <span className='inline-block sm:text-sm cursor-pointer font-medium  text-indigo-600 hover:text-indigo-500'>
            Ajouter une nouvelle photo
          </span>
        </InlinePhotoUploadBtn>

        <ul role='list' className='grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 mt-3'>
          {photos.map((photo) => (
            <li key={photo.photoId} className='relative'>
              <div className='group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100'>
                <img src={photo.url} alt='' className='pointer-events-none object-cover group-hover:opacity-75' />
                <a href={`/photo/${photo.photoId}` + '/photo.html'} className='absolute inset-0 focus:outline-none'>
                  <span className='sr-only'>Voir la photo</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ProfilePictureSelector
        isOpen={isProfilePicOpen}
        close={closeProfilePic}
        personId={person.personId}
        faceList={alternateProfilePics}
        name={person.name}
        currentFaceUrl={person.profilePicUrl}
      />

      <NameChanger isOpen={isNameChangerOpen} close={closeNameChanger} personId={person.personId} name={person.name} />
    </AppLayout>
  )
})

function getInitials(name: string): string {
  // Split the name into words using whitespace or hyphen as separators
  const words = name.split(/\s|-/)

  // Initialize an empty string to store the initials
  let initials = ''

  // Iterate through the words and append the first character of each word to the initials string
  for (const word of words) {
    if (word.length > 0) {
      initials += word[0].toUpperCase()
    }
  }

  return initials.substring(0, 3)
}

type ProfilePictureSelectorProps = {
  name: string
  isOpen: boolean
  close: () => void
  currentFaceUrl: string | null
  personId: UUID
  faceList: {
    faceId: UUID
    photoId: UUID
    url: string
  }[]
}
function ProfilePictureSelector({ faceList, isOpen, close, name, currentFaceUrl, personId }: ProfilePictureSelectorProps) {
  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as='div' className='relative z-50' onClose={close}>
        <Transition.Child
          as={React.Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'>
          <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          <div className='flex sm:min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <Transition.Child
              as={React.Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'>
              <Dialog.Panel className='relative transform overflow-visible rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6'>
                <Dialog.Title as='h3' className='text-lg font-semibold leading-6 text-gray-900 mr-5'>
                  <div>Photo de profil de {name}</div>
                </Dialog.Title>
                <div className='absolute right-0 top-0 pr-4 pt-4 sm:block'>
                  <button
                    type='button'
                    className='rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                    onClick={close}>
                    <span className='sr-only'>Close</span>
                    <XMarkIcon className='h-6 w-6' aria-hidden='true' />
                  </button>
                </div>
                <div className='mt-8'>
                  <ul className='divide-y divide-gray-100'>
                    {faceList.map(({ url, faceId, photoId }) => {
                      const isSelectedFace = url === currentFaceUrl

                      if (isSelectedFace) {
                        return (
                          <li
                            className={` relative flex justify-between gap-x-6 px-4 py-5  sm:px-6 lg:px-8`}
                            key={`face_${url}`}>
                            <div className='flex min-w-0 gap-x-4'>
                              <img className='h-20 w-20 flex-none rounded-full bg-gray-50' src={url} alt='' />
                            </div>
                            <div className='flex shrink-0 items-center gap-x-4'>
                              <div className=' flex flex-col items-end'>Sélectionnée</div>
                              <CheckIcon className='h-5 w-5 flex-none text-green-600' aria-hidden='true' />
                            </div>
                          </li>
                        )
                      }

                      return (
                        <li
                          className={` hover:bg-gray-50
                            relative  px-4 py-5  sm:px-6 lg:px-8`}
                          key={`face_${url}`}>
                          <form method='POST' className='flex justify-between gap-x-6'>
                            <input type='hidden' name='faceId' value={faceId} />
                            <input type='hidden' name='photoId' value={photoId} />
                            <input type='hidden' name='personId' value={personId} />
                            <input type='hidden' name='action' value='selectNewProfilePic' />
                            <button type='submit' className=' flex min-w-0 gap-x-4 cursor-pointer'>
                              <img className='h-20 w-20 flex-none rounded-full bg-gray-50' src={url} alt='' />
                            </button>
                            <button type='submit' className='flex shrink-0 items-center gap-x-4 cursor-pointer'>
                              <div className=' text-indigo-700 flex flex-col items-end'>Sélectionner</div>
                              <ChevronRightIcon className='h-5 w-5 flex-none text-indigo-700' aria-hidden='true' />
                            </button>
                          </form>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

type NameChangerProps = {
  name: string
  isOpen: boolean
  close: () => void
  personId: UUID
}
function NameChanger({ isOpen, close, name, personId }: NameChangerProps) {
  const formRef = React.useRef<HTMLFormElement>(null)

  const onConfirm = () => {
    if (formRef.current !== null) {
      formRef.current.submit()
    }
  }

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as='div' className='relative z-50' onClose={close}>
        <Transition.Child
          as={React.Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'>
          <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          <div className='flex sm:min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <Transition.Child
              as={React.Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'>
              <Dialog.Panel className='relative transform overflow-visible rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6'>
                <Dialog.Title as='h3' className='text-lg font-semibold leading-6 text-gray-900 mr-5'>
                  <div>Changer le nom</div>
                </Dialog.Title>
                <div className='absolute right-0 top-0 pr-4 pt-4 sm:block'>
                  <button
                    type='button'
                    className='rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                    onClick={close}>
                    <span className='sr-only'>Close</span>
                    <XMarkIcon className='h-6 w-6' aria-hidden='true' />
                  </button>
                </div>
                <div className='mt-4'>
                  <form method='POST' ref={formRef} className=''>
                    <input type='hidden' name='personId' value={personId} />
                    <input type='hidden' name='action' value='changeName' />
                    <input type='hidden' name='oldName' value={name} />
                    <div className='overflow-hidden shadow-sm border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
                      <input
                        type='text'
                        name='newName'
                        defaultValue={name}
                        className='block w-full resize-none border-0 py-3 px-4 focus:ring-0 text-base'
                        autoFocus
                        onKeyDown={(e) => {
                          switch (e.key) {
                            case 'Enter':
                              onConfirm()
                              break
                            case 'Escape':
                              close()
                              break
                          }
                        }}
                      />
                    </div>
                    <div className='flex items-start mt-5'>
                      <button type='submit' className={`${primaryButtonStyles} text-sm `}>
                        <CheckIcon className={`${buttonIconStyles}`} />
                        Valider
                      </button>
                      <a className={`${secondaryButtonStyles} text-sm ml-1`} onClick={() => close()}>
                        <XMarkIcon className={`${buttonIconStyles}`} />
                        Annuler
                      </a>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
