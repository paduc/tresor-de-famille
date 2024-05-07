import * as React from 'react'

import { PlusIcon } from '@heroicons/react/24/outline'
import { FamilyId } from '../../domain/FamilyId.js'
import { ThreadId } from '../../domain/ThreadId.js'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle.js'
import { linkStyles } from '../_components/Button.js'
import { SuccessError } from '../_components/SuccessError.js'
import { ThreadList, ThreadListProps } from '../_components/ThreadList.js'
import { AppLayout } from '../_components/layout/AppLayout.js'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type ThreadListPageProps = {
  success?: string
  error?: string
  threads: ThreadListProps
}

export const ThreadListPage = withBrowserBundle(({ error, success, threads }: ThreadListPageProps) => {
  return (
    <AppLayout>
      <div className='bg-white py-6'>
        <SuccessError success={success} error={error} />
        {threads.length ? (
          <>
            <h3 className='text-lg ml-6 font-medium leading-6 text-gray-900'>Histoires et anecdotes</h3>
            <div className='ml-6  mb-1'>
              <a href='/thread.html' className={`${linkStyles} text-base`}>
                + Démarrer une nouvelle anecdote
              </a>
            </div>
            <ThreadList threads={threads} />
          </>
        ) : (
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
            <h3 className='mt-2 text-lg font-semibold text-gray-900'>Nous n'avons trouvé aucune anecdote ?!</h3>
            <p className='mt-1 text-sm text-gray-500'>Lancez-vous !</p>
            <div className='mt-6'>
              <a
                href='/thread.html'
                className='button inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
                <PlusIcon className='-ml-0.5 mr-1.5 h-5 w-5' aria-hidden='true' />
                Démarrer une nouvelle anecdote
              </a>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
})
