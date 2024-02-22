import React, { useMemo, useState } from 'react'

import { Dialog, RadioGroup, Transition } from '@headlessui/react'
import { CalendarIcon, ChevronLeftIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/20/solid'
import {
  ArrowTopRightOnSquareIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

import { exhaustiveGuard } from '../../../libs/exhaustiveGuard'
import { FaceId } from '../../../domain/FaceId'
import { FamilyId } from '../../../domain/FamilyId'
import { PersonId } from '../../../domain/PersonId'
import { PhotoId } from '../../../domain/PhotoId'
import { ThreadId } from '../../../domain/ThreadId'
import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import {
  linkStyles,
  linkStylesDarkMode,
  primaryButtonStyles,
  secondaryButtonStyles,
  secondaryRedButtonStyles,
  smallButtonStyles,
} from '../../_components/Button'
import { useLoggedInSession } from '../../_components/SessionContext'
import { TDFModal } from '../../_components/TDFModal'
import { usePersonSearch } from '../../_components/usePersonSearch'
import { PersonPageURL } from '../../person/PersonPageURL'
import { PhotoListPageUrl, PhotoListPageUrlWithFamily } from '../../photoList/PhotoListPageUrl'
import { ThreadUrl } from '../../thread/ThreadUrl'
import classNames from 'classnames'

type PhotoFace = {
  faceId: FaceId
} & (
  | {
      stage: 'awaiting-name'
    }
  | {
      stage: 'ignored'
    }
  | {
      stage: 'done'
      personId: PersonId
      name: string
    }
)

export type NewPhotoPageProps = {
  photoUrl: string
  photoId: PhotoId
  isPhotoAuthor: boolean
  familyId: FamilyId
  faces?: PhotoFace[]
  context?:
    | {
        type: 'thread'
        threadId: ThreadId
        editable: boolean
      }
    | { type: 'profile'; profileId: PersonId }
    | {
        type: 'familyPhotoList'
        familyId: FamilyId
      }
  threadsContainingPhoto: {
    title: string
    threadId: ThreadId
    author: {
      name: string
    }
  }[]
  location: {
    isIrrelevant: boolean
    GPSCoords: {
      exif:
        | {
            lat: number
            long: number
          }
        | undefined
      userOption: 'exif' | 'none'
    }
    name: {
      userProvided: string | undefined
      mapbox: {
        exif: string | undefined
      }
      userOption: 'user' | 'mapboxFromExif' | 'none'
    }
  }
  datetime: {
    userOption: 'user' | 'exif' | 'none'
    userProvided: string | undefined
    exifDatetime: string | undefined // from Date.getISO...
  }
}

export const NewPhotoPage = withBrowserBundle(
  ({
    context,
    photoId,
    photoUrl,
    faces,
    familyId,
    isPhotoAuthor,
    threadsContainingPhoto,
    location,
    datetime,
  }: NewPhotoPageProps) => {
    const [selectedFaceForMenu, setSelectedFaceForMenu] = useState<PhotoFace | null>(null)
    const [selectedFaceForPersonSelector, setSelectedFaceForPersonSelector] = useState<PhotoFace | null>(null)

    const [areIgnoredFacesVisible, showIgnoredFaces] = useState<boolean>(false)

    const ignoredFaces = faces?.filter((face) => face.stage === 'ignored') || []
    const annotatedFaces = faces?.filter((face): face is PhotoFace & { stage: 'done' } => face.stage === 'done') || []
    const pendingFaces = faces?.filter((face) => face.stage === 'awaiting-name') || []

    function makeBackURL(context: NewPhotoPageProps['context']) {
      if (!context) return PhotoListPageUrl

      const contextType = context.type
      switch (contextType) {
        case 'thread':
          return ThreadUrl(context.threadId, context.editable, photoId)
        case 'profile':
          return PersonPageURL(context.profileId)
        case 'familyPhotoList':
          return PhotoListPageUrlWithFamily(context.familyId)
        default:
          exhaustiveGuard(contextType)
      }
    }

    return (
      <div className='relative'>
        <FaceContextualMenu
          selectedFace={selectedFaceForMenu}
          close={() => {
            setSelectedFaceForMenu(null)
          }}
          photoId={photoId}
          gotoPersonSelector={(selectedFace) => {
            setSelectedFaceForMenu(null)
            setSelectedFaceForPersonSelector(selectedFace)
          }}
        />
        <SelectPersonForFacePanel
          selectedFace={selectedFaceForPersonSelector}
          close={() => {
            setSelectedFaceForPersonSelector(null)
          }}
          photoId={photoId}
          familyId={familyId}
        />
        <div className='bg-black absolute overflow-y-scroll overflow-x-hidden top-0 bottom-0 left-0 right-0 w-[100vw] h-[100vh]'>
          <a href={`${makeBackURL(context)}`} className='absolute top-2 right-2 text-gray-300'>
            <XMarkIcon className='cursor-pointer h-8 w-8' />
          </a>
          {context ? (
            <a href={`${makeBackURL(context)}`} className='absolute top-1 left-1 text-gray-300'>
              <ChevronLeftIcon className='cursor-pointer h-10 w-10' />
            </a>
          ) : null}
          <div className='grid place-items-center h-[95svh]'>
            <img src={photoUrl} className='max-w-full max-h-[95svh]' />
          </div>
          <div className='bg-white bg-opacity-5 border-t border-gray-200/50'>
            <div className='text-gray-200 px-3 pb-28 w-full sm:max-w-lg mx-auto divide divide-y divide-solid divide-gray-200/50'>
              <div className='py-3 flex flex-col gap-y-1'>
                <PhotoDate datetime={datetime} photoId={photoId} />
                <PhotoLocation location={location} photoId={photoId} />
              </div>
              {faces ? (
                <>
                  {faces.length ? (
                    <div className='py-3'>
                      <ul className='flex flex-wrap gap-2 pt-3'>
                        {annotatedFaces.map((face) => (
                          <li key={`photoface${face.faceId}`} className='text-gray-300 mr-2 mb-2'>
                            <div
                              onClick={() => setSelectedFaceForMenu(face)}
                              className='flex flex-col items-center cursor-pointer'>
                              <PhotoBadge faceId={face.faceId} photoId={photoId} className={``} altText={face.name || ''} />
                              <div className='mt-1 max-w-[80px] truncate'>{face.name}</div>
                            </div>
                          </li>
                        ))}
                        {pendingFaces.map((face) => (
                          <li
                            key={`photoface${face.faceId}`}
                            className='text-gray-500 mr-2 mb-2 flex flex-col items-center relative'
                            onClick={() => setSelectedFaceForMenu(face)}>
                            <PhotoBadge faceId={face.faceId} photoId={photoId} className={'cursor-pointer'} />
                            <div className='absolute top-11 right-0 h-4 w-4 rounded-full bg-blue-600 -ring-2 ring-1  ring-white'>
                              <div className='text-white text-xs text-center'>?</div>
                            </div>
                          </li>
                        ))}
                        {areIgnoredFacesVisible
                          ? ignoredFaces.map((face) => (
                              <li
                                key={`photoface${face.faceId}`}
                                className='text-gray-500 mr-2 mb-2 flex flex-col items-center relative'
                                onClick={() => setSelectedFaceForMenu(face)}>
                                <PhotoBadge faceId={face.faceId} photoId={photoId} className={`grayscale cursor-pointer`} />
                                <div className='absolute top-11 right-0 h-4 w-4 rounded-full bg-red-600 -ring-2 ring-1 ring-white'>
                                  <div className='text-white text-center'>
                                    <XMarkIcon className='h-[3.5] w-[3.5]' />
                                  </div>
                                </div>
                              </li>
                            ))
                          : null}
                      </ul>
                      {pendingFaces.length ? (
                        <div>
                          <form method='POST'>
                            <input type='hidden' name='action' value='ignoreAllOtherFaces' />
                            {pendingFaces.map(({ faceId }) => (
                              <input key={`ignore_${faceId}`} type='hidden' name='faceId' value={faceId} />
                            ))}
                            <button
                              className={`${linkStylesDarkMode} text-red-500 hover:text-red-600 mt-4`}
                              onClick={() => showIgnoredFaces(false)}>
                              <EyeSlashIcon className='h-6 w-6 mr-1' />
                              Ignorer tous les {annotatedFaces.length ? 'autres' : ''} visages
                            </button>
                          </form>
                        </div>
                      ) : null}
                      {ignoredFaces.length ? (
                        <>
                          {areIgnoredFacesVisible ? (
                            <button className={`${linkStylesDarkMode} mt-4`} onClick={() => showIgnoredFaces(false)}>
                              <EyeSlashIcon className='h-6 w-6 mr-1' />
                              Masquer les visages ignorés
                            </button>
                          ) : (
                            <button className={`${linkStylesDarkMode} mt-4`} onClick={() => showIgnoredFaces(true)}>
                              <EyeIcon className='h-6 w-6 mr-1' />
                              Afficher les visages ignorés
                            </button>
                          )}
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className='py-5 italic'>En attente de la détection de visage (penser a recharger la page).</div>
              )}
              {threadsContainingPhoto?.length ? (
                <div className='px-1 py-6'>
                  <div className='text-gray-300'>Cette photo est présente dans: </div>
                  <ul className='text-white'>
                    {threadsContainingPhoto.map((thread) => (
                      <li
                        className='py-2 px-4 -mx-4 hover:bg-white/10 rounded-none sm:rounded-lg'
                        key={`thread_${thread.threadId}_contains_photo`}>
                        <a href={`${ThreadUrl(thread.threadId)}#${photoId}`}>
                          <div>{thread.title}</div>
                          <div className='italic'>par {thread.author.name}</div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {isPhotoAuthor ? (
                <form
                  method='POST'
                  action='/delete-photo'
                  onSubmit={(e) => {
                    const confirmed = confirm('Êtes-vous sur de vouloir supprimer cette photo ?')
                    if (!confirmed) e.preventDefault()
                  }}>
                  <input type='hidden' name='photoId' value={photoId} />
                  <button
                    type='submit'
                    className={`mt-4 inline-flex items-center cursor-pointer text-red-500 hover:text-red-600 text-md`}>
                    <TrashIcon className='h-6 w-6 mr-1' />
                    Supprimer cette photo
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

const SHOW_EDIT_LOCATION = true
const SHOW_EDIT_TIME = true

const PhotoLocation = ({ location, photoId }: { photoId: PhotoId; location: NewPhotoPageProps['location'] }) => {
  const { GPSCoords, name } = location
  const [isModalOpen, setModalOpen] = useState(false)

  const [gpsOption, setGPSOption] = useState<NewPhotoPageProps['location']['GPSCoords']['userOption']>(
    location.GPSCoords.userOption
  )
  const [isIrrelevant, setIrrelevance] = useState(location.isIrrelevant)

  const exifGPS = GPSCoords.exif
  const Wrapper = ({ children }: { children: JSX.Element }) => {
    switch (GPSCoords.userOption) {
      case 'exif': {
        if (exifGPS) {
          return (
            <a
              className='text-gray-300 hover:text-gray-200'
              target='_blank'
              href={`https://www.openstreetmap.org/?mlat=${exifGPS.lat}&mlon=${exifGPS.long}`}>
              {children}
            </a>
          )
        }
      }
    }

    return <div className='text-gray-300'>{children}</div>
  }

  const locationName = useMemo(() => {
    switch (name.userOption) {
      case 'user': {
        if (name.userProvided) {
          return name.userProvided
        }
      }
      case 'mapboxFromExif': {
        if (name.mapbox.exif) {
          return name.mapbox.exif
        }
      }
    }
    return ''
  }, [location.name.userOption])

  const [locationNameFieldValue, setLocationNameFieldValue] = useState(locationName)

  const nameOption: NewPhotoPageProps['location']['name']['userOption'] =
    location.name.mapbox.exif && locationNameFieldValue === location.name.mapbox.exif ? 'mapboxFromExif' : 'user'

  return (
    <>
      <div className='inline-flex justify-start items-center gap-4'>
        {isIrrelevant || (!exifGPS && !locationName) ? (
          <button onClick={() => setModalOpen(true)} className=' hover:text-gray-200 italic cursor-pointer'>
            Ajouter un lieu
          </button>
        ) : (
          <>
            <Wrapper>
              <div className='inline-flex justify-start items-center gap-1'>
                <MapPinIcon className='h-5 w-5 mr-1' />
                <div>{locationName || 'Lieu de la photo'}</div>
              </div>
            </Wrapper>
            {SHOW_EDIT_LOCATION ? (
              <button onClick={() => setModalOpen(true)} className=' hover:text-gray-200'>
                <PencilSquareIcon className='h-5 w-5' />
              </button>
            ) : null}
          </>
        )}
      </div>
      <TDFModal title='Lieu de la photo' close={() => setModalOpen(false)} isOpen={isModalOpen}>
        <form method='POST'>
          <input type='hidden' name='action' value='setLocation' />
          <input type='hidden' name='photoId' value={photoId} />
          <input type='hidden' name='nameOption' value={nameOption} />
          <div className='flex flex-col gap-y-4 divide-y divide-gray-200'>
            <div className={`${isIrrelevant ? 'invisible' : 'visible'} sm:col-span-3 space-y-2 pt-4`}>
              <label htmlFor='locationName' className='block text-sm font-medium leading-6 text-gray-900'>
                Nom du lieu à afficher
              </label>
              <input
                type='text'
                name='locationName'
                value={locationNameFieldValue}
                onChange={(e) => setLocationNameFieldValue(e.target.value)}
                placeholder={location.name.mapbox.exif || 'ex: La maison familiale du Soleil'}
                className='block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
              />
              {nameOption === 'mapboxFromExif' ? (
                <p id='isRelevant-description' className='text-gray-500 text-sm inline-flex'>
                  <InformationCircleIcon className='h-5 w-5 mr-1' /> Ce nom de lieu a été obtenu a partir des coordonnées GPS.
                </p>
              ) : null}
            </div>
            {exifGPS ? (
              <div className={`${isIrrelevant ? 'invisible' : 'visible'} sm:col-span-3 space-y-2 pt-4`}>
                <details>
                  <summary className='block text-sm font-medium leading-6 text-gray-900 cursor-pointer'>
                    Coordonnées géographiques
                  </summary>

                  <RadioGroup value={gpsOption} className='mt-2' name='gpsOption' onChange={setGPSOption}>
                    <RadioGroup.Label className='sr-only'>Coordonnées GPS</RadioGroup.Label>
                    <div className='space-y-2'>
                      {exifGPS ? (
                        <RadioGroup.Option
                          value={'exif'}
                          className={({ active }) =>
                            classNames(
                              active ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-gray-300',
                              'relative block cursor-pointer rounded-lg border bg-white px-2 py-4 shadow-sm focus:outline-none sm:flex sm:justify-between'
                            )
                          }>
                          {({ active, checked }) => (
                            <>
                              <span className='flex items-center'>
                                <span
                                  className={classNames(
                                    checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300',
                                    'h-4 w-4 rounded-full border flex items-center justify-center flex-none mr-2'
                                  )}
                                  aria-hidden='true'>
                                  <span className='rounded-full bg-white w-1.5 h-1.5' />
                                </span>
                                <span className='flex flex-col text-sm'>
                                  <RadioGroup.Label as='span' className='font-medium text-gray-900'>
                                    Utiliser les metadonnées de la photo (GPS de l'appareil)
                                  </RadioGroup.Label>
                                  <RadioGroup.Description as='span' className='text-gray-500'>
                                    <span className='block sm:inline'>
                                      <span className='text-gray-600'>
                                        <a
                                          className='text-gray-600 hover:text-gray-800 inline-flex items-center'
                                          target='_blank'
                                          href={`https://www.openstreetmap.org/?mlat=${exifGPS.lat}&mlon=${exifGPS.long}`}>
                                          voir le lieu sur un plan
                                          <ArrowTopRightOnSquareIcon className='h-4 w-4 ml-1' />
                                        </a>
                                      </span>
                                    </span>
                                  </RadioGroup.Description>
                                </span>
                              </span>
                              <span
                                className={classNames(
                                  active ? 'border' : 'border-2',
                                  checked ? 'border-indigo-600' : 'border-transparent',
                                  'pointer-events-none absolute -inset-px rounded-lg'
                                )}
                                aria-hidden='true'
                              />
                            </>
                          )}
                        </RadioGroup.Option>
                      ) : null}
                      <RadioGroup.Option
                        value={'none'}
                        className={({ active }) =>
                          classNames(
                            active ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-gray-300',
                            'relative block cursor-pointer rounded-lg border bg-white px-2 py-4 shadow-sm focus:outline-none sm:flex sm:justify-between'
                          )
                        }>
                        {({ active, checked }) => (
                          <>
                            <span className='flex items-center'>
                              <span
                                className={classNames(
                                  checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300',
                                  'h-4 w-4 rounded-full border flex items-center justify-center flex-none mr-2'
                                )}
                                aria-hidden='true'>
                                <span className='rounded-full bg-white w-1.5 h-1.5' />
                              </span>
                              <span className='flex flex-col text-sm gap-y-1'>
                                <RadioGroup.Label as='span' className='font-medium text-gray-900'>
                                  Aucune localisation géographique
                                </RadioGroup.Label>
                              </span>
                            </span>
                            <span
                              className={classNames(
                                active ? 'border' : 'border-2',
                                checked ? 'border-indigo-600' : 'border-transparent',
                                'pointer-events-none absolute -inset-px rounded-lg'
                              )}
                              aria-hidden='true'
                            />
                          </>
                        )}
                      </RadioGroup.Option>
                    </div>
                  </RadioGroup>
                </details>
              </div>
            ) : null}
            <div className='inline-flex pt-4'>
              <div className='relative flex items-start'>
                <div className='flex h-6 items-center'>
                  <input
                    id='isIrrelevant'
                    aria-describedby='isIrrelevant-description'
                    name='isIrrelevant'
                    type='checkbox'
                    checked={isIrrelevant}
                    className='h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600'
                    onChange={(e) => {
                      setIrrelevance((state) => !state)
                    }}
                  />
                </div>
                <div className='ml-3'>
                  <label htmlFor='isIrrelevant' className='text-sm font-medium leading-6 text-red-700'>
                    Masquer le lieu
                  </label>
                  <p id='isIrrelevant-description' className='text-gray-500 text-sm'>
                    Un lieu n'est pas pertinent pour cette photo
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className='space-x-2 mt-6'>
            <button className={`${primaryButtonStyles}`}>Valider</button>
            <button
              className={`${linkStyles}`}
              onClick={(e) => {
                e.preventDefault()
                setModalOpen(false)
              }}>
              Annuler
            </button>
          </div>
        </form>
      </TDFModal>
    </>
  )
}

const PhotoDate = ({ datetime, photoId }: { photoId: PhotoId; datetime: NewPhotoPageProps['datetime'] }) => {
  const { userOption, userProvided, exifDatetime } = datetime
  const exifDateAsText =
    exifDatetime && new Intl.DateTimeFormat('fr', { dateStyle: 'long', timeStyle: 'medium' }).format(new Date(exifDatetime))

  const [isModalOpen, setModalOpen] = useState(false)
  const [dateAsText, setDateAsText] = useState(
    userOption === 'user' ? userProvided : userOption === 'exif' ? exifDateAsText : ''
  )
  const [isIrrelevant, setIrrelevance] = useState(userOption === 'none')

  const dateOption = useMemo(() => {
    if (isIrrelevant) {
      return 'none'
    }

    if (exifDateAsText && dateAsText === exifDateAsText) {
      return 'exif'
    }

    if (!dateAsText) {
      if (exifDateAsText) {
        return 'exif'
      }

      return 'none'
    }

    return 'user'
  }, [isIrrelevant, dateAsText, exifDateAsText])

  return (
    <>
      <div className='inline-flex justify-start items-center gap-4'>
        {dateOption === 'none' ? (
          <button onClick={() => setModalOpen(true)} className=' hover:text-gray-200 italic cursor-pointer'>
            Ajouter une date
          </button>
        ) : (
          <>
            <div className='inline-flex justify-start items-center gap-1'>
              <CalendarIcon className='h-5 w-5 mr-1' />
              {dateOption === 'exif' && exifDatetime ? <>Le {exifDateAsText}</> : null}
              {dateOption === 'user' && userProvided ? <>{userProvided}</> : null}
            </div>
            {SHOW_EDIT_TIME ? (
              <button onClick={() => setModalOpen(true)} className=' hover:text-gray-200'>
                <PencilSquareIcon className='h-5 w-5' />
              </button>
            ) : null}
          </>
        )}
      </div>
      <TDFModal title='Date de la photo' close={() => setModalOpen(false)} isOpen={isModalOpen}>
        <form method='POST'>
          <input type='hidden' name='action' value='setDate' />
          <input type='hidden' name='photoId' value={photoId} />
          <input type='hidden' name='dateOption' value={dateOption} />
          <div className='flex flex-col gap-y-4 divide-y divide-gray-200'>
            <div className={`${isIrrelevant ? 'invisible' : 'visible'} sm:col-span-3 space-y-2 pt-4`}>
              <label htmlFor='dateAsText' className='block text-sm font-medium leading-6 text-gray-900'>
                Date à afficher
              </label>
              <input
                type='text'
                name='dateAsText'
                value={dateAsText}
                onChange={(e) => setDateAsText(e.target.value)}
                placeholder={exifDateAsText || 'ex: 21/03/2024 ou Avril 1986'}
                className='block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
              />
              {dateAsText === exifDateAsText && dateAsText ? (
                <p id='dateAsText-description' className='text-gray-500 text-sm inline-flex'>
                  <InformationCircleIcon className='h-5 w-5 mr-1' />
                  Cette date provient des métadonnées de la photo.
                </p>
              ) : null}
              {exifDateAsText && dateAsText === '' ? (
                <p id='dateAsText-description' className='text-gray-500 text-sm inline-flex'>
                  <InformationCircleIcon className='h-5 w-5 mr-1' />
                  La date issue des métadonnées de la photo sera utilisée.
                </p>
              ) : null}
            </div>

            <div className='inline-flex pt-4'>
              <div className='relative flex items-start'>
                <div className='flex h-6 items-center'>
                  <input
                    id='isIrrelevant'
                    aria-describedby='isIrrelevant-description'
                    name='isIrrelevant'
                    type='checkbox'
                    checked={isIrrelevant}
                    className='h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600'
                    onChange={(e) => {
                      setIrrelevance((state) => !state)
                    }}
                  />
                </div>
                <div className='ml-3'>
                  <label htmlFor='isIrrelevant' className='text-sm font-medium leading-6 text-red-700'>
                    Masquer la date
                  </label>
                  <p id='isIrrelevant-description' className='text-gray-500 text-sm'>
                    Il n'y a pas de date pertinente pour cette photo.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className='space-x-2 mt-6'>
            <button className={`${primaryButtonStyles}`}>Valider</button>
            <button
              className={`${linkStyles}`}
              onClick={(e) => {
                e.preventDefault()
                setModalOpen(false)
              }}>
              Annuler
            </button>
          </div>
        </form>
      </TDFModal>
    </>
  )
}

type PhotoBadgeProps = {
  photoId: PhotoId
  faceId: FaceId
  className?: string
  altText?: string
}
const PhotoBadge = ({ photoId, className, faceId, altText }: PhotoBadgeProps) => {
  return (
    <img
      // src='https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80'
      src={`/photo/${photoId}/face/${faceId}`}
      className={`inline-block rounded-full h-14 w-14 ring-2 ring-white shadow-sm'
      } ${className || ''}`}
      alt={altText}
    />
  )
}

type SelectPersonForFacePanelProps = {
  close: () => unknown
  selectedFace: PhotoFace | null
  photoId: PhotoId
  familyId: FamilyId
}
function SelectPersonForFacePanel({ close, selectedFace, photoId, familyId }: SelectPersonForFacePanelProps) {
  return (
    <Transition.Root show={!!selectedFace} as={React.Fragment}>
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
          <div className='flex min-h-full items-start justify-center p-4 text-center'>
            <Transition.Child
              as={React.Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'>
              <Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6'>
                {selectedFace ? (
                  <div className='mt-4'>
                    <div className=''>
                      <div className='flex justify-center'>
                        <PhotoBadge
                          photoId={photoId}
                          faceId={selectedFace.faceId}
                          className={`m-2 h-[80px] w-[80px] hover:cursor-default`}
                        />
                      </div>
                      <div className='flex justify-center text-center text-lg font-semibold leading-6 text-gray-900 mb-5'>
                        Qui est la personne derrière ce visage ?
                      </div>
                      <div className=''>
                        <PersonAutocomplete
                          className='max-w-xl text-gray-800'
                          faceId={selectedFace.faceId}
                          selectedPersonName={selectedFace.stage === 'done' ? selectedFace.name : undefined}
                          currentFamilyId={familyId}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className='absolute right-0 top-0 pr-4 pt-4 sm:block'>
                  <button
                    type='button'
                    className='rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                    onClick={close}>
                    <span className='sr-only'>Close</span>
                    <XMarkIcon className='h-6 w-6' aria-hidden='true' />
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

type FaceContextualMenuProps = {
  // isOpen: boolean
  close: () => unknown
  selectedFace: PhotoFace | null
  photoId: PhotoId
  gotoPersonSelector: (selectedFace: PhotoFace) => unknown
}
function FaceContextualMenu({ close, selectedFace, photoId, gotoPersonSelector }: FaceContextualMenuProps) {
  return (
    <TDFModal isOpen={!!selectedFace} close={close}>
      <div className='mt-8'>
        {selectedFace && selectedFace.stage === 'done' ? (
          <>
            <div className='flex justify-center'>
              <PhotoBadge
                photoId={photoId}
                faceId={selectedFace.faceId}
                className={`m-2 h-[80px] w-[80px] hover:cursor-default`}
              />
            </div>
            <div className='flex justify-center text-lg font-semibold leading-6 text-gray-900 mb-5'>{selectedFace.name}</div>
            <a
              href={PersonPageURL(selectedFace.personId!)}
              className={`mb-4 ${primaryButtonStyles.replace(/inline\-flex/g, '')} block w-full text-center`}>
              Aller à la page profil
            </a>
            <button
              onClick={() => gotoPersonSelector(selectedFace)}
              className={`mb-4 ${secondaryRedButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
              Ce n'est pas {selectedFace.name}
            </button>
            <button
              onClick={close}
              className={`mb-4 ${secondaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
              Annuler
            </button>
          </>
        ) : null}
        {selectedFace && selectedFace.stage === 'awaiting-name' ? (
          <>
            <div className='flex justify-center'>
              <PhotoBadge
                photoId={photoId}
                faceId={selectedFace.faceId}
                className={`m-2 h-[80px] w-[80px] hover:cursor-default`}
              />
            </div>
            <button
              onClick={() => gotoPersonSelector(selectedFace)}
              className={`mb-4 ${primaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
              Nommer cette personne
            </button>
            <IgnoreFaceButton faceId={selectedFace.faceId} />
            <button
              onClick={close}
              className={`mb-4 ${secondaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
              Annuler
            </button>
          </>
        ) : null}
        {selectedFace && selectedFace.stage === 'ignored' ? (
          <>
            <div className='flex justify-center'>
              <PhotoBadge
                photoId={photoId}
                faceId={selectedFace.faceId}
                className={`m-2 h-[80px] w-[80px] hover:cursor-default`}
              />
            </div>
            <button
              onClick={() => gotoPersonSelector(selectedFace)}
              className={`mb-4 ${primaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
              Nommer cette personne
            </button>
            <button
              onClick={close}
              className={`mb-4 ${secondaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
              Annuler
            </button>
          </>
        ) : null}
      </div>
    </TDFModal>
  )
}

function IgnoreFaceButton({ faceId }: { faceId: FaceId }) {
  return (
    <form method='POST' className=''>
      <input type='hidden' name='action' value='ignoreFamilyMemberFaceInPhoto' />
      <input type='hidden' name='faceId' value={faceId} />
      <div className='flex items-center'>
        <button type='submit' className={`mb-4 ${secondaryRedButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
          Ignorer ce visage
        </button>
      </div>
    </form>
  )
}

type SearchPersonHitDTO = {
  objectID: string
  name: string
  bornOn?: string
  sex?: 'M' | 'F'
  familyId: FamilyId
}

type PersonAutocompleteProps = {
  faceId: FaceId
  className?: string
  selectedPersonName?: string
  currentFamilyId: FamilyId
}

const PersonAutocomplete = ({ faceId, className, selectedPersonName, currentFamilyId }: PersonAutocompleteProps) => {
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
    <div className={`relative ${className || ''}`}>
      <div className='w-full min-w-screen overflow-hidden shadow-sm border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
        <input
          role='combobox'
          type='text'
          aria-expanded='true'
          aria-autocomplete='list'
          name='newName'
          autoFocus
          defaultValue={selectedPersonName || ''}
          className='block w-full resize-none border-0 py-3 px-4 focus:ring-0 text-base'
          onChange={(event) => setQuery(event.target.value.trim())}
        />
      </div>
      <div>
        <form method='POST'>
          <input type='hidden' name='action' value='submitFamilyMemberName' />
          <input type='hidden' name='faceId' value={faceId} />
          <ul role='list' className='divide-y divide-gray-100'>
            {query.length > 0 && !firstHitStartsWithQuery(hits, query) ? <NewPersonFromQuery query={query} /> : null}
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
                      <div className='mt-1 w-40 text-xs text-gray-500'>
                        Cette personne est dans{' '}
                        {getFamilyName(hit.familyId) ? `${getFamilyName(hit.familyId)}` : 'une autre famille'}.
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
                <button
                  type='submit'
                  name='existingFamilyMemberId'
                  value={hit.objectID}
                  className={`${primaryButtonStyles} ${smallButtonStyles}`}>
                  Sélectionner
                </button>
              </li>
            ))}
            {query.length > 0 && firstHitStartsWithQuery(hits, query) ? <NewPersonFromQuery query={query} /> : null}
          </ul>
        </form>
        {/* <a
          href='#'
          className='flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0'>
          Voir plus
        </a> */}
      </div>
    </div>
  )
}
function NewPersonFromQuery({ query }: { query: string }) {
  return (
    <li key={`hit_new_object`} className='flex items-center justify-between gap-x-6 py-5'>
      <div className='flex min-w-0 gap-x-4'>
        {/* <img className='h-12 w-12 flex-none rounded-full bg-gray-50' src={person.imageUrl} alt='' /> */}
        <div className='min-w-0 flex-auto'>
          <p className=''>{query}</p>
          <p className='mt-1 truncate text-xs leading-5 text-gray-500'>Nouvelle personne à créer</p>
        </div>
      </div>
      <button type='submit' name='newFamilyMemberName' value={query} className={`${primaryButtonStyles} ${smallButtonStyles}`}>
        Créer
      </button>
    </li>
  )
}

function firstHitStartsWithQuery(hits: SearchPersonHitDTO[], query: string) {
  return hits[0]?.name.toLowerCase().startsWith(query.toLowerCase())
}
