import { formatRelative } from 'date-fns'
import { fr } from 'date-fns/locale'
import debounce from 'lodash.debounce'
import React, { useCallback, useEffect, useState } from 'react'
import { UUID } from '../../../domain'
import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { buttonIconStyles } from '../../_components/Button'
import { AppLayout } from '../../_components/layout/AppLayout'
import { ProgressiveImg } from '../../_components/ProgressiveImg'

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
import { PhotoId } from '../../../domain/PhotoId'
import { ThreadId } from '../../../domain/ThreadId'
import { PhotoIcon } from '@heroicons/react/20/solid'
import { FamilyId } from '../../../domain/FamilyId'
import { useLoggedInSession, useSession } from '../../_components/SessionContext'
import { ReadWriteToggle } from './ReadWriteToggle'
import { ThreadUrl } from '../ThreadUrl'
import { ThreadSharingButton } from './ThreadSharingButton'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type ThreadPageProps = {
  title?: string
  contentAsJSON: TipTapContentAsJSON
  lastUpdated: Epoch | undefined
  threadId: ThreadId
  isAuthor: boolean
  familyId: FamilyId
  isNewThread: boolean
}

const isBrowserContext = typeof window !== 'undefined'

export const ThreadPage = withBrowserBundle(
  ({ title, contentAsJSON: contentAsJSONFromServer, lastUpdated, threadId, familyId, isAuthor }: ThreadPageProps) => {
    const session = useLoggedInSession()

    const family = session.userFamilies.find((f) => f.familyId === familyId)

    const [isFamilyModalOpen, openFamilyModal] = useState<boolean>(false)

    const richTextEditorRef = React.useRef<RichTextEditorRef>(null)

    let contentAsJSON = contentAsJSONFromServer

    // if (isBrowserContext && localStorage.getItem(threadId)) {
    //   try {
    //     const { timestamp, contentAsJSON: contentAsJSONFromLocalStorage } = JSON.parse(localStorage.getItem(threadId)!)
    //     // console.log({ lastUpdated, timestamp })

    //     if (!lastUpdated || timestamp > lastUpdated) {
    //       // console.log('Using version in localStorage')
    //       contentAsJSON = contentAsJSONFromLocalStorage
    //     }
    //   } catch (error) {
    //     console.error('Failed to parse contents of localStorage')
    //   }
    // }

    if (contentAsJSON.content.at(-1)?.type !== 'paragraph') {
      // @ts-ignore
      contentAsJSON.content.push({ type: 'paragraph' })
    }

    return (
      <AppLayout>
        <div className='w-full sm:ml-6 max-w-2xl pt-3 pb-40'>
          <div className='w-full mb-3'>
            <div className='w-full inline-flex items-center place-content-end'>
              <ThreadSharingButton isAuthor={isAuthor} familyId={familyId} />
            </div>

            <div className='w-full inline-flex items-center place-content-start'>
              <ReadWriteToggle threadId={threadId} />
            </div>
          </div>
          <div className='divide-y divide-gray-200 overflow-hidden sm:rounded-lg bg-white shadow'>
            <Title title={title} threadId={threadId} />
            <div className=''>
              <RichTextEditor ref={richTextEditorRef} content={contentAsJSON} threadId={threadId} lastUpdated={lastUpdated} />
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }
)

export type PhotoItemProps = {
  photoId: PhotoId
  url: string
  description?: string
  personsInPhoto: string[]
  unrecognizedFacesInPhoto: number
  threadId: ThreadId
}
const PhotoItem = (props: PhotoItemProps) => {
  console.log('PhotoItem', props, null, 2)
  const { description, url, personsInPhoto, unrecognizedFacesInPhoto } = props
  const descriptionOfPeople = personsInPhoto.join(', ')

  const photoPageUrl = `/photo/${props.photoId}/photo.html?threadId=${props.threadId}&updated=1`

  return (
    <div className='grid grid-cols-1 w-full px-4 sm:px-0 py-2'>
      <div className='mb-2'>
        <a href={photoPageUrl}>
          <div className='max-w-full max-h-[50vh]'>
            <ProgressiveImg src={url} className='max-w-full max-h-[50vh] border border-gray-300 shadow-sm' />
          </div>
        </a>
      </div>

      <div className=''>
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

const Title = ({ title, threadId }: { title: string | undefined; threadId: ThreadId }) => {
  const [latestTitle, setLatestTitle] = useState<string | undefined>(title)
  const [status, setStatus] = useState<AutosaveStatus>('idle')

  const save = (newTitle: string) => {
    setStatus('saving')
    fetch(ThreadUrl(threadId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clientsideTitleUpdate', title: newTitle }),
    }).then((res) => {
      if (!res.ok) {
        alert("Le titre n'a pas pu être sauvegardé")
        setStatus('error')
        return
      }
      setStatus('saved')
      setLatestTitle(newTitle)
      setTimeout(() => {
        setStatus('idle')
      }, 2000)
    })
  }

  const debouncedSave = useCallback(debounce(save, 3000), [])

  return (
    <div className='relative w-full max-w-2xl'>
      <div className='absolute top-5 right-2'>
        <StatusIndicator status={status} />
      </div>
      <input
        type='text'
        name='title'
        className='w-full px-4 py-5 sm:px-6 text-gray-800 text-xl border-none'
        placeholder='Titre (optionnel)'
        onChange={(e) => {
          const newTitle = e.target.value
          if (newTitle !== latestTitle) {
            debouncedSave(newTitle)
          }
        }}
        defaultValue={title}
      />
    </div>
  )
}

type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error'
const useAutosaveEditor = (
  editor: Editor | null,
  threadId: ThreadId,
  initialLastUpdated: Epoch | undefined
): { status: AutosaveStatus; lastUpdated: Epoch | undefined } => {
  // console.log('useAutosaveEditor', editor)
  const [latestHTML, setLatestHTML] = useState<string | null>(null)
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const [lastUpdated, setLastUpdated] = useState<Epoch | undefined>(initialLastUpdated)

  const save = (newJSON: any) => {
    setStatus('saving')
    // setTimeout(() => {
    //   setStatus('saved')
    //   setLatestHTML(newJSON)
    //   setLastUpdated(Date.now() as Epoch)
    //   setTimeout(() => {
    //     setStatus('idle')
    //   }, 2000)
    // }, 2000)
    localStorage.setItem(threadId, JSON.stringify({ timestamp: Date.now(), contentAsJSON: newJSON }))
    fetch(ThreadUrl(threadId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clientsideUpdate', contentAsJSON: newJSON }),
    }).then((res) => {
      if (!res.ok) {
        setStatus('error')
        return
      }
      setStatus('saved')
      setLatestHTML(newJSON)
      setLastUpdated(Date.now() as Epoch)
      setTimeout(() => {
        setStatus('idle')
      }, 2000)
    })
  }

  const debouncedSave = useCallback(debounce(save, 3000), [])

  useEffect(() => {
    // console.log('autosave useEffect 1')
    const insideSave = () => {
      const newHTML = editor?.getHTML()
      // console.log('editor on update', latestHTML, newHTML)
      if (newHTML && latestHTML !== newHTML) debouncedSave(editor?.getJSON())
    }

    if (editor) {
      // console.log('autosave adding editor onupdate')
      editor.on('update', insideSave)
    }

    return () => {
      // console.log('autosave removing editor onupdate')
      editor?.off('update', insideSave)
    }
  }, [editor, latestHTML])

  useEffect(() => {
    // console.log('autosave useEffect 2')
    if (editor) {
      const newHTML = editor.getHTML()
      // console.log('autosave setting latest html', latestHTML, newHTML)
      setLatestHTML(newHTML)
    }
  }, [editor, latestHTML])

  return { status, lastUpdated }
}

type RichTextEditorProps = {
  content: Content
  threadId: ThreadId
  lastUpdated: Epoch | undefined
}

type RichTextEditorRef = {
  getContents: () => JSONContent
}
const RichTextEditor = fixedForwardRef<RichTextEditorRef, RichTextEditorProps>((props, ref) => {
  const setLoader = useLoader()
  const [contentAsJSONEncoded, setContentAsJSONEncoded] = useState('')
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'px-4 sm:px-0 py-4 text-gray-800 text-lg  whitespace-pre-wrap [&+p]:-mt-1 [&+p]:border-t-0 [&+p]:pt-0',
          },
        },
      }),
      TipTapPhotoNode,
      InsertPhotoMarker,
    ],
    content: props.content,
    autofocus: 'end',
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  })

  const { status, lastUpdated } = useAutosaveEditor(editor, props.threadId, props.lastUpdated)

  const photoUploadForm = React.useRef<HTMLFormElement>(null)

  // Make sure the content always ends with a paragraph
  useEffect(() => {
    editor?.on('update', (e) => {
      const editorHtml = editor.getHTML()
      if (!editorHtml.endsWith('p>')) {
        const { size } = editor.view.state.doc.content

        editor.chain().insertContentAt(size, '<p></p>').run()
      }
    })
  }, [editor])
  const editorRef: React.MutableRefObject<Editor | null> = React.useRef(null)

  React.useImperativeHandle(ref, () => ({
    getContents: () => {
      return editorRef.current!.getJSON()
    },
  }))
  if (!editor) return null

  editorRef.current = editor

  return (
    <>
      <form method='post' ref={photoUploadForm} encType='multipart/form-data'>
        <input type='hidden' name='action' value='insertPhotoAtMarker' />
        <input type='hidden' name='contentAsJSONEncoded' value={contentAsJSONEncoded} />
        <input
          type='file'
          id={`file-input-insert-file-in-rich-text`}
          name='photo'
          className='hidden'
          accept='image/png, image/jpeg, image/jpg'
          onChange={(e) => {
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'insertPhotoMarker',
              })
              .run()

            const contentAsJSON = editor.getJSON()

            setContentAsJSONEncoded(encodeURIComponent(JSON.stringify(contentAsJSON)))

            setLoader(true)
            setTimeout(() => {
              photoUploadForm.current?.submit()
            }, 200)
          }}
        />
      </form>
      <div className='sm:ml-6 max-w-2xl relative'>
        <EditorContent editor={editor} />
        <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <span
            onClick={() => {
              if (photoUploadForm.current) {
                // @ts-ignore
                photoUploadForm.current.elements.photo.click()
              }
            }}
            className={`ml-5 pl-3 border border-y-0 border-r-0 border-l border-l-gray-300 cursor-pointer inline-flex items-center text-indigo-600 hover:underline hover:underline-offset-2`}>
            <PhotoIcon className={`${buttonIconStyles} h-4 w-4`} aria-hidden='true' />
            Insérer une photo
          </span>
        </FloatingMenu>
        <div className='absolute top-4 right-2'>
          <StatusIndicator status={status} />
        </div>
      </div>
      {!!lastUpdated ? (
        <div className='my-2 pl-4 pt-2 sm:pl-6 italic text-gray-500 border-t border-gray-200'>
          Dernière mise à jour {formatRelative(lastUpdated, Date.now(), { locale: fr })}
        </div>
      ) : null}
    </>
  )
})

const PhotoItemWrappedForTipTap = (props: {
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
    console.log('PhotoItem wrapper', props)
    const parsedPersonsInPhoto: string[] = JSON.parse(decodeURIComponent(props.node.attrs.personsInPhoto))

    if (!Array.isArray(parsedPersonsInPhoto) || parsedPersonsInPhoto.some((nom) => typeof nom !== 'string')) {
      throw new Error('Illegal name list')
    }

    const remixedProps: PhotoItemProps = { ...props.node.attrs, personsInPhoto: parsedPersonsInPhoto }

    const { threadId, photoId, url, description, personsInPhoto, unrecognizedFacesInPhoto } = remixedProps

    return (
      <NodeViewWrapper className='tdf-photo'>
        <PhotoItem
          threadId={threadId}
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

const TipTapPhotoNode = Node.create({
  name: 'photoNode',

  group: 'block',

  atom: true,

  addAttributes(): (Attributes | {}) & { [Attr in keyof PhotoItemProps]: any } {
    return {
      threadId: {},
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

const InsertPhotoMarker = Node.create({
  name: 'insertPhotoMarker',

  group: 'block',

  atom: true,

  parseHTML() {
    return [
      {
        tag: 'insert-photo-here',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['insert-photo-here', mergeAttributes(HTMLAttributes)]
  },
})

function StatusIndicator({ status }: { status: AutosaveStatus }) {
  return (
    <>
      {status === 'saving' ? (
        <svg
          className='animate-spin h-5 w-5 text-indigo-500'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'>
          <circle className='opacity-25' cx={12} cy={12} r={10} stroke='currentColor' strokeWidth={4} />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          />
        </svg>
      ) : status === 'saved' ? (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='animate-bounce h-6 w-6 text-green-500'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z'
          />
        </svg>
      ) : status === 'error' ? (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='w-6 h-6 text-red-500'
          onClick={() => {
            alert(
              `L'histoire n'a pas pu être sauvegardée sur le serveur, sans doute à cause d'un problème de connexion.\n\nElle est toutefois sauvegardée sur ce navigateur.\n\nVous pourrez la sauvegarder plus tard en revenant sur cette page.`
            )
          }}>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
          />
        </svg>
      ) : null}
    </>
  )
}
