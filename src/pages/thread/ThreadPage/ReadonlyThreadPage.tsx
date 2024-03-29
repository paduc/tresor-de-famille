import React from 'react'
import { z } from 'zod'

import { FamilyId } from '../../../domain/FamilyId.js'
import { PhotoId, zIsPhotoId } from '../../../domain/PhotoId.js'
import { ThreadId, zIsThreadId } from '../../../domain/ThreadId.js'
import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle.js'
import { Epoch } from '../../../libs/typeguards.js'
import { secondaryButtonStyles } from '../../_components/Button.js'
import { AppLayout } from '../../_components/layout/AppLayout.js'
import { ThreadUrl } from '../ThreadUrl.js'
import { TextMark, TipTapContentAsJSON } from '../TipTapTypes.js'
import { Comment, Comments } from './_components/Comments.js'
import { ThreadSharingButton } from './_components/ThreadSharingButton.js'
import { MediaNodeItemComponentByStatus } from './nodes/MediaNode.js'
import { MediaId } from '../../../domain/MediaId.js'
import { MediaStatus } from '../../media/MediaStatus.js'

export type ReadOnlyThreadPageProps = {
  title?: string
  contentAsJSON: TipTapContentAsJSON
  lastUpdated: string | undefined // ISO string
  threadId: ThreadId
  isAuthor: boolean
  authorName: string | undefined
  sharedWithFamilyIds?: FamilyId[]
  familyId: FamilyId
  comments: Comment[]
}

function hasMark(mark: TextMark['type'], marks: TextMark[] | undefined, classStr: string) {
  return marks?.some((m) => m.type === mark) ? classStr : ''
}

export const ReadOnlyThreadPage = withBrowserBundle(
  ({
    contentAsJSON,
    title,
    familyId,
    threadId,
    isAuthor,
    sharedWithFamilyIds,
    comments,
    authorName,
  }: ReadOnlyThreadPageProps) => {
    return (
      <AppLayout>
        <div className='w-full sm:ml-6 max-w-2xl pt-3 pb-40'>
          <div className='w-full mb-3 px-4 sm:px-2'>
            <ThreadSharingButton isAuthor={isAuthor} familyId={familyId} sharedWithFamilyIds={sharedWithFamilyIds} />
          </div>
          {isAuthor ? (
            <div className='w-full mb-3 px-2'>
              <div className='w-full inline-flex items-center place-content-start'>
                <a href={ThreadUrl(threadId, true)} className={`${secondaryButtonStyles}`}>
                  Modifier l'anecdote
                </a>
              </div>
            </div>
          ) : (
            <div className='mb-2 px-4 sm:px-2 text-gray-500 '>
              par <span className='italic'>{authorName}</span>
            </div>
          )}
          <div className='divide-y divide-gray-200 overflow-hidden sm:rounded-lg bg-white shadow'>
            {title ? <div className='relative w-full max-w-2xl px-4 py-5 sm:px-6 text-gray-800 text-xl'>{title}</div> : null}
            <div className='sm:ml-6 max-w-2xl relative'>
              {contentAsJSON.content.map((block, blockIndex) => {
                if (block.type === 'paragraph') {
                  if (block.content) {
                    return (
                      <p
                        key={`block_${blockIndex}`}
                        className='px-4 sm:px-0 py-4 text-gray-800 text-lg  whitespace-pre-wrap [&+p]:-mt-1 [&+p]:border-t-0 [&+p]:pt-0'>
                        {block.content.map((c, textIndex) => {
                          return (
                            <span
                              key={`${threadId}_${blockIndex}_${textIndex}`}
                              className={`${hasMark('bold', c.marks, 'font-bold')} ${hasMark(
                                'italic',
                                c.marks,
                                'italic'
                              )} ${hasMark('strike', c.marks, 'line-through')}`}>
                              {c.text}
                            </span>
                          )
                        })}
                      </p>
                    )
                  }
                }

                if (block.type === 'photoNode') {
                  return <ReadonlyPhotoItem key={`block_${blockIndex}`} node={block} />
                }

                if (block.type === 'mediaNode') {
                  return <ReadonyMediaItem key={`block_${blockIndex}`} node={block} />
                }
              })}
            </div>
          </div>
          {isAuthor ? (
            <div className='w-full mt-3 px-2'>
              <div className='w-full inline-flex items-center place-content-start'>
                <a href={ThreadUrl(threadId, true)} className={`${secondaryButtonStyles}`}>
                  Modifier l'anecdote
                </a>
              </div>
            </div>
          ) : null}

          <div className='mt-6'>
            <Comments comments={comments} threadId={threadId} />
          </div>
        </div>
      </AppLayout>
    )
  }
)

const ReadonlyPhotoItem = (props: {
  node: {
    attrs: {
      photoId: PhotoId
      [key: string]: any
    }
  }
}) => {
  try {
    const attrs = props.node.attrs

    const personsInPhoto: string[] = z.array(z.string()).parse(JSON.parse(decodeURIComponent(attrs.personsInPhoto)))

    const { threadId, photoId, unrecognizedFacesInPhoto, url, caption, locationName, datetime } = z
      .object({
        threadId: zIsThreadId,
        photoId: zIsPhotoId,
        unrecognizedFacesInPhoto: z.number(),
        url: z.string(),
        caption: z.string().optional(),
        locationName: z.string().optional(),
        datetime: z.object({
          userOption: z.union([z.literal('none'), z.literal('user'), z.literal('exif')]),
          userProvided: z.string().optional(),
          exifDatetime: z.string().optional(),
        }),
      })
      .parse(attrs)

    const descriptionOfPeople = personsInPhoto.join(', ')

    const photoPageUrl = `/photo/${photoId}/photo.html?threadId=${threadId}`

    let annotatePrompt = ''
    if (unrecognizedFacesInPhoto) {
      if (unrecognizedFacesInPhoto === 1) {
        if (personsInPhoto.length > 1) {
          annotatePrompt = 'Annoter le dernier visage'
        } else if (personsInPhoto.length === 1) {
          annotatePrompt = "Annoter l'autre visage"
        } else {
          annotatePrompt = 'Annoter le visage'
        }
      } else {
        // More than one unrecognized
        annotatePrompt = `Annoter les ${unrecognizedFacesInPhoto}${personsInPhoto.length ? ' autres' : ''} visages`
      }
    }

    let dateAsText: string | undefined
    if (datetime) {
      if (datetime.userOption === 'exif' && datetime.exifDatetime) {
        dateAsText = `${locationName ? 'le' : 'Le'} ${new Intl.DateTimeFormat('fr', { dateStyle: 'long' }).format(
          new Date(datetime.exifDatetime)
        )}`
      } else if (datetime.userOption === 'user' && datetime.userProvided) {
        dateAsText = datetime.userProvided
      }
    }

    return (
      <div className='grid grid-cols-1 w-full px-4 sm:px-0 py-2' id={photoId}>
        <div className='mb-2'>
          <a href={photoPageUrl}>
            <img src={`${url}?threadId=${threadId}`} className='max-w-full max-h-[50vh] border border-gray-300 shadow-sm' />
          </a>
        </div>
        <div className=''>
          {caption ? <p className='text-md text-gray-600 mb-1 whitespace-pre-wrap'>{caption}</p> : null}
          {locationName || dateAsText ? (
            <p className='text-md text-gray-600 mb-1 whitespace-pre-wrap inline-flex gap-1'>
              {locationName && (
                <span>
                  {locationName}
                  {dateAsText ? ',' : ''}
                </span>
              )}
              {dateAsText && <span>{dateAsText}</span>}
            </p>
          ) : null}
          {descriptionOfPeople ? <p className='text-md text-gray-600 mb-1'>avec {descriptionOfPeople}</p> : null}
          {unrecognizedFacesInPhoto ? (
            <p className='text-md text-gray-600 mb-1'>
              <a href={photoPageUrl} className='font-medium text-indigo-600 hover:text-indigo-500'>
                {annotatePrompt}
              </a>
            </p>
          ) : null}
        </div>
      </div>
    )
  } catch (error) {
    console.error(error)
    return <div>Erreur: photo dont les données sont illisibles.</div>
  }
}

const ReadonyMediaItem = (props: {
  node: {
    attrs: {
      mediaId: MediaId
      url: string
      caption?: string | undefined
      status: MediaStatus
      [key: string]: any
    }
  }
}) => {
  const { mediaId, url, caption, status } = props.node.attrs

  return <MediaNodeItemComponentByStatus mediaId={mediaId} url={url} latestCaption={caption} mediaStatus={status} isReadonly />
}
