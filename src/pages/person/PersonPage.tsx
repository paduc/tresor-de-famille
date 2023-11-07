import * as React from 'react'

import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../_components/layout/AppLayout'
import { UUID } from '../../domain'
import { InlinePhotoUploadBtn } from '../_components/InlinePhotoUploadBtn'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type PersonPageProps = {
  person: {
    name: string
  }
  photos: { id: UUID; url: string }[]
}

export const PersonPage = withBrowserBundle(({ person, photos }: PersonPageProps) => {
  return (
    <AppLayout>
      <div className='bg-white p-6'>
        <h3 className='text-lg font-medium leading-6 text-gray-900'>Photos de {person.name}</h3>

        <InlinePhotoUploadBtn formAction='/add-photo.html'>
          <span className='inline-block sm:text-sm cursor-pointer font-medium  text-indigo-600 hover:text-indigo-500'>
            Ajouter une nouvelle photo
          </span>
        </InlinePhotoUploadBtn>

        <ul role='list' className='grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 mt-3'>
          {photos.map((photo) => (
            <li key={photo.id} className='relative'>
              <div className='group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100'>
                <img src={photo.url} alt='' className='pointer-events-none object-cover group-hover:opacity-75' />
                <a href={`/photo/${photo.id}` + '/photo.html'} className='absolute inset-0 focus:outline-none'>
                  <span className='sr-only'>Voir la photo</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppLayout>
  )
})
