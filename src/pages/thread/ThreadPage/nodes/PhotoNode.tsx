import debounce from 'lodash.debounce'
import React, { useCallback, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { UUID } from '../../../../domain'
import { secondaryCircularButtons } from '../../../_components/Button'
import { ProgressiveImg } from '../../../_components/ProgressiveImg'
import { ArrowsPointingOutIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Node } from '@tiptap/core'
import { Attributes, NodeViewWrapper, ReactNodeViewRenderer, mergeAttributes } from '@tiptap/react'
import { PhotoId } from '../../../../domain/PhotoId'
import { ThreadId } from '../../../../domain/ThreadId'
import { PhotoPageUrl } from '../../../photo/PhotoPageUrl'
import { ThreadUrl } from '../../ThreadUrl'
import { AutosaveStatus } from '../hooks/useAutosaveEditor'
import { useRemovePhoto } from '../hooks/useRemovePhoto'
import { StatusIndicator } from '../_components/StatusIndicator'

/*
  A PhotoNode for Tiptap
*/
export const PhotoNode = Node.create({
  name: 'photoNode',

  group: 'block',

  atom: true,

  addAttributes(): (Attributes | {}) & {
    [Attr in keyof PhotoItemProps]: any
  } {
    return {
      threadId: {},
      photoId: {},
      url: {},
      caption: {},
      personsInPhoto: {},
      unrecognizedFacesInPhoto: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'tdf-photo',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['tdf-photo', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(PhotoNodeItem)
  },
})

/*
  A PhotoItem wrapped for Tiptap
*/
const PhotoNodeItem = (props: {
  node: {
    attrs: {
      [Attr in keyof PhotoItemProps]: PhotoItemProps[Attr] extends ThreadId
        ? ThreadId
        : PhotoItemProps[Attr] extends PhotoId
        ? PhotoId
        : PhotoItemProps[Attr] extends UUID
        ? UUID
        : PhotoItemProps[Attr] extends number
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

    const remixedProps: PhotoItemProps = { ...props.node.attrs, personsInPhoto: parsedPersonsInPhoto }

    const { threadId, photoId, url, caption: description, personsInPhoto, unrecognizedFacesInPhoto } = remixedProps

    return (
      <NodeViewWrapper className='tdf-photo'>
        <PhotoItem
          threadId={threadId}
          personsInPhoto={personsInPhoto}
          photoId={photoId}
          unrecognizedFacesInPhoto={unrecognizedFacesInPhoto}
          url={url}
          caption={description}
          key={photoId}
        />
      </NodeViewWrapper>
    )
  } catch (error) {
    console.error(error)
    return (
      <NodeViewWrapper className='tdf-photo'>
        <div>Error: illegal values in photo module</div>
      </NodeViewWrapper>
    )
  }
}

type PhotoItemProps = {
  photoId: PhotoId
  url: string
  caption?: string
  personsInPhoto: string[]
  unrecognizedFacesInPhoto: number
  threadId: ThreadId
}
const PhotoItem = (props: PhotoItemProps) => {
  const deletePhoto = useRemovePhoto()
  const { caption, photoId, url, personsInPhoto, unrecognizedFacesInPhoto, threadId } = props

  const [latestCaption, setLatestCaption] = useState<string | undefined>(caption)
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const descriptionOfPeople = personsInPhoto.join(', ')

  const photoPageUrl = `${PhotoPageUrl(props.photoId)}?threadId=${props.threadId}&edit=1`

  const saveNewCaption = (newCaption: string) => {
    if (latestCaption === newCaption) {
      return
    }

    setStatus('saving')
    fetch(ThreadUrl(threadId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clientsideCaptionUpdate', caption: newCaption, photoId }),
    }).then((res) => {
      if (!res.ok) {
        alert("La nouvelle légende n'a pas pu être sauvegardé")
        setStatus('error')
        return
      }
      setStatus('saved')
      setLatestCaption(newCaption)
      setTimeout(() => {
        setStatus('idle')
      }, 2000)
    })
  }

  const debouncedSaveNewCaption = useCallback(debounce(saveNewCaption, 1500), [])

  return (
    <div id={photoId} className='relative inline-flex w-full px-4 sm:px-0 py-2'>
      <div className='flex-none flex-col w-12 border-r border-gray-200 mr-3 -ml-2'>
        <div className='w-10 h-10 my-10'>
          <button
            onClick={() => {
              if (confirm('Etes-vous sur de vouloir retirer cette photo de cette histoire ?')) {
                deletePhoto(props.photoId)
              }
            }}
            title='Retirer la photo'
            className={`${secondaryCircularButtons} bg-opacity-60`}>
            <TrashIcon className={`h-5 w-5`} />
          </button>
        </div>

        <div className='w-10 h-10 my-10'>
          {/* I dont know why an <a></a> does not work... */}
          <button
            onClick={() => {
              location.href = photoPageUrl
            }}
            title='Ouvrir la photo'
            className={`${secondaryCircularButtons} bg-opacity-60`}>
            <ArrowsPointingOutIcon className={`h-5 w-5`} />
          </button>
        </div>
      </div>

      <div>
        <div className='mb-2'>
          <div className='max-w-full max-h-[50vh]'>
            <ProgressiveImg src={url} className='max-w-full max-h-[50vh] border border-gray-300 shadow-sm' />
          </div>
        </div>

        <div className='w-full pr-10'>
          <div className='inline-flex my-3 mr-10 items-center w-full'>
            <TextareaAutosize
              minRows={1}
              className='flex-1 text-md text-gray-600 whitespace-pre-wrap placeholder:italic border-none p-0 ring-0 focus:ring-0'
              placeholder='Cliquer ici pour ajouter une légende à la photo'
              defaultValue={latestCaption || ''}
              onChange={(e) => {
                debouncedSaveNewCaption(e.target.value)
              }}
            />
            <div className='flex-0 h-6 w-8'>
              <StatusIndicator status={status} />
            </div>
          </div>

          {descriptionOfPeople ? <p className='text-md text-gray-600 mb-1'>avec {descriptionOfPeople}</p> : null}
          {unrecognizedFacesInPhoto ? (
            <p className='text-md text-gray-600 mb-1'>
              <a href={photoPageUrl} className='font-medium text-indigo-600 hover:text-indigo-500'>
                {unrecognizedFacesInPhoto === 1 ? `Annoter le visage` : `Annoter les ${unrecognizedFacesInPhoto} visages`}
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
