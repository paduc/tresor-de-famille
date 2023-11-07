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
    profilePicUrl: string | null
  }
  photos: { id: UUID; url: string }[]
}

export const PersonPage = withBrowserBundle(({ person, photos }: PersonPageProps) => {
  return (
    <AppLayout>
      <div className='my-5 bg-white p-6'>
        <div className=' md:flex md:items-center md:justify-between md:space-x-5'>
          <div className='flex items-start space-x-5'>
            <div className='flex-shrink-0'>
              <div className='relative'>
                {person.profilePicUrl ? (
                  <img
                    className='h-20 w-20 flex-none rounded-full bg-gray-50 shadow-md border border-gray-200'
                    src={person.profilePicUrl}
                    alt=''
                  />
                ) : (
                  <span className={`inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-500`}>
                    <span className='text-3xl font-medium leading-none text-white'>{getInitials(person.name)}</span>
                  </span>
                )}
                <span className='absolute inset-0 rounded-full shadow-inner' aria-hidden='true' />
              </div>
            </div>
            {/*
          Use vertical padding to simulate center alignment when both lines of text are one line,
          but preserve the same layout if the text wraps without making the image jump around.
        */}
            <div className='pt-1.5'>
              <h1 className='text-2xl font-bold text-gray-900'>{person.name}</h1>
              {/* <p className='text-sm font-medium text-gray-500'>
                Applied for{' '}
                <a href='#' className='text-gray-900'>
                  Front End Developer
                </a>{' '}
                on <time dateTime='2020-08-25'>August 25, 2020</time>
              </p> */}
            </div>
          </div>
          {/* <div className='mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3'>
            <button
              type='button'
              className='inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'>
              Disqualify
            </button>
            <button
              type='button'
              className='inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
              Voir son arbre
            </button>
          </div> */}
        </div>
      </div>

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

function getInitials(name: string): string {
  // Split the name into words using whitespace or hyphen as separators
  const words = name.split(/\s|-/)

  // Initialize an empty string to store the initials
  let initials = ''

  // Iterate through the words and append the first character of each word to the initials string
  for (const word of words) {
    if (word.length > 0) {
      initials += word[0].toUpperCase()
    }
  }

  return initials.substring(0, 3)
}
