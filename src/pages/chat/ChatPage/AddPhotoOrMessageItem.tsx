import * as React from 'react'
import { useRef } from 'react'
import { SendIcon } from './SendIcon'
import { ChatItem } from './ChatPage'
import { PhotoIcon } from './PhotoIcon'
import { InlinePhotoUpload } from '../../_components/InlinePhotoUpload'

type AddPhotoOrMessageItemProps = { chatId: string }
export const AddPhotoOrMessageItem = ({ chatId }: AddPhotoOrMessageItemProps) => {
  return (
    <ChatItem isLastItem={true}>
      <div className='min-w-0 flex-1 pb-8'>
        <form method='POST' className='relative'>
          <div className='overflow-hidden'>
            <label htmlFor='message' className='sr-only'>
              Ajouter un message
            </label>
            <textarea
              rows={3}
              name='message'
              id='message'
              className='block focus:shadow-none focus:border-none focus:ring-none focus:outline-none outline-none ring-none border-none text-sm sm:text-md text-gray-700 px-2 py-1.5 sm:py-3 sm:px-4 md:px-8 w-full max-w-lg'
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
                className='inline-flex items-center ml-6 mt-3 px-3 py-1.5 border border-transparent sm:sm:text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
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
