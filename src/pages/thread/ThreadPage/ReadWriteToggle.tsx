import React, { useEffect, useState } from 'react'
import { ThreadId } from '../../../domain/ThreadId'
import { ThreadUrl } from '../ThreadUrl'

export const ReadWriteToggle = ({ readOnly, threadId }: { readOnly?: boolean; threadId: ThreadId }) => {
  return (
    <div className='flex items-center'>
      <a
        className={`${
          readOnly ? 'bg-gray-200' : 'bg-indigo-600'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
        id='headlessui-switch-:rb:'
        role='switch'
        href={ThreadUrl(threadId, readOnly)}
        tabIndex={0}
        aria-checked='false'
        data-headlessui-state
        aria-labelledby='headlessui-label-:rc:'>
        <span
          aria-hidden='true'
          className={`${
            readOnly ? 'translate-x-0' : 'translate-x-5'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </a>
      <a href={ThreadUrl(threadId, readOnly)} className='ml-3 text-base text-gray-500 mr-2'>
        {readOnly ? "Activer l'édition" : "Désactiver l'édition"}
      </a>
    </div>
  )
}
