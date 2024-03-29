import React, { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { primaryButtonStyles, smallButtonStyles } from '../../../_components/Button.js'
import classNames from 'classnames'
import { CommentId } from '../../../../domain/CommentId.js'
import { useLoggedInSession } from '../../../_components/SessionContext.js'
import axios, { AxiosError } from 'axios'
import { ThreadId } from '../../../../domain/ThreadId.js'
import { AddCommentApiURL } from '../../../commentApi/AddCommentApiURL.js'
import { XCircleIcon } from '@heroicons/react/24/outline'

export type Comment = CommentsProps['comments'][number]
type CommentsProps = {
  threadId: ThreadId
  comments: {
    commentId: CommentId
    author: {
      name: string
      profilePicUrl: string
    }
    body: string // TiptapJSON ? // Dont forget to sanitize
    dateTime: string // TODO: create a dateTime type and zod validator
  }[]
}
export function Comments({ comments: originalComments, threadId }: CommentsProps) {
  const { profilePic } = useLoggedInSession()

  const [comments, setComments] = useState<Comment[]>(originalComments)
  const [error, setError] = useState<{ code: number; text: string } | null>(null)
  const [comment, setComment] = useState<string>('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const { comment } = form.elements as typeof form.elements & {
      comment: HTMLInputElement
    }

    if (!comment.value.trim().length) {
      return
    }

    const formData = new FormData()
    formData.append('threadId', threadId)
    formData.append('comment', comment.value)

    try {
      const res = await axios.post(AddCommentApiURL, formData, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      })
      if (res.status === 200) {
        const { comments } = res.data
        setComments(comments)
        setComment('')
      } else {
        setError({ code: res.status, text: res.statusText })
        console.error('Axios res.status', res.status)
      }
    } catch (error) {
      console.error('Axios failed', error)
      if (error instanceof AxiosError && error.response) {
        setError({ code: error.response.status, text: error.response.data || error.response.statusText })
      } else {
        setError({ code: 500, text: 'Erreur coté serveur.' })
      }
    }
  }

  if (!comments) {
    return null
  }

  return (
    <div className='px-3 sm:px-0 text-sm sm:text-base'>
      <ul role='list' className='space-y-4'>
        {comments.map(({ commentId, author, body, dateTime }, index) => (
          <li key={commentId} className='relative flex gap-x-4'>
            <div
              className={
                // @ts-ignore
                classNames(
                  index === comments.length - 1 ? 'h-8 sm:h-10' : '-bottom-8 sm:-bottom-10',
                  'absolute left-0 top-0 flex w-8 sm:w-10 justify-center'
                )
              }>
              <div className='w-px bg-gray-200' />
            </div>

            <img
              src={author.profilePicUrl}
              alt={`photo de ${author.name}`}
              className='relative mt-3 h-8 w-8 sm:h-10 sm:w-10 flex-none rounded-full bg-gray-50'
            />
            <div className='flex-auto rounded-lg shadow bg-white p-3 '>
              <div className='flex justify-between gap-x-4'>
                <div className='py-0.5  leading-5 text-gray-500'>
                  <span className='font-medium text-gray-900 text-sm'>{author.name}</span>
                </div>
                <time dateTime={dateTime} className='flex-none py-0.5  leading-5 text-gray-500 text-sm'>
                  {new Intl.DateTimeFormat('fr').format(new Date(dateTime))}
                </time>
              </div>
              <p className=' leading-6 text-gray-500'>{body}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className='mt-3 flex gap-x-3'>
        <img
          src={`${profilePic}`}
          alt='Votre photo de profile'
          className='h-8 w-8 sm:h-10 sm:w-10 flex-none rounded-full bg-gray-50'
        />
        <form onSubmit={handleSubmit} className='relative flex-auto'>
          <div className='overflow-hidden rounded-lg pb-12 shadow focus-within:ring-2 focus-within:ring-indigo-600 bg-white'>
            <label htmlFor='comment' className='sr-only'>
              Ajoutez un commentaire
            </label>
            <TextareaAutosize
              name='comment'
              id='comment'
              minRows={3}
              className='block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0  sm:leading-6'
              placeholder='Ajoutez un commentaire'
              value={comment}
              onChange={(e) => setComment(e.currentTarget.value)}
            />
            {error ? (
              <div className='w-full bg-red-50 p-4'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <XCircleIcon className='h-5 w-5 text-red-400' aria-hidden='true' />
                  </div>
                  <div className='ml-3'>
                    <div className='text-sm text-red-700'>
                      {error.code}: {error.text}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className='absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
            <button type='submit' className={`${primaryButtonStyles} ${smallButtonStyles}`}>
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
