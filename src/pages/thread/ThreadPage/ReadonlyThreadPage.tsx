import React from 'react'
import { z } from 'zod'
import { FamilyId } from '../../../domain/FamilyId'
import { PhotoId, zIsPhotoId } from '../../../domain/PhotoId'
import { ThreadId, zIsThreadId } from '../../../domain/ThreadId'
import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { Epoch } from '../../../libs/typeguards'
import { AppLayout } from '../../_components/layout/AppLayout'
import { TipTapContentAsJSON } from '../TipTapTypes'
import { ReadWriteToggle } from './ReadWriteToggle'
import { ThreadSharingButton } from './ThreadSharingButton'

export type ReadOnlyThreadPageProps = {
  title?: string
  contentAsJSON: TipTapContentAsJSON
  lastUpdated: Epoch | undefined
  threadId: ThreadId
  isAuthor: boolean
  sharedWithFamilyIds?: FamilyId[]
  familyId: FamilyId
}

export const ReadOnlyThreadPage = withBrowserBundle(
  ({ contentAsJSON, title, familyId, threadId, isAuthor, sharedWithFamilyIds }: ReadOnlyThreadPageProps) => {
    return (
      <AppLayout>
        <div className='w-full sm:ml-6 max-w-2xl pt-3 pb-40'>
          <div className='w-full mb-3 px-2'>
            <ThreadSharingButton isAuthor={isAuthor} familyId={familyId} sharedWithFamilyIds={sharedWithFamilyIds} />
          </div>
          <div className='divide-y divide-gray-200 overflow-hidden sm:rounded-lg bg-white shadow'>
            {title ? <div className='relative w-full max-w-2xl px-4 py-5 sm:px-6 text-gray-800 text-xl'>{title}</div> : null}
            <div className='sm:ml-6 max-w-2xl relative'>
              {contentAsJSON.content.map((block, index) => {
                if (block.type === 'paragraph') {
                  if (block.content) {
                    return (
                      <p
                        key={`block_${index}`}
                        className='px-4 sm:px-0 py-4 text-gray-800 text-lg  whitespace-pre-wrap [&+p]:-mt-1 [&+p]:border-t-0 [&+p]:pt-0'>
                        {block.content[0]?.text}
                      </p>
                    )
                  }
                }

                if (block.type === 'photoNode') {
                  return <ReadonlyPhotoItem key={`block_${index}`} node={block} />
                }
              })}
            </div>
          </div>
          <div className='w-full mt-3 px-2'>
            {isAuthor ? (
              <div className='w-full inline-flex items-center place-content-start'>
                <ReadWriteToggle readOnly threadId={threadId} />
              </div>
            ) : null}
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

    const { threadId, photoId, unrecognizedFacesInPhoto, url, description } = z
      .object({
        threadId: zIsThreadId,
        photoId: zIsPhotoId,
        unrecognizedFacesInPhoto: z.number(),
        url: z.string(),
        description: z.string().optional(),
      })
      .parse(attrs)

    const descriptionOfPeople = personsInPhoto.join(', ')

    const photoPageUrl = `/photo/${photoId}/photo.html?threadId=${threadId}`

    return (
      <div className='grid grid-cols-1 w-full px-4 sm:px-0 py-2'>
        <div className='mb-2'>
          <a href={photoPageUrl}>
            <img src={`${url}?threadId=${threadId}`} className='max-w-full max-h-[50vh] border border-gray-300 shadow-sm' />
          </a>
        </div>

        <div className=''>
          <p className='text-md text-gray-600 mb-1 whitespace-pre-wrap'>{description}</p>
          {descriptionOfPeople ? <p className='text-md text-gray-600 mb-1'>avec {descriptionOfPeople}</p> : null}
        </div>
      </div>
    )
  } catch (error) {
    console.error(error)
    return <div>Erreur: photo dont les données sont illisibles.</div>
  }
}
