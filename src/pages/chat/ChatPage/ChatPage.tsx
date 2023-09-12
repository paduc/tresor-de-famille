import React from 'react'

import { UUID } from '../../../domain'
import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { buttonIconStyles, secondaryButtonStyles } from '../../_components/Button'
import { InlinePhotoUploadBtn } from '../../_components/InlinePhotoUploadBtn'
import { AppLayout } from '../../_components/layout/AppLayout'
import { PhotoIcon } from './PhotoIcon'

import { Node } from '@tiptap/core'
import {
  Attributes,
  EditorContent,
  FloatingMenu,
  JSONContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  mergeAttributes,
  useEditor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type MessageItemProps = {
  message: {
    body: string
  }
}

export type PhotoItemProps = {
  photoId: UUID
  url: string
  description?: string
  personsInPhoto: string[]
  unrecognizedFacesInPhoto: number
  chatId: UUID
}

export type ChatEvent = { timestamp: number } & (
  | ({
      type: 'photo'
    } & PhotoItemProps)
  | ({
      type: 'message'
    } & MessageItemProps)
)

export type ChatPageProps = {
  success?: string
  error?: string
  title?: string
  history: ChatEvent[]
  chatId: UUID
}

export const ChatPage = withBrowserBundle(({ error, success, title, history, chatId }: ChatPageProps) => {
  const newMessageAreaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleChange = (json: JSONContent) => {
    console.log({ json })
  }

  let content = history.reduce((content, event): string => {
    if (event.type === 'photo') {
      return `${content}<tdf-photo url="${event.url}" chatId="${event.chatId}" photoId="${event.photoId}" description="${
        event.description || ''
      }" unrecognizedFacesInPhoto="${event.unrecognizedFacesInPhoto}" personsInPhoto="${encodeURIComponent(
        JSON.stringify(event.personsInPhoto)
      )}"></tdf-photo>`
    }

    if (event.type === 'message') {
      return content + `<p>${event.message.body}</p>`
    }

    return content
  }, '')

  if (history.at(-1)?.type === 'photo') {
    content += '<p></p>'
  }

  return (
    <AppLayout>
      <div className='pt-2 overflow-hidden pb-40'>
        <form method='post'>
          <input type='hidden' name='action' value='setTitle' />
          <input
            type='text'
            name='title'
            className='w-full sm:ml-6 max-w-2xl px-4 py-4 text-gray-800 text-xl bg-white border  border-gray-300 border-x-white sm:border-x-gray-300 shadow-sm'
            placeholder='Titre (optionnel)'
            defaultValue={title}
          />
        </form>
        <div className='mt-4 mb-4'>
          <RichTextEditor onChange={handleChange} content={content} />
        </div>
        <div className='ml-4 sm:ml-6 mt-3'>
          <InlinePhotoUploadBtn formAction='/add-photo.html' formKey='addNewPhotoToChat' hiddenFields={{ chatId }}>
            <span
              className={`${secondaryButtonStyles}`}
              onClick={(e) => {
                if (newMessageAreaRef.current !== null && newMessageAreaRef.current.value !== '') {
                  e.preventDefault()
                  alert("Merci d'envoyer votre souvenir avant d'ajouter une photo.")
                }
              }}>
              <PhotoIcon className={`${buttonIconStyles}`} aria-hidden='true' />
              Ajouter une photo
            </span>
          </InlinePhotoUploadBtn>
        </div>
      </div>
    </AppLayout>
  )
})

const PhotoItem = (props: PhotoItemProps) => {
  const { description, url, personsInPhoto, unrecognizedFacesInPhoto } = props
  const descriptionOfPeople = personsInPhoto.join(', ')

  const photoPageUrl = `/photo/${props.photoId}/photo.html?threadId=${props.chatId}`

  return (
    <div className='grid grid-cols-1 w-full px-4 sm:px-8 py-2'>
      <div className='mb-2'>
        <a href={photoPageUrl}>
          <img src={url} className='max-w-full max-h-[50vh] border border-gray-300 shadow-sm' />
        </a>
      </div>

      <div className='sm:px-2'>
        <p className='text-md text-gray-600 mb-1 whitespace-pre-wrap'>{description}</p>
        {descriptionOfPeople ? <p className='text-md text-gray-600 mb-1'>avec {descriptionOfPeople}</p> : null}
        {!(description || description?.length) && unrecognizedFacesInPhoto ? (
          <p className='text-md text-gray-600 mb-1'>
            <a href={photoPageUrl} className='font-medium text-indigo-600 hover:text-indigo-500'>
              Annoter le(s) {unrecognizedFacesInPhoto} visage(s)
            </a>
          </p>
        ) : null}
      </div>
    </div>
  )
}

function RichTextEditor(props: { content: string; onChange: (json: JSONContent) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class:
              'sm:ml-6 max-w-2xl px-4 py-4 text-gray-800 text-lg bg-white border  border-gray-300 border-x-white sm:border-x-gray-300 shadow-sm whitespace-pre-wrap [&+p]:-mt-1 [&+p]:border-t-0 [&+p]:pt-0',
          },
        },
      }),
      TipTapPhotoNode,
    ],
    content: props.content,
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  })

  // editor?.on('update', () => {
  //   const jSON = editor.getJSON()
  //   props.onChange(jSON)
  // })

  if (!editor) {
    return <>Error lors du chargement de l'éditeur d'anecdotes</>
  }

  return (
    <>
      <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <span
          className={`ml-5 pl-3 border border-y-0 border-r-0 border-l border-l-gray-300 cursor-pointer inline-flex items-center text-indigo-600 hover:underline hover:underline-offset-2`}>
          <PhotoIcon className={`${buttonIconStyles} h-4 w-4`} aria-hidden='true' />
          Insérer une photo
        </span>
      </FloatingMenu>
      <EditorContent editor={editor} />
    </>
  )
}

const PhotoItemWrappedForTipTap = (props: {
  node: {
    attrs: {
      [Attr in keyof PhotoItemProps]: PhotoItemProps[Attr] extends UUID
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

    const { chatId, photoId, url, description, personsInPhoto, unrecognizedFacesInPhoto } = remixedProps

    return (
      <NodeViewWrapper className='tdf-photo'>
        <PhotoItem
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
    return (
      <NodeViewWrapper className='tdf-photo'>
        <div>Error: illegal values in photo module</div>
      </NodeViewWrapper>
    )
  }
}

const TipTapPhotoNode = Node.create({
  name: 'photoNode',

  group: 'block',

  atom: true,

  addAttributes(): (Attributes | {}) & { [Attr in keyof PhotoItemProps]: any } {
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
    return ReactNodeViewRenderer(PhotoItemWrappedForTipTap)
  },
})
