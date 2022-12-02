import * as React from 'react'

import { BunnyCDNVideo } from '../../events'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../_components/layout/AppLayout'
import { SuccessError } from '../_components/SuccessError'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type ListVideosProps = {
  success?: string
  error?: string
  videos: BunnyCDNVideo[]
}

export const ListVideosPage = withBrowserBundle(({ error, success, videos }: ListVideosProps) => {
  return (
    <AppLayout>
      <div className='bg-white p-6'>
        <div>
          <h3 className='text-lg font-medium leading-6 text-gray-900'>Vidéos</h3>
          <p className='mt-1 max-w-2xl text-sm text-gray-500'></p>
        </div>

        <SuccessError success={success} error={error} />

        <ul role='list' className='divide-y divide-gray-200'>
          {videos.map((video) => (
            <li key={video.videoId} className='px-4 py-4 sm:px-0'>
              <a href={`/video/${video.videoId}/annotate.html`}>{video.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </AppLayout>
  )
})
