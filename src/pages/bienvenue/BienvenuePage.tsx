import * as React from 'react'
import { Combobox } from '@headlessui/react'

import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { useSearchClient } from '../_components/useSearchClient'
import { AppLayout } from '../_components/layout/AppLayout'
import { useState } from 'react'
import { CheckIcon } from '@heroicons/react/20/solid'
import { SuccessError } from '../_components/SuccessError'
import { SendIcon } from '../chat/ChatPage/SendIcon'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type BienvenuePageProps = {
  error?: string
}

export const BienvenuePage = withBrowserBundle(({ error }: BienvenuePageProps) => {
  return (
    <AppLayout hideNavBarItems={true}>
      <div className='bg-white '>
        <div className='max-w-7xl'>
          <div className='pt-10 px-4'>
            <p className='mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl'>Bienvenue!</p>
            <p className='mt-3 text-xl text-gray-500'>Faisons connaissance ! Pourrais-tu te présenter en quelques mots ?</p>
          </div>
        </div>
        <form method='POST' className='relative mt-2'>
          <div className='overflow-hidden border border-gray-200 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
            <label htmlFor='presentation' className='sr-only'>
              Je m'appelle...
            </label>
            <textarea
              rows={3}
              name='presentation'
              id='presentation'
              className='block w-full resize-none border-0 py-3 px-4 focus:ring-0 text-xl'
              placeholder="Je m'appelle ..."
            />

            {/* Spacer element to match the height of the toolbar */}
            <div className='py-2' aria-hidden='true'>
              {/* Matches height of button in toolbar (1px border + 36px content height) */}
              <div className='py-px'>
                <div className='h-9' />
              </div>
            </div>
          </div>

          <div className='absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
            <div className='flex-shrink-0'>
              <button
                type='submit'
                className='inline-flex items-center mt-3 px-3 py-1.5 border border-transparent sm:sm:text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                <SendIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
                Envoyer
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
})
