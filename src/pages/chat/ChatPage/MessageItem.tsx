import * as React from 'react'
import { ChatBubbleLeftEllipsisIcon } from './ChatBubbleLeftEllipsisIcon'
import { ChatEvent, ChatItem } from './ChatPage'

type MessageItemProps = { event: ChatEvent & { type: 'message' } }
export const MessageItem = ({ event }: MessageItemProps) => {
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
      <div className='min-w-0 flex-1 pt-0 py-1.5'>
        <div className='mt-2 text-sm text-gray-700'>
          <p>{event.message.body}</p>
        </div>
      </div>
    </ChatItem>
  )
}
