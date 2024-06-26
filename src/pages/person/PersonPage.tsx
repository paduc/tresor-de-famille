import * as React from 'react'

import { CameraIcon, CheckIcon, ChevronRightIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { FaceId } from '../../domain/FaceId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'
import { PhotoId } from '../../domain/PhotoId.js'
import { ThreadId } from '../../domain/ThreadId.js'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle.js'
import { buttonIconStyles, primaryButtonStyles, secondaryButtonStyles } from '../_components/Button.js'
import { TDFModal } from '../_components/TDFModal.js'
import { ThreadList, ThreadListProps } from '../_components/ThreadList.js'
import { AppLayout } from '../_components/layout/AppLayout.js'
import { PhotoPageUrl } from '../photo/PhotoPageUrl.js'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type PersonPageProps = {
  person: {
    personId: PersonId
    name: string
    profilePicUrl: string | null
    birthDate: string | undefined
  }
  photos: { photoId: PhotoId; url: string }[]
  alternateProfilePics: {
    faceId: FaceId
    photoId: PhotoId
    url: string
  }[]
  threadsTheyAppearIn: ThreadListProps
  threadsTheyWrote: ThreadListProps
}

const INITIAL_PHOTO_COUNT = 6
const PHOTO_COUNT_STEP = 6

export const PersonPage = withBrowserBundle(
  ({ person, photos, alternateProfilePics, threadsTheyAppearIn, threadsTheyWrote }: PersonPageProps) => {
    const [isProfilePicOpen, openProfilePic] = React.useState<boolean>(false)
    const closeProfilePic = React.useCallback(() => openProfilePic(false), [])
    const [photosToDisplayCount, setPhotosToDisplayCount] = useState<number>(INITIAL_PHOTO_COUNT)

    const [isNameChangerOpen, openNameChanger] = React.useState<boolean>(false)
    const closeNameChanger = React.useCallback(() => openNameChanger(false), [])

    const [isBirthdayChangerOpen, openBirthdayChanger] = React.useState<boolean>(false)
    const closeBirthdayChanger = React.useCallback(() => openBirthdayChanger(false), [])

    return (
      <AppLayout>
        <div className='my-5 bg-white p-6'>
          <div className='md:flex md:items-center md:justify-between md:space-x-5'>
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
                {person.birthDate ? (
                  <p className='text-sm font-medium text-gray-500'>
                    Naissance: <time dateTime={person.birthDate}>{person.birthDate}</time>{' '}
                    <button className='align-middle mb-1' onClick={() => openBirthdayChanger(true)}>
                      <PencilSquareIcon className='text-gray-500 hover:text-gray-700 h-4 w-4 ml-1' />
                    </button>
                  </p>
                ) : null}
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

        {/* {userFamilies.length > 1 ? (
        <div className='my-5 bg-white p-6'>
          Ce profil fait partie de {person.familyName}.
          {sharedWithFamilies.length > 0 ? (
            <div>
              Cette personne est aussi présente dans{' '}
              <ul className='inline-block'>
                {sharedWithFamilies.map((family, index) => (
                  <li className='inline-block mr-1' key={`family_${family.familyId}`}>
                    {family.familyName}
                    {sharedWithFamilies.length >= 2 && index === sharedWithFamilies.length - 2 ? (
                      <span className='ml-1'>et</span>
                    ) : null}
                    {sharedWithFamilies.length >= 2 && index >= 0 && index < sharedWithFamilies.length - 2 ? (
                      <span className=''>, </span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <span className='-ml-1'>.</span>
            </div>
          ) : null}
        </div>
      ) : null} */}

        {photos.length > 0 ? (
          <div className='bg-white p-6'>
            <h3 className='text-lg font-medium leading-6 text-gray-900'>Photos où {person.name} apparaît</h3>

            {/*<InlinePhotoUploadBtn
          formAction='/add-photo.html'
          hiddenFields={{ familyId: person.familyId }}
          formKey={`uploadFamily${person.familyId}`}>
          <span className='inline-block sm:text-sm cursor-pointer font-medium  text-indigo-600 hover:text-indigo-500'>
            Ajouter une nouvelle photo
          </span>
    </InlinePhotoUploadBtn>*/}

            <ul
              role='list'
              className='grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:max-w-4xl mt-3'>
              {photos.slice(0, photosToDisplayCount).map((photo) => (
                <li key={photo.photoId} className='relative'>
                  <div className='group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100'>
                    <img src={photo.url} alt='' className='pointer-events-none object-cover group-hover:opacity-75' />
                    <a
                      href={`${PhotoPageUrl(photo.photoId)}?profileId=${person.personId}`}
                      className='absolute inset-0 focus:outline-none'>
                      <span className='sr-only'>Voir la photo</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
            {photos.length > photosToDisplayCount ? (
              <div className='mt-3'>
                <button
                  className={`${secondaryButtonStyles}`}
                  onClick={() => {
                    setPhotosToDisplayCount((count) => count + Math.min(PHOTO_COUNT_STEP, photos.length - count))
                  }}>
                  Afficher plus de photos
                </button>
              </div>
            ) : photos.length === photosToDisplayCount ? (
              <div className='mt-3'>
                <button
                  className={`${secondaryButtonStyles}`}
                  onClick={() => {
                    setPhotosToDisplayCount(INITIAL_PHOTO_COUNT)
                  }}>
                  Afficher moins
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {threadsTheyAppearIn.length > 0 ? (
          <div className='bg-white py-6 px-2 mt-4'>
            <h3 className='text-lg font-medium leading-6 ml-4 text-gray-900'>Histoires et anecdotes avec {person.name}</h3>

            <ThreadList threads={threadsTheyAppearIn} foldAtCount={3} />
          </div>
        ) : null}

        {threadsTheyWrote.length > 0 ? (
          <div className='bg-white py-6 px-2 mt-4'>
            <h3 className='text-lg font-medium leading-6 ml-4 text-gray-900'>
              Histoires et anecdotes écrites par {person.name}
            </h3>

            <ThreadList threads={threadsTheyWrote} foldAtCount={3} />
          </div>
        ) : null}

        <ProfilePictureSelector
          isOpen={isProfilePicOpen}
          close={closeProfilePic}
          personId={person.personId}
          faceList={alternateProfilePics}
          name={person.name}
          currentFaceUrl={person.profilePicUrl}
        />

        <NameChanger isOpen={isNameChangerOpen} close={closeNameChanger} personId={person.personId} name={person.name} />
        <BirthdayChanger
          isOpen={isBirthdayChangerOpen}
          close={closeBirthdayChanger}
          personId={person.personId}
          birthday={person.birthDate}
        />
      </AppLayout>
    )
  }
)

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
  personId: PersonId
  faceList: {
    faceId: FaceId
    photoId: PhotoId
    url: string
  }[]
}
function ProfilePictureSelector({ faceList, isOpen, close, name, currentFaceUrl, personId }: ProfilePictureSelectorProps) {
  return (
    <TDFModal isOpen={isOpen} close={close} title={`Photo de profil de ${name}`}>
      <ul className='divide-y divide-gray-100'>
        {faceList.map(({ url, faceId, photoId }) => {
          const isSelectedFace = url === currentFaceUrl

          if (isSelectedFace) {
            return (
              <li className={` relative flex justify-between gap-x-6 px-4 py-5  sm:px-6 lg:px-8`} key={`face_${url}`}>
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
    </TDFModal>
  )
}

type NameChangerProps = {
  name: string
  isOpen: boolean
  close: () => void
  personId: PersonId
}
function NameChanger({ isOpen, close, name, personId }: NameChangerProps) {
  const formRef = React.useRef<HTMLFormElement>(null)

  const onConfirm = () => {
    if (formRef.current !== null) {
      formRef.current.submit()
    }
  }

  return (
    <TDFModal isOpen={isOpen} close={close} title='Changer le nom'>
      <form method='POST' ref={formRef} className='w-full'>
        <input type='hidden' name='personId' value={personId} />
        <input type='hidden' name='action' value='changeName' />
        <input type='hidden' name='oldName' value={name} />
        <div className='w-full min-w-screen overflow-hidden shadow-sm border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
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
    </TDFModal>
  )
}

type BirthdayChangerProps = {
  birthday: string | undefined
  isOpen: boolean
  close: () => void
  personId: PersonId
}
function BirthdayChanger({ isOpen, close, birthday, personId }: BirthdayChangerProps) {
  const formRef = React.useRef<HTMLFormElement>(null)
  const [birthdayAsText, setBirthdayAsText] = useState(birthday || '')

  const onConfirm = () => {
    if (formRef.current !== null) {
      formRef.current.submit()
    }
  }

  return (
    <TDFModal isOpen={isOpen} close={close} title='Changer la date de naissance'>
      <form method='POST' ref={formRef} className='w-full'>
        <input type='hidden' name='personId' value={personId} />
        <input type='hidden' name='action' value='changeBirthday' />
        <div className='w-full min-w-screen overflow-hidden shadow-sm border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
          <input
            type='text'
            name='birthdayAsText'
            value={birthdayAsText}
            className='block w-full resize-none border-0 py-3 px-4 focus:ring-0 text-base'
            autoFocus
            onChange={(e) => setBirthdayAsText(e.target.value)}
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
    </TDFModal>
  )
}
