import * as React from 'react'

import { BunnyCDNVideo } from '../../events'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../_components/layout/AppLayout'
import { SuccessError } from '../_components/SuccessError'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type VideoAnnotationProps = {
  success?: string
  error?: string
  video: BunnyCDNVideo
}

export const VideoAnnotationPage = withBrowserBundle(({ error, success, video }: VideoAnnotationProps) => {
  return (
    <AppLayout>
      <div className='p-6'>
        <h3 className='mt-5 text-3xl font-semibold leading-6 text-gray-900'>{video.title}</h3>

        <a
          className='mt-5 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          href={video.directPlayUrl}
          target='_blank'>
          Voir la vidéo
        </a>

        <SuccessError success={success} error={error} />

        <div className='mt-5 md:grid md:grid-cols-1 md:gap-6'>
          <SequenceBox sequenceId='1' />
          <SequenceBox sequenceId='2' />
          <SequenceBox sequenceId='3' />
        </div>
      </div>
    </AppLayout>
  )
})

type SequenceBoxProps = {
  sequenceId: string
}
const SequenceBox = ({ sequenceId }: SequenceBoxProps) => {
  return (
    <div className='mt-5 md:mt-0'>
      <form action='#' method='POST'>
        <div className='shadow sm:overflow-hidden sm:rounded-md'>
          <div className='space-y-6 bg-white px-4 py-5 sm:p-6'>
            <div>
              <h3 className='text-lg font-medium leading-6 text-gray-900'>Sequence #{sequenceId}</h3>
              <p className='mt-1 text-sm text-gray-500'></p>
            </div>
            <div className='grid grid-cols-3 gap-6'>
              <div className='col-span-3 sm:col-span-2'>
                <label htmlFor='title' className='block text-sm font-medium text-gray-700'>
                  Titre de la séquence
                </label>
                <div className='mt-1 flex rounded-md shadow-sm'>
                  <input
                    type='text'
                    name='title'
                    id='title'
                    className='block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  />
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-6'>
              <div className='col-span-1'>
                <label htmlFor='startTime' className='block text-sm font-medium text-gray-700'>
                  Début
                </label>
                <div className='mt-1 flex rounded-md shadow-sm'>
                  <input
                    type='text'
                    name='startTime'
                    id='startTime'
                    className='block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                    placeholder='00:00:00'
                  />
                </div>
              </div>
              <div className='col-span-1'>
                <label htmlFor='endTime' className='block text-sm font-medium text-gray-700'>
                  Fin
                </label>
                <div className='mt-1 flex rounded-md shadow-sm'>
                  <input
                    type='text'
                    name='endTime'
                    id='endTime'
                    className='block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                    placeholder='00:00:00'
                  />
                </div>
              </div>
              <p className='text-sm text-gray-500'>Les temps sont indiqués en heures, minutes et secondes (hh:mm:ss).</p>
            </div>

            <div>
              <label htmlFor='description' className='block text-sm font-medium text-gray-700'>
                Description
              </label>
              <div className='mt-1'>
                <textarea
                  id='description'
                  name='description'
                  rows={3}
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  defaultValue={''}
                />
              </div>
            </div>

            <div className='grid grid-cols-3 gap-6'>
              <div className='col-span-3 sm:col-span-2'>
                <label htmlFor='lieux' className='block text-sm font-medium text-gray-700'>
                  Lieux
                </label>
                <div className='mt-1 flex rounded-md shadow-sm'>
                  <input
                    type='text'
                    name='lieux'
                    id='lieux'
                    className='block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  />
                </div>
              </div>
            </div>

            <div className='grid grid-cols-3 gap-6'>
              <div className='col-span-3 sm:col-span-2'>
                <label htmlFor='persons' className='block text-sm font-medium text-gray-700'>
                  Personnes
                </label>
                <div className='mt-1 flex rounded-md shadow-sm'>
                  <input
                    type='text'
                    name='persons'
                    id='persons'
                    className='block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-4 py-3 text-right sm:px-6'>
            <button
              type='submit'
              className='inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'>
              Ajouter
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
