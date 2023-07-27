import React from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { UUID } from '../../../domain'
import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { buttonIconStyles, primaryButtonStyles, secondaryButtonStyles } from '../../_components/Button'
import { InlinePhotoUploadBtn } from '../../_components/InlinePhotoUploadBtn'
import { AppLayout } from '../../_components/layout/AppLayout'
import { PhotoIcon } from './PhotoIcon'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type MessageItemProps = {
  message: {
    body: string
  }
}

export type PhotoItemProps = {
  photoId: UUID
  url: string
  description?: string
  personsInPhoto: string[]
  unrecognizedFacesInPhoto: number
  chatId: UUID
}

export type ChatEvent = { timestamp: number } & (
  | ({
      type: 'photo'
    } & PhotoItemProps)
  | ({
      type: 'message'
    } & MessageItemProps)
)

export type ChatPageProps = {
  success?: string
  error?: string
  title?: string
  history: ChatEvent[]
  chatId: UUID
}

export const ChatPage = withBrowserBundle(({ error, success, title, history, chatId }: ChatPageProps) => {
  const newMessageAreaRef = React.useRef<HTMLTextAreaElement>(null)
  return (
    <AppLayout>
      <div className='pt-2 overflow-hidden pb-40'>
        <form method='post'>
          <input type='hidden' name='action' value='setTitle' />
          <input
            type='text'
            name='title'
            className='sm:ml-6 block pl-3 text-xl text-gray-800 placeholder:text-gray-500 placeholder:text-base placeholder:font-normal bg-transparent font-medium border-0 w-full max-w-2xl focus:ring-0'
            placeholder='Titre (optionnel)'
            defaultValue={title}
          />
        </form>
        <ul role='list' className='mt-3 grid grid-cols-1 gap-2'>
          {history
            ? history.map((event, index) => {
                if (event.type === 'photo') {
                  return <PhotoItem key={`event_${index}`} {...{ ...event, chatId }} />
                }

                if (event.type === 'message') {
                  return (
                    <div
                      key={`event_${index}`}
                      className='sm:ml-6 max-w-2xl px-4 py-4 text-gray-800 text-lg bg-white border  border-gray-300 border-x-white sm:border-x-gray-300 shadow-sm'>
                      <p className='whitespace-pre-wrap'>{event.message.body}</p>
                    </div>
                  )
                }

                return null
              })
            : null}
          <li>
            <form method='POST' className='block relative'>
              <input type='hidden' name='action' value='newMessage' />
              <TextareaAutosize
                ref={newMessageAreaRef}
                name='message'
                minRows={4}
                autoFocus={history.every((event) => event.type !== 'message')}
                className='px-4 py-4 block w-full sm:ml-6 max-w-2xl border-gray-300 border-x-white sm:border-x-gray-300 shadow-sm resize-none  text-gray-800 ring-0 placeholder:text-gray-400 focus:border-gray-300 focus:ring-0 text-lg focus:outline-none'
                placeholder='...'
                onKeyDown={(e) => {
                  const text = e.currentTarget.value.trim()
                  if (e.key === 'Enter' && e.metaKey) {
                    e.preventDefault()
                    // @ts-ignore
                    if (text) e.target.form.submit()
                  }
                }}
              />
              <div className='ml-4 sm:ml-6 mt-3'>
                <button
                  type='submit'
                  onClick={(e) => {
                    if (newMessageAreaRef.current && !newMessageAreaRef.current.value.trim().length) {
                      e.preventDefault()
                    }
                  }}
                  className={`${primaryButtonStyles}`}>
                  Envoyer
                </button>
              </div>
            </form>
            <div className='ml-4 sm:ml-6 mt-3'>
              <InlinePhotoUploadBtn formAction='/add-photo.html' formKey='addNewPhotoToChat' hiddenFields={{ chatId }}>
                <span
                  className={`${secondaryButtonStyles}`}
                  onClick={(e) => {
                    if (newMessageAreaRef.current !== null && newMessageAreaRef.current.value !== '') {
                      e.preventDefault()
                      alert("Merci d'envoyer votre souvenir avant d'ajouter une photo.")
                    }
                  }}>
                  <PhotoIcon className={`${buttonIconStyles}`} aria-hidden='true' />
                  Ajouter une photo
                </span>
              </InlinePhotoUploadBtn>
            </div>
          </li>
        </ul>
      </div>
    </AppLayout>
  )
})

const PhotoItem = (props: PhotoItemProps) => {
  const { description, url, personsInPhoto, unrecognizedFacesInPhoto } = props
  const descriptionOfPeople = personsInPhoto.join(', ')

  const photoPageUrl = `/photo/${props.photoId}/photo.html?threadId=${props.chatId}`

  return (
    <div className='grid grid-cols-1 w-full px-4 sm:px-10 pb-2'>
      <div className='mb-2'>
        <a href={photoPageUrl}>
          <img src={url} className='max-w-full max-h-[50vh] border border-gray-300 shadow-sm' />
        </a>
      </div>

      <p className='text-md text-gray-600 mb-1'>{description}</p>
      {descriptionOfPeople ? <p className='text-md text-gray-600 mb-1'>avec {descriptionOfPeople}</p> : null}
      {!description && unrecognizedFacesInPhoto ? (
        <p className='text-md text-gray-600 mb-1'>
          <a href={photoPageUrl} className='font-medium text-indigo-600 hover:text-indigo-500'>
            Annoter le(s) {unrecognizedFacesInPhoto} visage(s)
          </a>
        </p>
      ) : null}
    </div>
  )
}
