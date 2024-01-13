import React from 'react'
import { FamilyId } from '../../../domain/FamilyId'
import { PhotoId } from '../../../domain/PhotoId'
import { ThreadId } from '../../../domain/ThreadId'
import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { Epoch } from '../../../libs/typeguards'
import { AppLayout } from '../../_components/layout/AppLayout'
import { TipTapContentAsJSON } from '../TipTapTypes'
import { ReadWriteToggle } from './ReadWriteToggle'
import { ThreadSharingButton } from './ThreadSharingButton'
import { UUID } from '../../../domain'

export type ReadOnlyThreadPageProps = {
  title?: string
  contentAsJSON: TipTapContentAsJSON
  lastUpdated: Epoch | undefined
  threadId: ThreadId
  isAuthor: boolean
  familyId: FamilyId
}

export const ReadOnlyThreadPage = withBrowserBundle(
  ({ contentAsJSON, title, familyId, threadId, isAuthor }: ReadOnlyThreadPageProps) => {
    return (
      <AppLayout>
        <div className='w-full sm:ml-6 max-w-2xl pt-3 pb-40'>
          <div className='w-full mb-3 px-2'>
            <ThreadSharingButton isAuthor={isAuthor} familyId={familyId} />
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
                  return <ReadonlyPhotoItemWrappedForTipTap key={`block_${index}`} node={block} />
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

const ReadonlyPhotoItemWrappedForTipTap = (props: {
  node: {
    attrs: TipTapAttrs<ReadonlyPhotoItemProps>
  }
}) => {
  try {
    const parsedPersonsInPhoto: string[] = JSON.parse(decodeURIComponent(props.node.attrs.personsInPhoto))

    if (!Array.isArray(parsedPersonsInPhoto) || parsedPersonsInPhoto.some((nom) => typeof nom !== 'string')) {
      throw new Error('Illegal name list')
    }

    const remixedProps: ReadonlyPhotoItemProps = { ...props.node.attrs, personsInPhoto: parsedPersonsInPhoto }

    const { threadId, photoId, url, description, personsInPhoto, unrecognizedFacesInPhoto } = remixedProps

    return (
      <ReadonlyPhotoItem
        threadId={threadId}
        personsInPhoto={personsInPhoto}
        photoId={photoId}
        unrecognizedFacesInPhoto={unrecognizedFacesInPhoto}
        url={url}
        description={description}
        key={photoId}
      />
    )
  } catch (error) {
    console.error(error)
    return <div>Erreur: photo dont les données sont illisibles.</div>
  }
}

type ReadonlyPhotoItemProps = {
  photoId: PhotoId
  url: string
  description?: string
  personsInPhoto: string[]
  unrecognizedFacesInPhoto: number
  threadId: ThreadId
}
const ReadonlyPhotoItem = (props: ReadonlyPhotoItemProps) => {
  const { threadId, description, url, personsInPhoto } = props
  const descriptionOfPeople = personsInPhoto.join(', ')

  const photoPageUrl = `/photo/${props.photoId}/photo.html?threadId=${threadId}`

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
}

type TipTapAttrs<ItemProps extends {}> = {
  [Attr in keyof ItemProps]: ItemProps[Attr] extends ThreadId
    ? ThreadId
    : ItemProps[Attr] extends PhotoId
    ? PhotoId
    : ItemProps[Attr] extends UUID
    ? UUID
    : ItemProps[Attr] extends number
    ? number
    : string
}
