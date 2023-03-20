import * as React from 'react'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { VideoListPageUrl } from '../listVideos/VideoListPageUrl'
import { AppLayout } from '../_components/layout/AppLayout'

export const HomePage = withBrowserBundle((props: { userName: string | null }) => {
  const { userName } = props
  return (
    <AppLayout>
      <div className='mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-24 lg:px-8'>
        <h2 className='text-3xl font-bold tracking-tight text-gray-900 md:text-4xl'>
          <span className='block'>Bienvenu sur Trésor de famille</span>
          <span className='block text-indigo-600'>{userName || 'illustre inconnu'}</span>
        </h2>
        <div className='mt-8 flex lg:mt-0 lg:flex-shrink-0'>
          <div className='inline-flex rounded-md shadow'>
            <a
              href={VideoListPageUrl}
              className='inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700'>
              Aller à la liste des vidéos
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  )
})
