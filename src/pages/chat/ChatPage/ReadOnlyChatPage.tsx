import { formatRelative } from 'date-fns'
import { fr } from 'date-fns/locale'
import debounce from 'lodash.debounce'
import React, { useCallback, useEffect, useState } from 'react'
import { UUID } from '../../../domain'
import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { buttonIconStyles, secondaryButtonStyles } from '../../_components/Button'
import { AppLayout } from '../../_components/layout/AppLayout'
import { PhotoIcon } from './PhotoIcon'

import { Node } from '@tiptap/core'
import {
  Attributes,
  Content,
  Editor,
  EditorContent,
  FloatingMenu,
  JSONContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  mergeAttributes,
  useEditor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { fixedForwardRef } from '../../../libs/fixedForwardRef'
import { Epoch } from '../../../libs/typeguards'
import { TipTapContentAsJSON } from '../TipTapTypes'
import { useLoader } from '../../_components/layout/LoaderContext'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'

export type ReadOnlyChatPageProps = {
  chatId: UUID
  title?: string
  contentAsJSON: TipTapContentAsJSON
  lastUpdated: Epoch | undefined
}

export const ReadOnlyChatPage = withBrowserBundle(({ chatId, contentAsJSON }: ReadOnlyChatPageProps) => {
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'px-4 sm:px-0 py-4 text-gray-800 text-lg  whitespace-pre-wrap [&+p]:-mt-1 [&+p]:border-t-0 [&+p]:pt-0',
          },
        },
      }),
      TipTapReadonlyPhotoNode,
    ],
    content: contentAsJSON,
    autofocus: 'end',
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  })

  return (
    <AppLayout>
      <div className='text-lg'>READONLY</div>
      <div className='w-full sm:ml-6 max-w-2xl pt-3 pb-40'>
        <div className='divide-y divide-gray-200 overflow-hidden sm:rounded-lg bg-white shadow'>
          {/* <Title title={title} chatId={chatId} /> */}
          <div className='sm:ml-6 max-w-2xl relative'>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
})

const TipTapReadonlyPhotoNode = Node.create({
  name: 'photoNode',

  group: 'block',

  atom: true,

  addAttributes(): (Attributes | {}) & { [Attr in keyof ReadonlyPhotoItemProps]: any } {
    return {
      chatId: {},
      photoId: {},
      url: {},
      description: {},
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
    return ReactNodeViewRenderer(ReadonlyPhotoItemWrappedForTipTap)
  },
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
      <NodeViewWrapper className='tdf-photo'>
        <ReadonlyPhotoItem
          chatId={chatId}
          personsInPhoto={personsInPhoto}
          photoId={photoId}
          unrecognizedFacesInPhoto={unrecognizedFacesInPhoto}
          url={url}
          description={description}
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
