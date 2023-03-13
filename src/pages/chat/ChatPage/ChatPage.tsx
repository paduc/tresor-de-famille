import * as React from 'react'

import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../../_components/layout/AppLayout'
import { SuccessError } from '../../_components/SuccessError'
import { AddPhotoOrMessageItem } from './AddPhotoOrMessageItem'
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
  faceId: string
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

                  return null
                })
              : null}
            <AddPhotoOrMessageItem userProfilePicUrl={userProfilePicUrl} />
          </ul>
        </div>
      </div>
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
