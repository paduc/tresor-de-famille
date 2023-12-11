import * as React from 'react'

import { PlusIcon } from '@heroicons/react/24/outline'
import { ThreadId } from '../../domain/ThreadId'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { primaryButtonStyles } from '../_components/Button'
import { SuccessError } from '../_components/SuccessError'
import { AppLayout } from '../_components/layout/AppLayout'
import { FamilyId } from '../../domain/FamilyId'
import { useLoggedInSession, useSession } from '../_components/SessionContext'
import { LockClosedIcon, UsersIcon } from '@heroicons/react/20/solid'
import { ThreadUrl } from '../thread/ThreadUrl'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type ThreadListPageProps = {
  success?: string
  error?: string
  threads: {
    threadId: ThreadId
    title: string
    lastUpdatedOn: number
    clonedFrom?: {
      familyId: FamilyId
      threadId: ThreadId
    }
    familyId: FamilyId
  }[]
}

export const ThreadListPage = withBrowserBundle(({ error, success, threads }: ThreadListPageProps) => {
  const session = useLoggedInSession()

  function getFamily(familyId: FamilyId) {
    return session.userFamilies.find((f) => f.familyId === familyId)
  }

  return (
    <AppLayout>
      <div className='bg-white py-6'>
        <SuccessError success={success} error={error} />
        {threads.length ? (
          <>
            <h3 className='text-lg ml-6 font-medium leading-6 mb-1 text-gray-900'>Histoires et anecdotes</h3>
            <ul role='list' className='divide-y divide-gray-100'>
              {threads.map((thread) => {
                const chatPageUrl = ThreadUrl(thread.threadId)
                const threadFamily = getFamily(thread.familyId)
                return (
                  <li key={thread.threadId} className='flex flex-wrap items-center justify-between gap-y-4 ml-0 sm:flex-nowrap'>
                    <a href={chatPageUrl} className='w-full py-5 px-6 hover:bg-gray-50'>
                      <p className='text-base text-gray-900'>{thread.title}</p>
                      <div className='mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500'>
                        {session.hasFamiliesOtherThanDefault ? (
                          <>
                            <p>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${threadFamily?.color}`}>
                                {threadFamily?.familyName ? (
                                  <>
                                    <UsersIcon className='h-4 w-4 mr-1' />
                                    {threadFamily.familyName}
                                  </>
                                ) : (
                                  <>
                                    <LockClosedIcon className='h-4 w-4 mr-1' /> Personnel
                                  </>
                                )}
                              </span>
                            </p>
                            <svg viewBox='0 0 2 2' className='h-0.5 w-0.5 fill-current'>
                              <circle cx={1} cy={1} r={1} />
                            </svg>
                          </>
                        ) : null}
                        <p>
                          Dernière mise à jour le{' '}
                          <time dateTime={new Date(thread.lastUpdatedOn).toISOString()}>
                            {new Intl.DateTimeFormat('fr').format(new Date(thread.lastUpdatedOn))}
                          </time>
                        </p>
                      </div>
                      {/* <dl className='flex w-full flex-none justify-between gap-x-8 sm:w-auto'>
                    <div className='flex w-16 gap-x-2.5'>
                    <dt>
                    <span className='sr-only'>Total comments</span>
                    <ChatBubbleLeftIconOutline className='h-6 w-6 text-gray-400' aria-hidden='true' />
                    </dt>
                    <dd className='text-sm leading-6 text-gray-900'>32</dd>
                    </div>
                  </dl> */}
                    </a>
                  </li>
                )
              })}
            </ul>
            <p className='mt-5 ml-6 max-w-2xl'>
              <a href='/thread.html' className={`${primaryButtonStyles}`}>
                Démarrer une nouvelle anecdote
              </a>
            </p>
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
