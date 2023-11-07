import React, { useCallback, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { XMarkIcon } from '@heroicons/react/20/solid'
import { UUID } from '../../../domain/UUID'
import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { buttonIconStyles, primaryButtonStyles, secondaryRedButtonStyles, smallButtonStyles } from '../../_components/Button'
import { PersonAutocomplete } from '../../_components/PersonAutocomplete'
import { SessionContext } from '../../_components/SessionContext'
import { PhotoListPageUrl } from '../../listPhotos/PhotoListPageUrl'

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

  const [selectedFace, setSelectedFace] = useState<PhotoFace | null>(null)

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
                      <FamilyMemberNameForm face={selectedFace} onDismiss={() => setSelectedFace(null)} />
                    </div>
                  </div>
                ) : (
                  <ul className='flex flex-wrap gap-2 mt-3 pt-3'>
                    {annotatedFaces.map((face) => (
                      <li key={`photoface${face.faceId}`} className='text-gray-300 mr-2 mb-2'>
                        <div onClick={() => setSelectedFace(face)} className='flex flex-col items-center cursor-pointer'>
                          <PhotoBadge faceId={face.faceId} photoId={photoId} className={``} altText={face.name || ''} />
                          <div className='mt-1 max-w-[80px] truncate'>{face.name}</div>
                        </div>
                      </li>
                    ))}
                    {pendingFaces.map((face) => (
                      <li
                        key={`photoface${face.faceId}`}
                        className='text-gray-500 mr-2 mb-2 flex flex-col items-center relative'
                        onClick={() => setSelectedFace(face)}>
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
                        onClick={() => setSelectedFace(face)}>
                        <PhotoBadge faceId={face.faceId} photoId={photoId} className={`grayscale cursor-pointer`} />
                        <div className='absolute top-11 right-0 h-4 w-4 rounded-full bg-red-600 -ring-2 ring-1 ring-white'>
                          <div className='text-white text-center'>
                            <XMarkIcon className='h-[3.5] w-[3.5]' />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
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

type FamilyMemberNameFormProps = {
  face: PhotoFace
  onDismiss?: () => unknown
}

const FamilyMemberNameForm = ({ face, onDismiss }: FamilyMemberNameFormProps) => {
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

  const { faceId } = face

  return (
    <div className=''>
      <p className={`mb-2 text-gray-300`}>Quel est le nom de cette personne ?</p>
      <PersonAutocomplete
        onPersonSelected={handlePersonSelected}
        className='max-w-xl text-gray-800'
        presentPerson={face.stage === 'done' ? face : undefined}
      />
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
