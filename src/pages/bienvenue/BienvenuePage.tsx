import * as React from 'react'

import { UUID } from '../../domain'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../_components/layout/AppLayout'
import { SendIcon } from '../chat/ChatPage/SendIcon'
import { PhotoIcon } from '@heroicons/react/24/outline'
import { InlinePhotoUpload } from '../_components/InlinePhotoUpload'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

type OpenAIMessage = {
  role: 'assistant' | 'user' | 'system'
  content: string | null
  function_call?: {
    name: string
    arguments: string
  }
}

type OnboardingStep =
  | ({
      goal: 'get-user-name'
      messages: OpenAIMessage[]
    } & ({ stage: 'in-progress' } | { stage: 'done'; result: { name: string; personId: UUID } }))
  | ({ goal: 'upload-first-photo' } & (
      | { stage: 'waiting-upload' }
      | {
          stage: 'done'
          photoId: UUID
          photoUrl: string
          faces: {
            faceId: UUID
          }[]
        }
    ))

export type BienvenuePageProps = {
  userId: UUID
  steps: OnboardingStep[]
}

export const BienvenuePage = withBrowserBundle(({ userId, steps }: BienvenuePageProps) => {
  return (
    <AppLayout hideNavBarItems={true}>
      <div className='bg-white '>
        <div className='max-w-7xl'>
          <div className='pt-10 px-4'>
            <p className='mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl'>Bienvenue!</p>
          </div>
        </div>
        <div className='divide-y divide-dashed divide-gray-400'>
          {steps?.map((step, stepIndex) => {
            const { goal, stage } = step
            if (goal === 'get-user-name') {
              const { messages } = step
              return (
                <div className='pb-5' key={`step_${goal}_${stepIndex}`}>
                  <div className='py-3 px-4'>
                    {messages
                      .filter(({ role, function_call }) => role !== 'system' && !function_call)
                      .map(({ role, content }, index) => {
                        return (
                          <p key={`message${index}`} className={`mt-3 text-xl ${role === 'assistant' ? 'text-gray-500' : ''}`}>
                            {content}
                          </p>
                        )
                      })}
                  </div>
                  {stage !== 'done' ? (
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
                  ) : (
                    <div className='px-4 text-xl text-gray-500'>
                      Bienvenue {step.result.name} ! Je suis ravi de faire ta connaissance.
                    </div>
                  )}
                </div>
              )
            }

            if (goal === 'upload-first-photo') {
              if (stage === 'waiting-upload') {
                return (
                  <div className='pb-5' key={`step_${goal}_${stepIndex}`}>
                    <div className='py-3 px-4'>
                      <p className={`mt-3 text-xl text-gray-500`}>Je te propose d'envoyer une photo de toi !</p>
                      <InlinePhotoUpload chatId={userId} isOnboarding={true}>
                        <span className='inline-flex items-center mt-3 px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                          <PhotoIcon className='-ml-0.5 mr-2 h-6 w-6' aria-hidden='true' />
                          Choisir la photo
                        </span>
                      </InlinePhotoUpload>
                    </div>
                  </div>
                )
              } else {
                const { photoId, photoUrl, faces } = step
                return (
                  <div className='pb-5' key={`step_${goal}_${stepIndex}`}>
                    <div className='py-3 px-4'>
                      <p className={`mt-3 text-xl text-gray-500`}>Je te propose d'envoyer une photo de toi !</p>

                      <div className='grid grid-cols-1 w-full mt-3'>
                        <img src={photoUrl} className='max-w-full max-h-[50vh]' />
                      </div>
                      <div className='mx-auto'>
                        {faces.map((face) => (
                          <PhotoBadge photoId={photoId} faceId={face.faceId} className='m-2' />
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }
            }
          })}
        </div>
      </div>
    </AppLayout>
  )
})

type PhotoBadgeProps = {
  photoId: UUID
  faceId: UUID
  className?: string
}
const PhotoBadge = ({ photoId, className, faceId }: PhotoBadgeProps) => {
  return (
    <img
      src='https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80'
      // src={`/photo/${photoId}/face/${faceId}`}
      className={`inline-block cursor-pointer rounded-full h-14 w-14 bg-white ring-2 ring-white'
      } ${className || ''}`}
    />
  )
}
