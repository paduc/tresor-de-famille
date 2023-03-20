import * as React from 'react'
import { UUID } from '../../../domain'

import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../../_components/layout/AppLayout'
import { SuccessError } from '../../_components/SuccessError'
import { AddPhotoOrMessageItem } from './AddPhotoOrMessageItem'
import { ChatBubbleLeftEllipsisIcon } from './ChatBubbleLeftEllipsisIcon'
import { HoverContext, HoverProvider } from './HoverProvider'
import { MessageItem } from './MessageItem'
import { PhotoItem } from './PhotoItem'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type ChatPhotoFace = {
  person: {
    name: string
  } | null
  faceId: UUID
  position: {
    width: number
    height: number
    left: number
    top: number
  }
}

export type ChatDeduction = {
  // type: 'face-is-person'
  person: {
    name: string
  }
  faceId: UUID
  photo: {
    url: string
  }
  position: {
    width: number
    height: number
    left: number
    top: number
  }
}

export type ChatEvent = { timestamp: number } & (
  | {
      type: 'photo'
      profilePicUrl: string
      photo: {
        id: UUID
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
  | {
      type: 'deductions'
      deductions: ChatDeduction[]
    }
)

export type ChatPageProps = {
  success?: string
  error?: string
  history: ChatEvent[]
  userProfilePicUrl: string
}

export const ChatPage = withBrowserBundle(({ error, success, history, userProfilePicUrl }: ChatPageProps) => {
  return (
    <AppLayout>
      <HoverProvider>
        <div className='bg-white p-6'>
          <SuccessError success={success} error={error} />
          <div className='flow-root'>
            <ul role='list' className='-mb-8'>
              {history
                ? history.map((event, index) => {
                    if (event.type === 'photo') {
                      return <PhotoItem key={`event_${index}`} event={event} />
                    }

                    if (event.type === 'message') {
                      return <MessageItem key={`event_${index}`} event={event} />
                    }

                    if (event.type === 'deductions') {
                      return <DeductionsItem key={`event_${index}`} event={event} />
                    }

                    return null
                  })
                : null}
              <AddPhotoOrMessageItem userProfilePicUrl={userProfilePicUrl} />
            </ul>
          </div>
        </div>
      </HoverProvider>
    </AppLayout>
  )
})

type ChatItemProps = { children: React.ReactNode; isLastItem?: boolean }
export const ChatItem = ({ children, isLastItem }: ChatItemProps) => {
  return (
    <li>
      <div className='relative pb-8'>
        {!isLastItem ? <span className='absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200' aria-hidden='true' /> : null}
        <div className='relative flex items-start space-x-3'>{children}</div>
      </div>
    </li>
  )
}

type DeductionsItemProps = { event: ChatEvent & { type: 'deductions' } }
export const DeductionsItem = ({ event }: DeductionsItemProps) => {
  return (
    <ChatItem>
      <div className='relative'>
        <span className='inline-block h-10 w-10 overflow-hidden rounded-full bg-gray-100 ring-8 ring-white'>
          <svg className='h-full w-full text-gray-300' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z' />
          </svg>
        </span>

        <span className='absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px'>
          <ChatBubbleLeftEllipsisIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
        </span>
      </div>
      <div className='min-w-0 flex-1'>
        <div className='text-sm text-gray-700'>J'en ai déduit que</div>
        <div className='mt-1 mb-2 text-sm text-gray-700'>
          {event.deductions.map((deduction, index) => (
            <DeductionItem deduction={deduction} key={`deduction_${index}`} />
          ))}
        </div>
      </div>
    </ChatItem>
  )
}

const DeductionItem = ({ deduction: { position, photo, person, faceId } }: { deduction: ChatDeduction }) => {
  const bgSize = Math.round((8 / 10) * Math.min(Math.round(100 / position.height), Math.round(100 / position.width)))
  const { setHoveredFaceId } = React.useContext(HoverContext)
  return (
    <div
      className='inline-block mr-3 rounded-full pr-3 ring-2 ring-gray-300'
      onMouseOver={() => {
        setHoveredFaceId(faceId)
      }}
      onMouseOut={() => {
        setHoveredFaceId(null)
      }}>
      <a href='#' className='group block flex-shrink-0 '>
        <div className='flex items-center'>
          <div
            className='inline-block h-10 w-10 rounded-full'
            style={{
              backgroundImage: `url(${photo.url})`,
              backgroundPosition: `${Math.round(position.left * 100)}% ${Math.round(position.top * 100)}%`,
              backgroundSize: `${bgSize}% ${bgSize}%`,
            }}></div>
          <div className='ml-3'>
            <p className='text-sm font-medium text-gray-700 group-hover:text-gray-900'>est {person.name}</p>
          </div>
        </div>
      </a>
    </div>
  )
}
