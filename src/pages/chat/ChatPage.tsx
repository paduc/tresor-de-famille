import { UserCircleIcon, TagIcon } from '@heroicons/react/solid'
import * as React from 'react'
import { JsxElement } from 'typescript'

import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../_components/layout/AppLayout'
import { SuccessError } from '../_components/SuccessError'

function ChatBubbleLeftEllipsisIcon(props: any) {
  return (
    <svg fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' {...props}>
      <path
        clipRule='evenodd'
        fillRule='evenodd'
        d='M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z'
      />
    </svg>
  )
}

const activity = [
  {
    id: 1,
    type: 'comment',
    person: { name: 'Eduardo Benz', href: '#' },
    imageUrl:
      'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
    comment:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. ',
    date: '6d ago',
  },
  {
    id: 2,
    type: 'assignment',
    person: { name: 'Hilary Mahy', href: '#' },
    assigned: { name: 'Kristin Watson', href: '#' },
    date: '2d ago',
  },
  {
    id: 3,
    type: 'tags',
    person: { name: 'Hilary Mahy', href: '#' },
    tags: [
      { name: 'Bug', href: '#', color: 'bg-rose-500' },
      { name: 'Accessibility', href: '#', color: 'bg-indigo-500' },
    ],
    date: '6h ago',
  },
  {
    id: 4,
    type: 'comment',
    person: { name: 'Jason Meyers', href: '#' },
    imageUrl:
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
    comment:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
    date: '2h ago',
  },
]

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type ChatEvent = {
  type: 'photo'
  photoId: string
  url: string
}

export type ChatProps = {
  success?: string
  error?: string
  history: ChatEvent[]
}

export const ChatPage = withBrowserBundle(({ error, success, history }: ChatProps) => {
  return (
    <AppLayout>
      <div className='bg-white p-6'>
        <SuccessError success={success} error={error} />
        <div className='flow-root'>
          <ul role='list' className='-mb-8'>
            {history.map((event) => {
              if (event.type === 'photo') {
                return <PhotoItem event={event} />
              }

              return null
            })}
            <UploadPhotoItem />
            {activity.map((activityItem, activityItemIdx) => (
              <li key={activityItem.id}>
                <div className='relative pb-8'>
                  {activityItemIdx !== activity.length - 1 ? (
                    <span className='absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200' aria-hidden='true' />
                  ) : null}
                  <div className='relative flex items-start space-x-3'>
                    {activityItem.type === 'comment' ? (
                      <>
                        <div className='relative'>
                          <img
                            className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white'
                            src={activityItem.imageUrl}
                            alt=''
                          />

                          <span className='absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px'>
                            <ChatBubbleLeftEllipsisIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
                          </span>
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div>
                            <div className='text-sm'>
                              <a href={activityItem.person.href} className='font-medium text-gray-900'>
                                {activityItem.person.name}
                              </a>
                            </div>
                            <p className='mt-0.5 text-sm text-gray-500'>Commented {activityItem.date}</p>
                          </div>
                          <div className='mt-2 text-sm text-gray-700'>
                            <p>{activityItem.comment}</p>
                          </div>
                        </div>
                      </>
                    ) : activityItem.type === 'assignment' ? (
                      <>
                        <div>
                          <div className='relative px-1'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white'>
                              <UserCircleIcon className='h-5 w-5 text-gray-500' aria-hidden='true' />
                            </div>
                          </div>
                        </div>
                        <div className='min-w-0 flex-1 py-1.5'>
                          <div className='text-sm text-gray-500'>
                            <a href={activityItem.person.href} className='font-medium text-gray-900'>
                              {activityItem.person.name}
                            </a>{' '}
                            assigned{' '}
                            <a href={activityItem.assigned?.href} className='font-medium text-gray-900'>
                              {activityItem.assigned?.name}
                            </a>{' '}
                            <span className='whitespace-nowrap'>{activityItem.date}</span>
                          </div>
                        </div>
                      </>
                    ) : activityItem.type === 'tags' ? (
                      <>
                        <div>
                          <div className='relative px-1'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white'>
                              <TagIcon className='h-5 w-5 text-gray-500' aria-hidden='true' />
                            </div>
                          </div>
                        </div>
                        <div className='min-w-0 flex-1 py-0'>
                          <div className='text-sm leading-8 text-gray-500'>
                            <span className='mr-0.5'>
                              <a href={activityItem.person.href} className='font-medium text-gray-900'>
                                {activityItem.person.name}
                              </a>{' '}
                              added tags
                            </span>{' '}
                            <span className='mr-0.5'>
                              {activityItem.tags?.map((tag) => (
                                <React.Fragment key={tag.name}>
                                  <a
                                    href={tag.href}
                                    className='relative inline-flex items-center rounded-full border border-gray-300 px-3 py-0.5 text-sm'>
                                    <span className='absolute flex flex-shrink-0 items-center justify-center'>
                                      <span className={classNames(tag.color, 'h-1.5 w-1.5 rounded-full')} aria-hidden='true' />
                                    </span>
                                    <span className='ml-3.5 font-medium text-gray-900'>{tag.name}</span>
                                  </a>{' '}
                                </React.Fragment>
                              ))}
                            </span>
                            <span className='whitespace-nowrap'>{activityItem.date}</span>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppLayout>
  )
})

type ChatItemProps = { children: React.ReactNode; isLastItem?: boolean }
const ChatItem = ({ children, isLastItem }: ChatItemProps) => {
  return (
    <li>
      <div className='relative pb-8'>
        {!isLastItem ? <span className='absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200' aria-hidden='true' /> : null}
        <div className='relative flex items-start space-x-3'>{children}</div>
      </div>
    </li>
  )
}

function AddPhotoIcon(props: any) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' {...props}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
    </svg>
  )
}
type UploadPhotoItemProps = {}
const UploadPhotoItem = ({}: UploadPhotoItemProps) => {
  return (
    <ChatItem isLastItem={true}>
      <div>
        <div className='relative px-1'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white'>
            <AddPhotoIcon className='h-5 w-5 text-gray-500' aria-hidden='true' />
          </div>
        </div>
      </div>
      <div className='min-w-0 flex-1'>
        <button
          type='button'
          className='inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
          <AddPhotoIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
          Ajouter une photo
        </button>
      </div>
    </ChatItem>
  )
}

function PhotoIcon(props: any) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' {...props}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z'
      />
    </svg>
  )
}

type PhotoItemProps = { event: ChatEvent & { type: 'photo' } }
const PhotoItem = ({ event }: PhotoItemProps) => {
  return (
    <ChatItem>
      <div>
        <div className='relative px-1'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white'>
            <PhotoIcon className='h-5 w-5 text-gray-500' aria-hidden='true' />
          </div>
        </div>
      </div>
      <div className='min-w-0 flex-1 py-1.5'>
        <img src='https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80' />
      </div>
    </ChatItem>
  )
}
