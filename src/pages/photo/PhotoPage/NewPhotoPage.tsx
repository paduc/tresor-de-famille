import React, { useCallback, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { Combobox, Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { CheckIcon, TrashIcon } from '@heroicons/react/24/outline'
import { UUID } from '../../../domain/UUID'
import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import {
  buttonIconStyles,
  primaryButtonStyles,
  secondaryButtonStyles,
  secondaryRedButtonStyles,
  smallButtonStyles,
} from '../../_components/Button'
import { SessionContext } from '../../_components/SessionContext'
import { TDFModal } from '../../_components/TDFModal'
import { PhotoListPageUrl } from '../../listPhotos/PhotoListPageUrl'
import { PersonPageURL } from '../../person/PersonPageURL'
import { usePersonSearch } from '../../_components/usePersonSearch'

type PhotoFace = {
  faceId: UUID
} & (
  | {
      stage: 'awaiting-name'
    }
  | {
      stage: 'ignored'
    }
  | {
      stage: 'done'
      personId: UUID
      name: string
    }
)

export type NewPhotoPageProps = {
  photoUrl: string
  photoId: UUID
  caption?: string
  faces: PhotoFace[]
  context?: {
    type: 'thread'
    threadId: UUID
  }
  updated?: boolean
}

export const NewPhotoPage = withBrowserBundle(({ context, caption, photoId, photoUrl, faces, updated }: NewPhotoPageProps) => {
  const session = React.useContext(SessionContext)

  const [selectedFaceForMenu, setSelectedFaceForMenu] = useState<PhotoFace | null>(null)
  const [selectedFaceForPersonSelector, setSelectedFaceForPersonSelector] = useState<PhotoFace | null>(null)

  const [hasCaptionChanged, setCaptionChanged] = useState<boolean>(false)

  const handleCaptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.value !== caption) setCaptionChanged(true)
      else setCaptionChanged(false)
    },
    [caption]
  )

  if (!session.isLoggedIn)
    return (
      <div>
        Vous ne devriez pas être là <a href='/login.html'>Me connecter</a>
      </div>
    )

  const ignoredFaces = faces.filter((face) => face.stage === 'ignored')
  const annotatedFaces = faces.filter((face): face is PhotoFace & { stage: 'done' } => face.stage === 'done')
  const pendingFaces = faces.filter((face) => face.stage === 'awaiting-name')

  return (
    <div className='relative'>
      <ContextualMenu
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
      />
      <div className='bg-black absolute overflow-y-scroll overflow-x-hidden top-0 bottom-0 left-0 right-0 w-[100vw] h-[100vh]'>
        <a
          href={`${context ? getThreadUrl(context.threadId) : PhotoListPageUrl}`}
          className='absolute top-2 right-2 text-gray-300'>
          <XMarkIcon className='cursor-pointer h-8 w-8' />
        </a>
        <div className='grid place-items-center h-[95svh]'>
          <img src={photoUrl} className='max-w-full max-h-[95svh]' />
        </div>
        <div className='bg-white bg-opacity-5 border-t border-gray-200/50'>
          <div className='text-gray-200 px-3 py-4 pb-28 w-full sm:max-w-lg mx-auto divide divide-y divide-solid divide-gray-200/50'>
            <div className='pb-1'>
              <form method='POST' className='relative'>
                <input type='hidden' name='action' value='addCaption' />
                <div className='overflow-hidden pb-5'>
                  <label htmlFor='caption' className='sr-only'>
                    Ajouter une légende...
                  </label>
                  <TextareaAutosize
                    name='caption'
                    minRows={1}
                    className='block w-full bg-none bg-transparent resize-none border-0 p-0 text-white focus:ring-0 focus:border-0 placeholder:text-gray-300 pb-3'
                    placeholder='Ajouter une légende...'
                    defaultValue={caption}
                    onChange={handleCaptionChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.altKey && !e.ctrlKey) {
                        e.preventDefault()
                        // @ts-ignore
                        e.target.form.submit()
                      }
                    }}
                  />
                </div>
                <button
                  className={`mt-3 ${primaryButtonStyles} ${smallButtonStyles} absolute bottom-0 right-0 ${
                    hasCaptionChanged ? 'visible' : 'invisible'
                  }`}>
                  Sauvegarder
                </button>
              </form>
            </div>
            {faces && faces.length ? (
              <div className='py-3'>
                <ul className='flex flex-wrap gap-2 pt-3'>
                  {annotatedFaces.map((face) => (
                    <li key={`photoface${face.faceId}`} className='text-gray-300 mr-2 mb-2'>
                      <div onClick={() => setSelectedFaceForMenu(face)} className='flex flex-col items-center cursor-pointer'>
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
                  {ignoredFaces.map((face) => (
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
                  ))}
                </ul>
              </div>
            ) : null}
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
          </div>
        </div>
      </div>
    </div>
  )
})

type PhotoBadgeProps = {
  photoId: UUID
  faceId: UUID
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
  photoId: UUID
}
function SelectPersonForFacePanel({ close, selectedFace, photoId }: SelectPersonForFacePanelProps) {
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<
    { type: 'known'; personId: UUID } | { type: 'unknown'; name: string } | null
  >(null)

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
          <div className='flex min-h-full items-start justify-center p-4 text-center sm:items-center sm:p-0'>
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
                        />
                        {selectedFamilyMember ? (
                          <form method='POST'>
                            <input type='hidden' name='action' value='submitFamilyMemberName' />
                            <input type='hidden' name='faceId' value={selectedFace.faceId} />
                            <input
                              type='hidden'
                              name='familyMember'
                              value={encodeURIComponent(JSON.stringify(selectedFamilyMember))}
                            />
                            En cours de maintenance
                            {/* <button type='submit' className={`${primaryButtonStyles}`}>
                              Enregistrer
                            </button>
                            <button
                              className='ml-3 text-gray-300'
                              onClick={(e) => {
                                e.preventDefault()
                                close()
                              }}>
                              Annuler
                            </button> */}
                          </form>
                        ) : null}
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

// const FamilyMemberNameForm = ({ face, onDismiss }: FamilyMemberNameFormProps) => {
//   const formRef = React.useRef<HTMLFormElement>(null)

//   const handlePersonSelected = (selection: { type: 'known'; personId: UUID } | { type: 'unknown'; name: string }) => {
//     const { type } = selection
//     if (formRef.current !== null) {
//       if (type === 'unknown') {
//         const element = formRef.current.elements.namedItem('newFamilyMemberName') as HTMLInputElement

//         if (element !== null) {
//           element.value = selection.name
//         }
//       } else {
//         const element = formRef.current.elements.namedItem('existingFamilyMemberId') as HTMLInputElement

//         if (element !== null) {
//           element.value = selection.personId
//         }
//       }
//       formRef.current.submit()
//     }
//   }

//   const { faceId } = face

//   return (
//     <div className=''>
//       <p className={`mb-2 text-gray-300`}>Quel est le nom de cette personne ?</p>
//       {/* <PersonAutocomplete className='max-w-xl text-gray-800' presentPerson={face.stage === 'done' ? face : undefined} /> */}
//       <form method='POST' ref={formRef}>
//         <input type='hidden' name='action' value='submitFamilyMemberName' />
//         <input type='hidden' name='faceId' value={faceId} />
//         <input type='hidden' name='newFamilyMemberName' value='' />
//         <input type='hidden' name='existingFamilyMemberId' value='' />
//       </form>
//       <form method='POST' className='relative mt-3'>
//         <input type='hidden' name='action' value='ignoreFamilyMemberFaceInPhoto' />
//         <input type='hidden' name='faceId' value={faceId} />
//         <div className='flex'>
//           <button type='submit' className={`${secondaryRedButtonStyles}`}>
//             <XMarkIcon className={`${buttonIconStyles}`} aria-hidden='true' />
//             Ignorer ce visage
//           </button>
//           <button
//             className='ml-3 text-gray-300'
//             onClick={(e) => {
//               e.preventDefault()
//               onDismiss && onDismiss()
//             }}>
//             Annuler
//           </button>
//         </div>
//       </form>
//     </div>
//   )
// }
function getThreadUrl(threadId: UUID) {
  return `/chat/${threadId}/chat.html`
}

type ContextualMenuProps = {
  // isOpen: boolean
  close: () => unknown
  selectedFace: PhotoFace | null
  photoId: UUID
  gotoPersonSelector: (selectedFace: PhotoFace) => unknown
}
function ContextualMenu({ close, selectedFace, photoId, gotoPersonSelector }: ContextualMenuProps) {
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

function IgnoreFaceButton({ faceId }: { faceId: UUID }) {
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
}

type PersonAutocompleteProps = {
  faceId: UUID
  className?: string
  selectedPersonName?: string
}

const PersonAutocomplete = ({ faceId, className, selectedPersonName }: PersonAutocompleteProps) => {
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
    <div className={`relative ${className || ''}`}>
      <div className='w-full min-w-screen overflow-hidden shadow-sm border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
        <input
          role='combobox'
          type='text'
          aria-expanded='true'
          aria-autocomplete='list'
          name='newName'
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
