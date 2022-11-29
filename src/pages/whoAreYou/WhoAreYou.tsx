import * as React from 'react'

import { CheckCircleIcon, TrashIcon } from '@heroicons/react/solid'
import { SearchIcon } from '@heroicons/react/outline'

import { AppLayout } from '../_components/layout/AppLayout'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'

export type WhoAreYouPageProps = {
  error?: string
}

export const WhoAreYouPage = withBrowserBundle(({ error }: WhoAreYouPageProps) => {
  return (
    <AppLayout>
      <div className='bg-white h-screen	'>
        <div className='max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <p className='mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl'>Qui es-tu ?</p>
            <p className='max-w-xl mt-5 mx-auto text-xl text-gray-500'>
              Eh oui, on n'accède pas au trésor aussi facilement. <br />
              Il faut montrer patte blanche en se désignant dans l'arbre généalogique ! Logique !!!
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
})
