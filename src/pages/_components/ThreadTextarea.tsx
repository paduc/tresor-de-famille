import { PhotoIcon } from '@heroicons/react/24/outline'
import React from 'react'
import TextareaAutosize from 'react-textarea-autosize'

export const ThreadTextarea = ({ message }: { message: string }) => {
  return (
    <form method='POST' className='relative sm:max-w-lg'>
      <input type='hidden' name='action' defaultValue='startFirstThread' />
      <div className='pt-2 overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
        <label htmlFor='title' className='sr-only'>
          Titre
        </label>
        <input
          type='text'
          name='title'
          id='title'
          className='block w-full border-0 pt-2.5 text-xl sm:text-lg font-medium placeholder:text-gray-400 focus:ring-0'
          placeholder='Titre'
        />
        <label htmlFor='message' className='sr-only'>
          Je me souviens...
        </label>

        <TextareaAutosize
          name='message'
          id='message'
          className='block w-full resize-none border-0 py-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-lg sm:text-base sm:leading-6 pb-3'
          placeholder='Je me souviens...'
          defaultValue={message}
        />

        {/* Spacer element to match the height of the toolbar */}
        <div aria-hidden='true'>
          {/* <div className='py-2'>
                      <div className='h-9' />
                    </div> */}
          <div className='h-px' />
          <div className='py-2'>
            <div className='py-px'>
              <div className='h-9' />
            </div>
          </div>
        </div>
      </div>
      <div className='absolute inset-x-px bottom-0'>
        <div className='flex items-center justify-between space-x-3 border-t border-gray-200 px-2 py-2 sm:px-3'>
          <div className='flex'>
            <button
              type='button'
              className='group -my-2 -ml-2 inline-flex items-center rounded-full px-3 py-2 text-left text-gray-400'>
              <PhotoIcon className='-ml-1 mr-2 h-5 w-5 group-hover:text-gray-500' aria-hidden='true' />
              <span className='text-sm italic text-gray-500 group-hover:text-gray-600'>Ajouter une photo</span>
            </button>
          </div>
          <div className='flex-shrink-0'>
            <button
              type='submit'
              className='inline-flex items-center rounded-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
