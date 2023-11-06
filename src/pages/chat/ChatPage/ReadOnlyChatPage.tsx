import React from 'react'
import { UUID } from '../../../domain'
import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../../_components/layout/AppLayout'
import { TipTapContentAsJSON } from '../TipTapTypes'

export type ReadOnlyChatPageProps = {
  title?: string
  contentAsJSON: TipTapContentAsJSON
}

export const ReadOnlyChatPage = withBrowserBundle(({ contentAsJSON, title }: ReadOnlyChatPageProps) => {
  return (
    <AppLayout>
      <div className='w-full sm:ml-6 max-w-2xl pt-3 pb-40'>
        <div className='divide-y divide-gray-200 overflow-hidden sm:rounded-lg bg-white shadow'>
          {title ? <div className='relative w-full max-w-2xl px-4 py-5 sm:px-6 text-gray-800 text-xl'>{title}</div> : null}
          <div className='sm:ml-6 max-w-2xl relative'>
            {contentAsJSON.content.map((block) => {
              if (block.type === 'paragraph') {
                return (
                  <p className='px-4 sm:px-0 py-4 text-gray-800 text-lg  whitespace-pre-wrap [&+p]:-mt-1 [&+p]:border-t-0 [&+p]:pt-0'>
                    {block.content[0].text}
                  </p>
                )
              }

              if (block.type === 'photoNode') {
                return <ReadonlyPhotoItemWrappedForTipTap node={block} />
              }
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  )
})

const ReadonlyPhotoItemWrappedForTipTap = (props: {
  node: {
    attrs: {
      [Attr in keyof ReadonlyPhotoItemProps]: ReadonlyPhotoItemProps[Attr] extends UUID
        ? UUID
        : ReadonlyPhotoItemProps[Attr] extends number
        ? number
        : string
    }
  }
}) => {
  try {
    const parsedPersonsInPhoto: string[] = JSON.parse(decodeURIComponent(props.node.attrs.personsInPhoto))

    if (!Array.isArray(parsedPersonsInPhoto) || parsedPersonsInPhoto.some((nom) => typeof nom !== 'string')) {
      throw new Error('Illegal name list')
    }

    const remixedProps: ReadonlyPhotoItemProps = { ...props.node.attrs, personsInPhoto: parsedPersonsInPhoto }

    const { chatId, photoId, url, description, personsInPhoto, unrecognizedFacesInPhoto } = remixedProps

    return (
      <ReadonlyPhotoItem
        chatId={chatId}
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
  photoId: UUID
  url: string
  description?: string
  personsInPhoto: string[]
  unrecognizedFacesInPhoto: number
  chatId: UUID
}
const ReadonlyPhotoItem = (props: ReadonlyPhotoItemProps) => {
  const { chatId, description, url, personsInPhoto, unrecognizedFacesInPhoto } = props
  const descriptionOfPeople = personsInPhoto.join(', ')

  const photoPageUrl = `/photo/${props.photoId}/photo.html?threadId=${chatId}`

  return (
    <div className='grid grid-cols-1 w-full px-4 sm:px-0 py-2'>
      <div className='mb-2'>
        <a href={photoPageUrl}>
          <img src={`${url}?threadId=${chatId}`} className='max-w-full max-h-[50vh] border border-gray-300 shadow-sm' />
        </a>
      </div>

      <div className=''>
        <p className='text-md text-gray-600 mb-1 whitespace-pre-wrap'>{description}</p>
        {descriptionOfPeople ? <p className='text-md text-gray-600 mb-1'>avec {descriptionOfPeople}</p> : null}
      </div>
    </div>
  )
}
