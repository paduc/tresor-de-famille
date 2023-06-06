import React, { FunctionComponent } from 'react'
import { UUID } from '../../../domain'

import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../../_components/layout/AppLayout'
import { SuccessError } from '../../_components/SuccessError'
import { AddPhotoOrMessageItem } from './AddPhotoOrMessageItem'
import { ChatBubbleLeftEllipsisIcon } from './ChatBubbleLeftEllipsisIcon'
import { HoverContext, HoverProvider } from './HoverProvider'
import { MessageItem, MessageItemProps } from './MessageItem'
import { PhotoItem, PhotoItemProps } from './PhotoItem'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type ChatPhotoFace = {
  person: {
    name: string
    annotatedBy: 'face-recognition' | 'ai'
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
      <HoverProvider>
        <div className='bg-white'>
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
          </ul>
        </div>
      </HoverProvider>
    </AppLayout>
  )
})

type ChatItemProps = { children: React.ReactNode; isLastItem?: boolean }
export const ChatItem = ({ children, isLastItem }: ChatItemProps) => {
  return <li className=''>{children}</li>
}
