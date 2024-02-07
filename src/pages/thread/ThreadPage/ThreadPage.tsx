import { formatRelative } from 'date-fns'
import { fr } from 'date-fns/locale'
import debounce from 'lodash.debounce'
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { UUID } from '../../../domain'
import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { linkStyles, secondaryCircularButtons } from '../../_components/Button'
import { ProgressiveImg } from '../../_components/ProgressiveImg'
import { AppLayout } from '../../_components/layout/AppLayout'

import { Bars3BottomLeftIcon, PhotoIcon } from '@heroicons/react/20/solid'
import { ArrowsPointingOutIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Node } from '@tiptap/core'
import {
  Attributes,
  Content,
  Editor,
  EditorContent,
  JSONContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  findChildren,
  mergeAttributes,
  useEditor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { FamilyId } from '../../../domain/FamilyId'
import { PhotoId } from '../../../domain/PhotoId'
import { ThreadId } from '../../../domain/ThreadId'
import { fixedForwardRef } from '../../../libs/fixedForwardRef'
import { Epoch } from '../../../libs/typeguards'
import { PhotoPageUrl } from '../../photo/PhotoPageUrl'
import { PhotoURL } from '../../photoApi/PhotoURL'
import { MediaSelector } from '../MediaSelector'
import { ThreadUrl } from '../ThreadUrl'
import { TipTapContentAsJSON, removeSeparatorNodes } from '../TipTapTypes'
import { Comment, Comments } from './Comments'
import { ThreadSharingButton } from './ThreadSharingButton'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type ThreadPageProps = {
  title?: string
  contentAsJSON: TipTapContentAsJSON
  lastUpdated: string | undefined // ISO string
  threadId: ThreadId
  isAuthor: boolean
  familyId: FamilyId
  sharedWithFamilyIds?: FamilyId[]
  isNewThread: boolean
  comments: Comment[]
}

const isBrowserContext = typeof window !== 'undefined'

export const ThreadPage = withBrowserBundle(
  ({
    title,
    contentAsJSON: contentAsJSONFromServer,
    lastUpdated: lastUpdatedAsString,
    threadId,
    familyId,
    sharedWithFamilyIds,
    isAuthor,
    comments,
  }: ThreadPageProps) => {
    const richTextEditorRef = React.useRef<RichTextEditorRef>(null)

    // let contentAsJSONBeforePreparation = contentAsJSONFromServer

    const lastUpdated = lastUpdatedAsString ? new Date(lastUpdatedAsString) : undefined

    // if (isBrowserContext && localStorage.getItem(threadId)) {
    //   try {
    //     const { localDatetime, contentAsJSON: contentAsJSONFromLocalStorage } = JSON.parse(localStorage.getItem(threadId)!)
    //     // console.log({ lastUpdated, localDatetime })

    //     // maybe validate localDatetime with z.string().datetime()

    //     if (localDatetime && (!lastUpdated || new Date(localDatetime) > lastUpdated)) {
    //       // console.log('Using version in localStorage')
    //       contentAsJSONBeforePreparation = contentAsJSONFromLocalStorage
    //     }
    //   } catch (error) {
    //     console.error('Failed to parse contents of localStorage')
    //   }
    // }

    const contentAsJSON = separatePhotoNodesInJSONContent(contentAsJSONFromServer)

    if (contentAsJSON.content.length === 0) {
      // @ts-ignore
      contentAsJSON.content.push({ type: 'paragraph' })
    }

    if (contentAsJSON.content.at(-1)?.type !== 'separatorNode') {
      // @ts-ignore
      contentAsJSON.content.push({ type: 'separatorNode' })
    }

    return (
      <AppLayout>
        <div className='w-full sm:ml-6 max-w-2xl pt-3 pb-40'>
          <div className='w-full mb-3 px-2'>
            <ThreadSharingButton isAuthor={isAuthor} familyId={familyId} sharedWithFamilyIds={sharedWithFamilyIds} />
          </div>
          <div className='divide-y divide-gray-200 overflow-hidden sm:rounded-lg bg-white shadow'>
            {title ? <Title title={title} threadId={threadId} /> : null}
            <div className=''>
              <RichTextEditor ref={richTextEditorRef} content={contentAsJSON} threadId={threadId} lastUpdated={lastUpdated} />
            </div>
          </div>
          <div className='mt-2 ml-4 sm:ml-6'>
            <a href={ThreadUrl(threadId, false)} className={`${linkStyles}`}>
              J'ai terminé mes modifications
            </a>
          </div>
          <div className='mt-6'>
            <Comments comments={comments} threadId={threadId} />
          </div>
        </div>
      </AppLayout>
    )
  }
)

export type PhotoItemProps = {
  photoId: PhotoId
  url: string
  caption?: string
  personsInPhoto: string[]
  unrecognizedFacesInPhoto: number
  threadId: ThreadId
}
const PhotoItem = (props: PhotoItemProps) => {
  const deletePhoto = useDeletePhoto()
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
    <div className='relative grid grid-cols-1 w-full px-4 sm:px-0 py-2'>
      <div className='absolute top-4 left-6 sm:left-3'>
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

      <div className='absolute top-16 left-6 sm:left-3'>
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

  const debouncedSave = useCallback(debounce(save, 1500), [])

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
  initialLastUpdated: Date | undefined
): { status: AutosaveStatus; lastUpdated: Date | undefined } => {
  // console.log('useAutosaveEditor', editor)
  const [latestHTML, setLatestHTML] = useState<string | null>(null)
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(initialLastUpdated)

  const save = (json: TipTapContentAsJSON) => {
    const newJSON = removeSeparatorNodes(json)
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
      setLastUpdated(new Date())
      setTimeout(() => {
        setStatus('idle')
      }, 2000)
    })
  }

  const debouncedSave = useCallback(debounce(save, 1500), [])

  useEffect(() => {
    // console.log('autosave useEffect 1')

    const insideSave = () => {
      if (!editor) return
      const newHTML = editor.getHTML()
      // console.log('editor on update', latestHTML, newHTML)
      if (newHTML && latestHTML !== newHTML) {
        setLatestHTML(newHTML)
        debouncedSave(editor.getJSON() as TipTapContentAsJSON)
      }
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
  lastUpdated: Date | undefined
}

type RichTextEditorRef = {
  getContents: () => JSONContent
}

const DeletePhotoCtx = createContext<((photoId: PhotoId) => unknown) | null>(null)

const useDeletePhoto = () => {
  const deletePhoto = useContext(DeletePhotoCtx)
  if (deletePhoto === null) {
    throw new Error('This hook should only be used in a proper Provider')
  }

  return deletePhoto
}

const EditorCtx = createContext<{ editorRef: React.MutableRefObject<Editor | null>; threadId: ThreadId } | null>(null)

const useEditorCtx = () => {
  const editorRef = useContext(EditorCtx)
  if (editorRef === null) {
    throw new Error('This hook should only be used in a proper Provider')
  }

  return editorRef
}

const RichTextEditor = fixedForwardRef<RichTextEditorRef, RichTextEditorProps>((props, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'px-4 sm:px-0 py-4 text-gray-800 text-lg  whitespace-pre-wrap [&+p]:-mt-1 [&+p]:border-t-0 [&+p]:pt-0',
          },
        },
      }),
      PhotoNode,
      SeparatorNode,
    ],
    content: props.content,
    autofocus: null,
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  })

  const { status, lastUpdated } = useAutosaveEditor(editor, props.threadId, props.lastUpdated)

  // Make sure the content always ends with a paragraph
  useEffect(() => {
    editor?.on('update', (e) => {
      addSeparatorBetweenNodes(editor)
    })
  }, [editor])
  const editorRef: React.MutableRefObject<Editor | null> = React.useRef(null)

  React.useImperativeHandle(ref, () => ({
    getContents: () => {
      return editorRef.current!.getJSON()
    },
  }))

  const handleDeletePhoto = useCallback(
    (photoId: PhotoId) => {
      if (!editor) return null

      const photoNodes = findChildren(
        editor.state.doc,
        (node) => node.type.name === 'photoNode' && node.attrs['photoId'] === photoId
      )

      if (photoNodes.length) {
        const photoNode = photoNodes.at(0)!
        editor
          .chain()
          .focus()
          .deleteRange({ from: photoNode.pos, to: photoNode.pos + photoNode.node.nodeSize })
          .run()
      }
    },
    [editor]
  )

  if (!editor) return null

  editorRef.current = editor

  return (
    <EditorCtx.Provider value={{ editorRef, threadId: props.threadId }}>
      <DeletePhotoCtx.Provider value={handleDeletePhoto}>
        <div className='sm:ml-6 max-w-2xl relative'>
          <EditorContent editor={editor} />
          {/* <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <MediaSelector
              onPhotoAdded={(photoId) => {
                editor
                  .chain()
                  .focus()
                  .insertContent({
                    type: 'photoNode',
                    attrs: {
                      photoId,
                      url: PhotoURL(photoId),
                      description: 'Cliquer sur la photo pour ajouter une description',
                      personsInPhoto: '[]', // This should be stringified JSON
                      unrecognizedFacesInPhoto: 0,
                      threadId: props.threadId,
                    },
                  })
                  .run()
              }}>
              {(open) => (
                <span
                  onClick={() => open()}
                  className={`ml-10 sm:ml-5 pl-3 border border-y-0 border-r-0 border-l border-l-gray-300 cursor-pointer inline-flex items-center text-indigo-600 hover:underline hover:underline-offset-2`}>
                  <PhotoIcon className={`${buttonIconStyles} h-4 w-4`} aria-hidden='true' />
                  Insérer une photo
                </span>
              )}
            </MediaSelector>
          </FloatingMenu> */}
          <div className='absolute top-4 right-2'>
            <StatusIndicator status={status} />
          </div>
        </div>
        {!!lastUpdated ? (
          <div className='my-2 pl-4 pt-2 sm:pl-6 italic text-gray-500 '>
            Dernière mise à jour {formatRelative(lastUpdated, Date.now(), { locale: fr })}
          </div>
        ) : null}
      </DeletePhotoCtx.Provider>
    </EditorCtx.Provider>
  )
})

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

const PhotoNode = Node.create({
  name: 'photoNode',

  group: 'block',

  atom: true,

  addAttributes(): (Attributes | {}) & { [Attr in keyof PhotoItemProps]: any } {
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

const SeparatorNodeItem = (props: { node: {} }) => {
  const { editorRef, threadId } = useEditorCtx()
  const nodeRef = useRef<any>()

  const handleAddTextClick = () => {
    if (editorRef.current && nodeRef.current) {
      const position = editorRef.current.view.posAtDOM(nodeRef.current, 0)
      editorRef.current.chain().insertContentAt(position, '<p></p>').run()
    }
  }

  return (
    <NodeViewWrapper className='tdf-separator' ref={nodeRef}>
      <div className='sm:-ml-6 px-4 sm:px-2 py-3 flex justify-start gap-4 bg-gray-50 border-y border-gray-300 divide-x divide-gray-200'>
        <button
          onClick={handleAddTextClick}
          title='Retirer la photo'
          className={`ml-4 text-indigo-600 hover:text-indigo-500 cursor-pointer inline-flex items-center gap-x-2`}>
          <Bars3BottomLeftIcon className={`h-4 w-4`} />
          Insérer du texte
        </button>
        <MediaSelector
          onPhotoAdded={(photoId) => {
            if (!editorRef.current || !nodeRef.current) return
            const editor = editorRef.current
            const position = editorRef.current.view.posAtDOM(nodeRef.current, 0)
            editor
              .chain()
              .insertContentAt(position, {
                type: 'photoNode',
                attrs: {
                  photoId,
                  url: PhotoURL(photoId),
                  description: 'Cliquer sur la photo pour ajouter une description',
                  personsInPhoto: '[]', // This should be stringified JSON
                  unrecognizedFacesInPhoto: 0,
                  threadId,
                },
              })
              .run()
          }}>
          {(open) => (
            <button
              onClick={() => open()}
              title='Retirer la photo'
              className={`pl-4  text-indigo-600 hover:text-indigo-500 cursor-pointer inline-flex items-center gap-x-2`}>
              <PhotoIcon className={`h-5 w-5`} aria-hidden='true' />
              Insérer une photo
            </button>
          )}
        </MediaSelector>
      </div>
    </NodeViewWrapper>
  )
}

const SeparatorNode = Node.create({
  name: 'separatorNode',

  group: 'block',

  atom: true,

  addAttributes(): Attributes | {} {
    return {}
  },

  parseHTML() {
    return [
      {
        tag: 'tdf-separator',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['tdf-separator', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(SeparatorNodeItem)
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

/**
 * Insert separators to facilitate edition of content
 * @param editor Editor instance
 */
function addSeparatorBetweenNodes(editor: Editor) {
  const topContent = editor.view.state.doc.content

  // console.log('addSeparatorBetweenNodes', topContent)
  let currentSize = 0
  let childCount = topContent.childCount
  for (let i = 0; i < childCount; i++) {
    // console.log({
    //   i,
    //   childCount,
    //   prevChild: i > 0 ? topContent.child(i - 1).type.name : null,
    //   currChild: topContent.child(i).type.name,
    // })
    const previousNode = (i > 0 && topContent.child(i - 1)) || undefined
    const node = topContent.child(i)

    // Remove two successive seps
    if (previousNode && previousNode.type.name === 'separatorNode' && node.type.name === 'separatorNode') {
      const range = { from: currentSize, to: currentSize + node.nodeSize }
      // console.log('Found two successive separator nodes', range)
      editor.commands.deleteRange(range)
      return
    }

    // Remove when [para-sep]-para
    if (i < childCount - 1 && previousNode && previousNode.type.name === 'paragraph' && node.type.name === 'separatorNode') {
      const nextNode = topContent.child(i + 1)
      if (nextNode && nextNode.type.name === 'paragraph') {
        // Remove the separator
        const range = { from: currentSize, to: currentSize + node.nodeSize }
        // console.log('Found separator node between two paragraphs', range)
        editor.commands.deleteRange(range)
        return
      }
    }

    // Add separators between photo-para, or para-photo
    if (
      previousNode &&
      previousNode.type.name !== 'separatorNode' &&
      node.type.name !== 'separatorNode' &&
      (previousNode.type !== node.type || node.type.name === 'photoNode')
    ) {
      // console.log('Inserting separator', { previousNode: previousNode?.type.name, node: node.type.name })
      editor.chain().insertContentAt(currentSize, `<tdf-separator></tdf-separator>`).run()

      return // stop and wait for next run by editor.on('update')
    }

    // console.log('Doing nothing', { previousNode: previousNode?.type.name, node: node.type.name })

    currentSize += node.nodeSize
  }
}

/**
 * Same as above but for content as json (only for first print)
 * @param contentAsJSON
 */
function separatePhotoNodesInJSONContent(contentAsJSON: TipTapContentAsJSON): TipTapContentAsJSON {
  const newContentAsJson: TipTapContentAsJSON = {
    type: 'doc',
    content: [],
  }

  let previousNode = null
  for (const node of contentAsJSON.content) {
    if (
      previousNode &&
      previousNode.type !== 'separatorNode' &&
      node.type !== 'separatorNode' &&
      (previousNode.type !== node.type || node.type === 'photoNode')
    ) {
      newContentAsJson.content.push({ type: 'separatorNode' })
    }
    newContentAsJson.content.push(node)
    previousNode = node
  }

  return newContentAsJson
}
