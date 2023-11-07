import * as React from 'react'

import { UUID } from '../../domain'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { InlinePhotoUploadBtn } from '../_components/InlinePhotoUploadBtn'
import { SuccessError } from '../_components/SuccessError'
import { AppLayout } from '../_components/layout/AppLayout'
import { PhotoIcon } from '../photo/PhotoPage/PhotoIcon'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type ListPhotosProps = {
  success?: string
  error?: string
  photos: {
    photoId: UUID
    url: string
  }[]
}

export const ListPhotosPage = withBrowserBundle(({ error, success, photos }: ListPhotosProps) => {
  const photoPageUrl = (photo: ListPhotosProps['photos'][number]) => `/photo/${photo.photoId}/photo.html`
  return (
    <AppLayout>
      <div className='bg-white p-6'>
        <SuccessError success={success} error={error} />

        {!photos.length ? (
          <div className='max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8'>
            <div className='text-center'>
              <svg
                className='mx-auto h-24 w-24 text-gray-400'
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
              <p className='mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl'>
                Pas de photos ?!
              </p>
              <p className='max-w-xl mt-5 mx-auto text-xl text-gray-500'>Lancez-vous en en envoyant une !</p>
              <InlinePhotoUploadBtn formAction='/add-photo.html'>
                <span className='inline-flex items-center mt-6 px-3 py-1.5 border border-transparent sm:text-sm cursor-pointer font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                  <PhotoIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
                  Ajouter une photo
                </span>
              </InlinePhotoUploadBtn>
            </div>
          </div>
        ) : (
          <>
            <h3 className='text-lg font-medium leading-6 text-gray-900'>
              Photos
              <InlinePhotoUploadBtn formAction='/add-photo.html'>
                <span className='inline-block sm:text-sm cursor-pointer font-medium  text-indigo-600 hover:text-indigo-500'>
                  Ajouter une nouvelle photo
                </span>
              </InlinePhotoUploadBtn>
            </h3>

            <ul
              role='list'
              className='grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 mt-3'>
              {photos.map((photo) => (
                <li key={photo.photoId} className='relative'>
                  <div className='group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100'>
                    <img src={photo.url} alt='' className='pointer-events-none object-cover group-hover:opacity-75' />
                    <a href={photoPageUrl(photo)} className='absolute inset-0 focus:outline-none'>
                      <span className='sr-only'>Voir la photo</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
            <div className='mt-5'>
              <InlinePhotoUploadBtn formAction='/add-photo.html'>
                <span className='inline-flex items-center mt-6 px-3 py-1.5 border border-transparent sm:text-sm cursor-pointer font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                  <PhotoIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
                  Ajouter une nouvelle photo
                </span>
              </InlinePhotoUploadBtn>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
})
