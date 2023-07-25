import React from 'react'
import { UUID } from '../../../domain'

import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../../_components/layout/AppLayout'
import { SuccessError } from '../../_components/SuccessError'
import { InlinePhotoUpload } from '../../_components/InlinePhotoUpload'
import { PhotoIcon } from './PhotoIcon'
import { SendIcon } from './SendIcon'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
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
  history: ChatEvent[]
  chatId: string
}

export const ChatPage = withBrowserBundle(({ error, success, history, chatId }: ChatPageProps) => {
  return (
    <AppLayout>
      <div className='pt-2 overflow-hidden'>
        <input
          type='text'
          className='sm:ml-6 block pl-3 text-xl text-gray-800 placeholder:text-gray-500 bg-transparent font-medium border-0 w-full max-w-2xl focus:ring-0'
          placeholder='Titre (optionnel)'
        />
        <ul role='list' className='mt-3 grid grid-cols-1 gap-2'>
          {history
            ? history.map((event, index) => {
                if (event.type === 'photo') {
                  return (
                    <div className='grid grid-cols-1 w-full px-10'>
                      <img src={event.url} className='max-w-full max-h-[50vh] border border-gray-300 shadow-sm' />
                    </div>
                  )
                }

                if (event.type === 'message') {
                  return (
                    <div
                      key={`event_${index}`}
                      className='sm:ml-6 max-w-2xl px-4 py-4 text-gray-800 text-lg bg-white border border-gray-300 shadow-sm'>
                      <div>{event.message.body}</div>
                    </div>
                  )
                  // return <MessageItem key={`event_${index}`} {...event} />
                }

                return null
              })
            : null}
        </ul>
      </div>

      {/* <div className='bg-white'>
        <SuccessError success={success} error={error} />
        <ul role='list' className='grid grid-cols-1 divide-y divide-gray-300'>
          {history
            ? history.map((event, index) => {
                if (event.type === 'photo') {
                  return <PhotoItem key={`event_${index}`} {...event} />
                }

                if (event.type === 'message') {
                  return <MessageItem key={`event_${index}`} {...event} />
                }

                return null
              })
            : null}

          <AddPhotoOrMessageItem chatId={chatId} />
        </ul>
      </div> */}
    </AppLayout>
  )
})

type ChatItemProps = { children: React.ReactNode; isLastItem?: boolean }
export const ChatItem = ({ children, isLastItem }: ChatItemProps) => {
  return <li className=''>{children}</li>
}

type PhotoItemProps = {
  photoId: UUID
  url: string
  description?: string
  personsInPhoto: string[]
  unrecognizedFacesInPhoto: number
}

const PhotoItem = (props: PhotoItemProps) => {
  const { description, url, personsInPhoto, unrecognizedFacesInPhoto } = props
  let descriptionOfPeople = personsInPhoto.join(', ')

  if (unrecognizedFacesInPhoto) {
    if (descriptionOfPeople.length > 35) {
      descriptionOfPeople = `${descriptionOfPeople.substring(0, 40)}...`
    }
    descriptionOfPeople += `${descriptionOfPeople ? ' et ' : ''}${unrecognizedFacesInPhoto} visage(s) inconnu(s)`
  } else {
    if (descriptionOfPeople.length > 70) descriptionOfPeople = `${descriptionOfPeople.substring(0, 70)}...`
  }

  const photoPageUrl = `/photo/${props.photoId}/photo.html`
  return (
    <ChatItem>
      <div className='bg-gray-200'>
        <div className='grid grid-cols-1 w-full pb-2'>
          <a href={photoPageUrl}>
            <img src={url} className='max-w-full md:px-8' />
          </a>
          <p className='sm:text-sm text-md px-4 sm:px-8 py-2'>{description || descriptionOfPeople}</p>
          <p className='sm:text-sm text-md px-4 sm:px-8'>
            <a href={photoPageUrl} className='font-medium text-indigo-600 hover:text-indigo-500'>
              Annoter
            </a>
            {description || descriptionOfPeople ? (
              <a href={photoPageUrl} className='font-medium ml-2 text-indigo-600 hover:text-indigo-500'>
                En savoir plus...
              </a>
            ) : null}
          </p>
        </div>
      </div>
    </ChatItem>
  )
}

type MessageItemProps = {
  message: {
    body: string
  }
}
const MessageItem = ({ message }: MessageItemProps) => {
  return (
    <ChatItem>
      <div className='min-w-0 flex-1 px-4 md:px-8 py-1.5 sm:py-3  max-w-lg'>
        <div className='mt-2 sm:text-sm text-md text-gray-700'>
          <p className='whitespace-pre-wrap'>{message.body}</p>
        </div>
      </div>
    </ChatItem>
  )
}

type AddPhotoOrMessageItemProps = { chatId: string }
const AddPhotoOrMessageItem = ({ chatId }: AddPhotoOrMessageItemProps) => {
  return (
    <ChatItem isLastItem={true}>
      <div className='min-w-0 flex-1 pb-8'>
        <form method='POST' className='relative'>
          <input type='hidden' name='chatId' defaultValue={chatId} />
          <div className='overflow-hidden sm:border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
            <label htmlFor='message' className='sr-only'>
              Ajouter un message...
            </label>
            <textarea
              rows={3}
              name='message'
              id='message'
              className='block w-full resize-none border-0 px-4 md:px-8  py-1.5 sm:py-3  max-w-lg focus:ring-0 sm:text-sm text-md text-gray-700'
              placeholder='Ajouter un message...'
              defaultValue={''}
            />

            {/* Spacer element to match the height of the toolbar */}
            <div className='py-2' aria-hidden='true'>
              {/* Matches height of button in toolbar (1px border + 36px content height) */}
              <div className='py-px'>
                <div className='h-9' />
              </div>
            </div>
          </div>

          <div className='absolute inset-x-0 bottom-0 flex justify-between py-2 sm:pl-1 pr-2'>
            <div className='flex-shrink-0'>
              <button
                type='submit'
                className='inline-flex items-center ml-6 mt-3 px-3 py-1.5 border border-transparent sm:text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                <SendIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
                Envoyer
              </button>
            </div>
          </div>
        </form>
        <div className='relative mt-2'>
          <div className='absolute inset-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-gray-200' />
          </div>
          <div className='relative flex justify-center sm:justify-start'>
            <span className='bg-white px-2 sm:ml-12 text-sm text-gray-500'>ou</span>
          </div>
        </div>
        <InlinePhotoUpload chatId={chatId}>
          <span className='inline-flex items-center ml-6 mt-3 px-3 py-1.5 border border-transparent sm:sm:text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
            <PhotoIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
            Ajouter une photo
          </span>
        </InlinePhotoUpload>
      </div>
    </ChatItem>
  )
}
