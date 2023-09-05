import React, { useLayoutEffect, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { XMarkIcon } from '@heroicons/react/20/solid'
import { UUID } from '../../../domain/UUID'
import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { buttonIconStyles, secondaryRedButtonStyles } from '../../_components/Button'
import { SessionContext } from '../../_components/SessionContext'
import { PersonAutocomplete } from '../../home/PersonAutocomplete'
import { PhotoListPageUrl } from '../../listPhotos/PhotoListPageUrl'
import { PersonPageURL } from '../../person/PersonPageURL'
import { Switch } from '@headlessui/react'
import classNames from 'classnames'
import { ClientOnly } from '../../_components/ClientOnly'
import { ArrowDownIcon } from '@heroicons/react/24/outline'

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

export const NewPhotoPage = withBrowserBundle((props: NewPhotoPageProps) => {
  // To avoid the warning that useLayoutEffect does not work in SSR
  return (
    <ClientOnly>
      <Wrapper {...props} />
    </ClientOnly>
  )
})

const Wrapper = ({ context, caption, photoId, photoUrl, faces, updated }: NewPhotoPageProps) => {
  const session = React.useContext(SessionContext)

  const [isScrollHintVisible, toggleScrollHint] = React.useState(true)

  // For UI testing purposes (view under the fold)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  useLayoutEffect(() => {
    if (bottomRef.current !== null && updated) bottomRef.current.scrollIntoView()
  })

  const [selectedFace, setSelectedFace] = useState<PhotoFace | null>(null)
  const [faceEditionMode, setFaceEditionMode] = useState<boolean>(false)

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
      <div className='bg-black absolute overflow-y-scroll overflow-x-hidden top-0 bottom-0 left-0 right-0 w-[100hh] h-[100vh]'>
        <a
          href={`${context ? getThreadUrl(context.threadId) : PhotoListPageUrl}`}
          className='absolute top-2 left-2 text-gray-300'>
          <XMarkIcon className='cursor-pointer h-8 w-8' />
        </a>
        {isScrollHintVisible ? (
          <div
            className='cursor-pointer absolute bottom-2 left-2 text-gray-300 animate-bounce'
            onClick={() => toggleScrollHint(false)}>
            <div className='flex  leading-6 align-middle'>
              <ArrowDownIcon className=' h-6 w-6 mr-1' />
              Faire défiler
            </div>
          </div>
        ) : null}
        <div className='grid place-items-center h-screen'>
          <img src={photoUrl} className='max-w-full max-h-screen' />
        </div>
        <div ref={bottomRef} className='bg-white bg-opacity-5'>
          <div className='text-gray-300 px-3 py-4 pb-28 w-full sm:max-w-lg mx-auto divide divide-y divide-solid divide-gray-200 divide-opacity-30'>
            <div>
              <form method='POST' className='relative'>
                <input type='hidden' name='action' value='addCaption' />
                <div className='overflow-hidden'>
                  <label htmlFor='caption' className='sr-only'>
                    Ajouter une légende...
                  </label>
                  <TextareaAutosize
                    name='caption'
                    minRows={1}
                    className='block w-full bg-none bg-transparent resize-none border-0 p-0 text-white placeholder:text-gray-300 pb-3'
                    placeholder='Ajouter une légende...'
                    defaultValue={caption}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.altKey && !e.ctrlKey) {
                        e.preventDefault()
                        // @ts-ignore
                        e.target.form.submit()
                      }
                    }}
                  />
                </div>
              </form>
            </div>
            {faces && faces.length ? (
              <div className='pt-3'>
                {selectedFace ? (
                  <div className='mt-3'>
                    <div className='flex justify-center sm:justify-start'>
                      <PhotoBadge
                        photoId={photoId}
                        faceId={selectedFace.faceId}
                        className={`m-2 h-[80px] w-[80px] hover:cursor-default`}
                      />
                    </div>
                    <div>
                      <FamilyMemberNameForm
                        faceId={selectedFace.faceId}
                        photoId={photoId}
                        onDismiss={() => setSelectedFace(null)}
                      />
                    </div>
                  </div>
                ) : (
                  <ul className='flex flex-wrap gap-2 mt-3 pt-3'>
                    {annotatedFaces.map((face) => (
                      <li key={`photoface${face.faceId}`} className='text-gray-300 mr-2 mb-2'>
                        <a
                          href={PersonPageURL(face.personId)}
                          onClick={(e) => {
                            if (faceEditionMode) {
                              e.preventDefault()
                              setSelectedFace(face)
                            }
                          }}
                          className='flex flex-col items-center'>
                          <PhotoBadge faceId={face.faceId} photoId={photoId} className={``} altText={face.name || ''} />
                          <div className='mt-1 max-w-[80px] truncate'>{face.name}</div>
                        </a>
                      </li>
                    ))}
                    {pendingFaces.map((face) => (
                      <li
                        key={`photoface${face.faceId}`}
                        className='text-gray-500 mr-2 mb-2 flex flex-col items-center relative'
                        onClick={() => (faceEditionMode ? setSelectedFace(face) : null)}>
                        <PhotoBadge
                          faceId={face.faceId}
                          photoId={photoId}
                          className={`${faceEditionMode ? 'cursor-pointer' : 'cursor-default'}`}
                        />
                        <div className='absolute top-11 right-0 h-4 w-4 rounded-full bg-blue-600 -ring-2 ring-1  ring-white'>
                          <div className='text-white text-xs text-center'>?</div>
                        </div>
                      </li>
                    ))}
                    {ignoredFaces.map((face) => (
                      <li
                        key={`photoface${face.faceId}`}
                        className='text-gray-500 mr-2 mb-2 flex flex-col items-center relative'
                        onClick={() => (faceEditionMode ? setSelectedFace(face) : null)}>
                        <PhotoBadge
                          faceId={face.faceId}
                          photoId={photoId}
                          className={`grayscale ${faceEditionMode ? 'cursor-pointer' : 'cursor-default'}`}
                        />
                        <div className='absolute top-11 right-0 h-4 w-4 rounded-full bg-red-600 -ring-2 ring-1 ring-white'>
                          <div className='text-white text-center'>
                            <XMarkIcon className='h-[3.5] w-[3.5]' />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {!selectedFace ? (
                  <Switch.Group as='div' className='flex items-center mt-4'>
                    <Switch
                      checked={faceEditionMode}
                      onChange={setFaceEditionMode}
                      className={classNames(
                        faceEditionMode ? 'bg-indigo-600' : 'bg-gray-500',
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
                      )}>
                      <span
                        aria-hidden='true'
                        className={classNames(
                          faceEditionMode ? 'translate-x-5' : 'translate-x-0',
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                        )}
                      />
                    </Switch>
                    <Switch.Label as='span' className='ml-3 text-sm'>
                      <span className='font-medium text-gray-300'>
                        {faceEditionMode ? "Activé: choisissez un visage pour l'éditer" : 'Activer le mode édition de visages'}
                      </span>
                    </Switch.Label>
                  </Switch.Group>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

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

type FamilyMemberNameFormProps = {
  faceId: UUID
  photoId: UUID
  onDismiss?: () => unknown
}

const FamilyMemberNameForm = ({ faceId, photoId, onDismiss }: FamilyMemberNameFormProps) => {
  const formRef = React.useRef<HTMLFormElement>(null)

  const handlePersonSelected = (selection: { type: 'known'; personId: UUID } | { type: 'unknown'; name: string }) => {
    const { type } = selection
    if (formRef.current !== null) {
      if (type === 'unknown') {
        const element = formRef.current.elements.namedItem('newFamilyMemberName') as HTMLInputElement

        if (element !== null) {
          element.value = selection.name
        }
      } else {
        const element = formRef.current.elements.namedItem('existingFamilyMemberId') as HTMLInputElement

        if (element !== null) {
          element.value = selection.personId
        }
      }
      formRef.current.submit()
    }
  }

  return (
    <div className=''>
      <p className={`mb-2 text-gray-300`}>Quel est le nom de cette personne ?</p>
      <PersonAutocomplete onPersonSelected={handlePersonSelected} className='max-w-xl text-gray-800' />
      <form method='POST' ref={formRef}>
        <input type='hidden' name='action' value='submitFamilyMemberName' />
        <input type='hidden' name='faceId' value={faceId} />
        <input type='hidden' name='newFamilyMemberName' value='' />
        <input type='hidden' name='existingFamilyMemberId' value='' />
      </form>
      <form method='POST' className='relative mt-3'>
        <input type='hidden' name='action' value='ignoreFamilyMemberFaceInPhoto' />
        <input type='hidden' name='faceId' value={faceId} />
        <div className='flex'>
          <button type='submit' className={`${secondaryRedButtonStyles}`}>
            <XMarkIcon className={`${buttonIconStyles}`} aria-hidden='true' />
            Ignorer ce visage
          </button>
          <button
            className='ml-3 text-gray-300'
            onClick={(e) => {
              e.preventDefault()
              onDismiss && onDismiss()
            }}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
function getThreadUrl(threadId: UUID) {
  return `/chat/${threadId}/chat.html`
}
