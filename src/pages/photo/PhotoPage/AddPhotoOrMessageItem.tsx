import * as React from 'react'
import { useRef } from 'react'
import { SendIcon } from './SendIcon'
import { ChatItem } from './PhotoPage'
import { PhotoIcon } from './PhotoIcon'

type AddPhotoOrMessageItemProps = { userProfilePicUrl: string }
export const AddPhotoOrMessageItem = ({ userProfilePicUrl }: AddPhotoOrMessageItemProps) => {
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
        <form method='POST' className='relative'>
          <div className='overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
            <label htmlFor='message' className='sr-only'>
              Ajouter un message
            </label>
            <textarea
              rows={3}
              name='message'
              id='message'
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
