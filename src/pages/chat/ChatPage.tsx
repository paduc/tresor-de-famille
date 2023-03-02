import { UserCircleIcon, TagIcon } from '@heroicons/react/solid'
import * as React from 'react'
import { useRef } from 'react'
import { JsxElement } from 'typescript'

import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../_components/layout/AppLayout'
import { SuccessError } from '../_components/SuccessError'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type ChatPhotoFace = {
  personName: string | null
  position: {
    width: number
    height: number
    left: number
    top: number
  }
}

export type ChatEvent =
  | {
      type: 'photo'
      profilePicUrl: string
      photo: {
        id: string
        url: string
        faces?: ChatPhotoFace[]
      }
    }
  | {
      type: 'message'
      profilePicUrl: string
      message: {
        body: string
      }
    }

export type ChatPageProps = {
  success?: string
  error?: string
  history: ChatEvent[]
  userProfilePicUrl: string
}

export const ChatPage = withBrowserBundle(({ error, success, history, userProfilePicUrl }: ChatPageProps) => {
  return (
    <AppLayout>
      <div className='bg-white p-6'>
        <SuccessError success={success} error={error} />
        <div className='flow-root'>
          <ul role='list' className='-mb-8'>
            {history.map((event, index) => {
              if (event.type === 'photo') {
                return <PhotoItem key={`event_${index}`} event={event} />
              }

              if (event.type === 'message') {
                return <MessageItem key={`event_${index}`} event={event} />
              }

              return null
            })}
            <AddPhotoOrMessageItem userProfilePicUrl={userProfilePicUrl} />
          </ul>
        </div>
      </div>
    </AppLayout>
  )
})

type ChatItemProps = { children: React.ReactNode; isLastItem?: boolean }
const ChatItem = ({ children, isLastItem }: ChatItemProps) => {
  return (
    <li>
      <div className='relative pb-8'>
        {!isLastItem ? <span className='absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200' aria-hidden='true' /> : null}
        <div className='relative flex items-start space-x-3'>{children}</div>
      </div>
    </li>
  )
}

function SendIcon(props: any) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' {...props}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5'
      />
    </svg>
  )
}
type AddPhotoOrMessageItemProps = { userProfilePicUrl: string }
const AddPhotoOrMessageItem = ({ userProfilePicUrl }: AddPhotoOrMessageItemProps) => {
  const photoUploadForm = useRef<HTMLFormElement>(null)

  const photoUploadFileSelected = (e: any) => {
    if (photoUploadForm.current !== null) photoUploadForm.current.submit()
  }

  return (
    <ChatItem isLastItem={true}>
      <div className='relative'>
        <img
          className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white'
          src={userProfilePicUrl}
          alt=''
        />
      </div>
      <div className='min-w-0 flex-1'>
        <form action='#' className='relative'>
          <div className='overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
            <label htmlFor='comment' className='sr-only'>
              Ajouter un message
            </label>
            <textarea
              rows={3}
              name='comment'
              id='comment'
              className='block w-full resize-none border-0 py-3 focus:ring-0 sm:text-sm'
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

          <div className='absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
            <div className='flex-shrink-0'>
              <button
                type='submit'
                className='inline-flex items-center mt-3 px-3 py-1.5 border border-transparent sm:sm:text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
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
          <div className='relative flex justify-center'>
            <span className='bg-white px-2 text-sm text-gray-500'>ou</span>
          </div>
        </div>
        <form ref={photoUploadForm} method='post' encType='multipart/form-data'>
          <input
            type='file'
            id='file-input'
            name='photo'
            className='hidden'
            accept='image/png, image/jpeg, image/jpg'
            onChange={photoUploadFileSelected}
          />
          <label
            htmlFor='file-input'
            className='inline-flex items-center mt-3 px-3 py-1.5 border border-transparent sm:text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
            <PhotoIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
            Ajouter une photo
          </label>
        </form>
      </div>
    </ChatItem>
  )
}

function PhotoIcon(props: any) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' {...props}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z'
      />
    </svg>
  )
}

type PhotoItemProps = { event: ChatEvent & { type: 'photo' } }
const PhotoItem = ({ event }: PhotoItemProps) => {
  return (
    <ChatItem>
      <div className='relative'>
        <img
          className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white'
          src={event.profilePicUrl}
          alt=''
        />

        <span className='absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px'>
          <PhotoIcon className='h-5 w-5 text-gray-500' aria-hidden='true' />
        </span>
      </div>
      <div className='min-w-0 flex-1 py-1.5'>
        <div className='relative inline-block'>
          <img src={event.photo.url} />
          {event.photo.faces?.map((face, index) => (
            <div
              key={`face${index}`}
              style={{
                position: 'absolute',
                border: '2px solid red',
                boxSizing: 'border-box',
                top: `${Math.round(face.position.top * 100)}%`,
                left: `${Math.round(face.position.left * 100)}%`,
                width: `${Math.round(face.position.width * 100)}%`,
                height: `${Math.round(face.position.height * 100)}%`,
              }}>
              <div style={{ background: 'white' }}>{face.personName || 'inconnu'}</div>
            </div>
          ))}
        </div>
      </div>
    </ChatItem>
  )
}

function ChatBubbleLeftEllipsisIcon(props: any) {
  return (
    <svg fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' {...props}>
      <path
        clipRule='evenodd'
        fillRule='evenodd'
        d='M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z'
      />
    </svg>
  )
}

type MessageItemProps = { event: ChatEvent & { type: 'message' } }
const MessageItem = ({ event }: MessageItemProps) => {
  return (
    <ChatItem>
      <div className='relative'>
        <img
          className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white'
          src={event.profilePicUrl}
          alt=''
        />

        <span className='absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px'>
          <ChatBubbleLeftEllipsisIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
        </span>
      </div>
      <div className='min-w-0 flex-1 py-1.5'>
        <div className='mt-2 text-sm text-gray-700'>
          <p>{event.message.body}</p>
        </div>
      </div>
    </ChatItem>
  )
}
