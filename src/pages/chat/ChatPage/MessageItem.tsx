import * as React from 'react'
import { ChatItem } from './ChatPage'

export type MessageItemProps = {
  message: {
    body: string
  }
}
export const MessageItem = ({ message }: MessageItemProps) => {
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
