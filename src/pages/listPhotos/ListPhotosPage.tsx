import * as React from 'react'

import { UUID } from '../../domain'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { SuccessError } from '../_components/SuccessError'
import { AppLayout } from '../_components/layout/AppLayout'
import { PhotoIcon } from '../photo/PhotoPage/PhotoIcon'
import { PlusCircleIcon, PlusIcon } from '@heroicons/react/outline'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type ListPhotosProps = {
  success?: string
  error?: string
  photos: {
    photoId: UUID
    chatId: UUID
    url: string
  }[]
}

export const ListPhotosPage = withBrowserBundle(({ error, success, photos }: ListPhotosProps) => {
  return (
    <AppLayout>
      <div className='bg-white p-6'>
        <SuccessError success={success} error={error} />
        {!photos.length ? (
          <div className='text-center'>
            <svg
              className='mx-auto h-12 w-12 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              aria-hidden='true'>
              <path
                vectorEffect='non-scaling-stroke'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z'
              />
            </svg>
            <h3 className='mt-2 text-lg font-semibold text-gray-900'>Pas de photos ?!</h3>
            <p className='mt-1 text-sm text-gray-500'>Lancez-vous en en envoyant une !</p>
            <div className='mt-6'>
              <a
                href='/photo.html'
                className='button inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
                <PhotoIcon className='-ml-0.5 mr-1.5 h-5 w-5' aria-hidden='true' />
                Aller à page d'ajout
              </a>
            </div>
          </div>
        ) : (
          <>
            <h3 className='text-lg font-medium leading-6 mb-1 text-gray-900'>
              Photos{' '}
              <a
                href='/photo.html'
                className='button inline-flex items-right ml-3 mt-3 p-1 border border-transparent sm:text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                <PlusIcon className='w-5 h-5' />
              </a>
            </h3>
            <p className='mb-5 max-w-2xl'></p>
            <ul role='list' className='grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8'>
              {photos.map((photo) => (
                <li key={photo.photoId} className='relative'>
                  <div className='group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100'>
                    <img src={photo.url} alt='' className='pointer-events-none object-cover group-hover:opacity-75' />
                    <a href={`/photo/${photo.chatId}/photo.html`} className='absolute inset-0 focus:outline-none'>
                      <span className='sr-only'>Voir la photo</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
            <p className='mt-5 max-w-2xl'>
              <a
                href='/photo.html'
                className='button inline-flex items-center mt-3 px-3 py-1.5 border border-transparent sm:text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                Ajouter une nouvelle photo
              </a>
            </p>
          </>
        )}
      </div>
    </AppLayout>
  )
})