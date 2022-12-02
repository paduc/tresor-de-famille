import * as React from 'react'
import { Combobox } from '@headlessui/react'

import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { useSearchClient } from '../_components/AlgoliaContext'
import { AppLayout } from '../_components/layout/AppLayout'
import { useState } from 'react'
import { CheckIcon } from '@heroicons/react/solid'
import { SuccessError } from '../_components/SuccessError'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type AddVideoProps = {
  success?: string
  error?: string
}

export const AddVideoPage = withBrowserBundle(({ error, success }: AddVideoProps) => {
  return (
    <AppLayout>
      <div className='bg-white p-6'>
        <SuccessError success={success} error={error} />
        <form action='/addVideo' method='post' className='space-y-8 divide-y divide-gray-200 max-w-lg'>
          <div className='space-y-8 divide-y divide-gray-200 sm:space-y-5'>
            <div className='space-y-6 sm:space-y-5'>
              <div>
                <h3 className='text-lg font-medium leading-6 text-gray-900'>Ajouter une vidéo uploadée sur Bunny CDN</h3>
                <p className='mt-1 max-w-2xl text-sm text-gray-500'></p>
              </div>

              <div className='space-y-6 sm:space-y-5'>
                <div className='sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5'>
                  <label htmlFor='title' className='block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2'>
                    Title
                  </label>
                  <div className='mt-1 sm:col-span-2 sm:mt-0'>
                    <input
                      type='text'
                      name='title'
                      id='title'
                      className='block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm'
                    />
                  </div>
                </div>

                <div className='sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5'>
                  <label htmlFor='videoId' className='block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2'>
                    Video ID
                  </label>
                  <div className='mt-1 sm:col-span-2 sm:mt-0'>
                    <input
                      type='text'
                      name='videoId'
                      id='videoId'
                      className='block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm'
                    />
                  </div>
                </div>

                <div className='sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5'>
                  <label htmlFor='directPlayUrl' className='block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2'>
                    Direct Play Url
                  </label>
                  <div className='mt-1 sm:col-span-2 sm:mt-0'>
                    <input
                      type='text'
                      name='directPlayUrl'
                      id='directPlayUrl'
                      className='block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm'
                    />
                  </div>
                </div>

                <div className='sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5'>
                  <label htmlFor='thumbnailUrl' className='block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2'>
                    Thumbnail Url
                  </label>
                  <div className='mt-1 sm:col-span-2 sm:mt-0'>
                    <input
                      type='text'
                      name='thumbnailUrl'
                      id='thumbnailUrl'
                      className='block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm'
                    />
                  </div>
                </div>

                <div className='sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5'>
                  <label htmlFor='previewUrl' className='block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2'>
                    Preview Url
                  </label>
                  <div className='mt-1 sm:col-span-2 sm:mt-0'>
                    <input
                      type='text'
                      name='previewUrl'
                      id='previewUrl'
                      className='block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='pt-5'>
            <div className='flex justify-start'>
              <button
                type='submit'
                className='inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'>
                Ajouter
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
})
