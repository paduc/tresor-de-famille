import { ChatBubbleLeftIcon, LockClosedIcon, UsersIcon } from '@heroicons/react/24/outline'
import * as React from 'react'
import { ThreadId } from '../../domain/ThreadId'
import { useLoggedInSession } from './SessionContext'
import { ThreadUrl } from '../thread/ThreadUrl'
import { FamilyId } from '../../domain/FamilyId'

export function ThreadList({
  threads,
}: {
  threads: {
    threadId: ThreadId
    title: string | undefined
    lastUpdatedOn: number
    authors: {
      name: string
    }[]
    contents: string
    thumbnails: string[]
    familyIds: FamilyId[]
    commentCount: number
  }[]
}) {
  const session = useLoggedInSession()

  function getFamilies(familyIds: FamilyId[]): typeof session['userFamilies'] {
    const families = familyIds.map((familyId) => session.userFamilies.find((f) => f.familyId === familyId)!).filter((f) => !!f)

    if (families.length > 1) {
      return families.filter((f) => !f.isUserSpace)
    }

    return families
  }

  function getTitle({ title, contents }: { title: string | undefined; contents: string }): string {
    if (title?.length) {
      return title
    }

    if (contents.length) {
      return contents.substring(0, 80)
    }

    return 'Sans titre'
  }

  function getContents({ title, contents }: { title: string | undefined; contents: string }): string {
    let contentsFormatted = contents
    if ((!title || !title.length) && contents.length) {
      contentsFormatted = contentsFormatted.substring(80)
    }

    if (contentsFormatted.length > 120) {
      return `${contentsFormatted.substring(0, 120)}...`
    }

    return contentsFormatted
  }

  return (
    <ul role='list' className='divide-y divide-gray-200'>
      {threads.map((thread) => {
        const chatPageUrl = ThreadUrl(thread.threadId)
        const threadFamilies = getFamilies(thread.familyIds)
        return (
          <li key={thread.threadId} className='flex flex-wrap items-center justify-between gap-y-2 ml-0 sm:flex-nowrap'>
            <a href={chatPageUrl} className='w-full py-5 px-6 hover:bg-gray-50'>
              <p className='mb-3 -ml-2 flex flex-wrap gap-1'>
                {threadFamilies.map((threadFamily) => (
                  <span
                    key={`threadFamily_${thread.threadId}_${threadFamily.familyId}`}
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${threadFamily.color}`}>
                    {(threadFamily.familyId as string) === (session.userId as string) ? (
                      <>
                        <LockClosedIcon className='h-4 w-4 mr-1' />
                        {threadFamily.familyName}
                      </>
                    ) : (
                      <>
                        <UsersIcon className='h-4 w-4 mr-1' />
                        {threadFamily.familyName}
                      </>
                    )}
                  </span>
                ))}
              </p>
              <p className='text-base text-gray-900 max-w-xl'>{getTitle(thread)}</p>
              {getContents(thread).length ? (
                <p className='text-xs text-gray-500 mt-1 mb-2 max-w-xl'>{getContents(thread)}</p>
              ) : null}
              {thread.thumbnails.length ? (
                <div className='mt-2 mb-2'>
                  {/** Mobile version */}
                  <div className='sm:hidden flex'>
                    <div className='h-24 w-32 overflow-hidden rounded-lg bg-gray-100'>
                      <img src={thread.thumbnails[0]} alt='' className='h-24 w-32 object-cover' />
                    </div>
                    {thread.thumbnails.length > 1 ? (
                      <div className='h-24 w-32 overflow-hidden ml-3 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500'>
                        <div className=''>+ {thread.thumbnails.length - 1}</div>
                      </div>
                    ) : null}
                  </div>
                  {/** Large version */}
                  <div className='hidden sm:flex gap-2'>
                    {thread.thumbnails.slice(0, 3).map((thumbnail, index) => (
                      <div
                        key={`${thread.threadId}_thumbnail_${thumbnail}_${index}`}
                        className='h-24 w-32 overflow-hidden rounded-lg bg-gray-100'>
                        <img src={thumbnail} alt='' className='h-24 w-32 object-cover' />
                      </div>
                    ))}
                    {thread.thumbnails.length > 3 ? (
                      <div className='h-24 w-32 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center text-gray-500'>
                        <div className=''>+ {thread.thumbnails.length - 3}</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className='mt-2 text-xs leading-5 text-gray-500'>
                <p>Par {thread.authors.map((p) => p.name).join(', ')}</p>
                <p>
                  Dernière mise à jour le{' '}
                  <time dateTime={new Date(thread.lastUpdatedOn).toISOString()}>
                    {new Intl.DateTimeFormat('fr').format(new Date(thread.lastUpdatedOn))}
                  </time>
                </p>
              </div>
              {thread.commentCount ? (
                <div className='mt-1 flex w-full justify-start items-start gap-x-2 sm:w-auto'>
                  <span className='sr-only'>Commentaires</span>
                  <ChatBubbleLeftIcon className='h-6 w-6 text-gray-400' aria-hidden='true' />
                  <div className='text-sm leading-6 text-gray-800'>
                    {thread.commentCount} commentaire{thread.commentCount > 1 ? 's' : ''}
                  </div>
                </div>
              ) : null}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
