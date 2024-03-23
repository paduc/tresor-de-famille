import * as React from 'react'

import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { useLoggedInSession } from '../_components/SessionContext'
import { AppLayout } from '../_components/layout/AppLayout'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type MediaListProps = {}

export const MediaListPage = withBrowserBundle(({}: MediaListProps) => {
  const session = useLoggedInSession()

  return (
    <AppLayout>
      <div className='bg-white p-6'>
        <h3 className='text-lg font-medium leading-6 text-gray-900'>vidéos et audios</h3>
      </div>
    </AppLayout>
  )
})
