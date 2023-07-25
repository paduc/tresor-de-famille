import * as React from 'react'

import { PlusIcon } from '@heroicons/react/24/outline'
import { UUID } from '../../domain'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { SuccessError } from '../_components/SuccessError'
import { AppLayout } from '../_components/layout/AppLayout'
import { ChatBubbleLeftIconOutline } from '../chat/ChatPage/ChatBubbleLeftIconOutline'
import { primaryButtonStyles } from '../_components/Button'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type ThreadListPageProps = {
  success?: string
  error?: string
  threads: {
    chatId: UUID
    title: string
    lastUpdatedOn: number
  }[]
}

export const ThreadListPage = withBrowserBundle(({ error, success, threads }: ThreadListPageProps) => {
  return (
    <AppLayout>
      <div className='bg-white p-6'>
        <SuccessError success={success} error={error} />
        {threads.length ? (
          <>
            <h3 className='text-lg font-medium leading-6 mb-1 text-gray-900'>Fils de souvenirs</h3>
            <ul role='list' className='divide-y divide-gray-100'>
              {threads.map((thread) => {
                const chatPageUrl = '/chat/' + thread.chatId + '/chat.html'
                return (
                  <li
                    key={thread.chatId}
                    className='flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 sm:flex-nowrap'>
                    <div>
                      <p className='text-base text-gray-900'>
                        <a href={chatPageUrl}>{thread.title}</a>
                      </p>
                      <div className='mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500'>
                        {/* <p>
                          <a href='' className='hover:underline'>
                            Autre ligne
                          </a>
                        </p>
                        <svg viewBox='0 0 2 2' className='h-0.5 w-0.5 fill-current'>
                          <circle cx={1} cy={1} r={1} />
                        </svg> */}
                        <p>
                          Dernière mise à jour le{' '}
                          <time dateTime={new Date(thread.lastUpdatedOn).toISOString()}>
                            {new Intl.DateTimeFormat('fr').format(new Date(thread.lastUpdatedOn))}
                          </time>
                        </p>
                      </div>
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
                  </li>
                )
              })}
            </ul>
            <p className='mt-5 max-w-2xl'>
              <a href='/chat.html' className={`${primaryButtonStyles}`}>
                Démarrer un nouveau fil
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
            <h3 className='mt-2 text-lg font-semibold text-gray-900'>Nous n'avons trouvé aucun fil de souvenir ?!</h3>
            <p className='mt-1 text-sm text-gray-500'>Lancez-vous !</p>
            <div className='mt-6'>
              <a
                href='/chat.html'
                className='button inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
                <PlusIcon className='-ml-0.5 mr-1.5 h-5 w-5' aria-hidden='true' />
                Démarrer un nouveau fil
              </a>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
})
