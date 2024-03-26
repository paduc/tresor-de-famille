import { formatRelative } from 'date-fns'
import { fr } from 'date-fns/locale'
import debounce from 'lodash.debounce'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { linkStyles } from '../../_components/Button'
import { AppLayout } from '../../_components/layout/AppLayout'

import { Content, Editor, EditorContent, EditorContext, findChildren, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { FamilyId } from '../../../domain/FamilyId'
import { PhotoId } from '../../../domain/PhotoId'
import { ThreadId } from '../../../domain/ThreadId'
import { ClientOnly } from '../../_components/ClientOnly'
import { PhotoURL } from '../../photoApi/PhotoURL'
import { GlobalMediaSelector } from '../MediaSelector'
import { ThreadUrl } from '../ThreadUrl'
import { TipTapContentAsJSON } from '../TipTapTypes'
import { Comment, Comments } from './_components/Comments'
import { StatusIndicator } from './_components/StatusIndicator'
import { ThreadSharingButton } from './_components/ThreadSharingButton'
import { AutosaveStatus, useAutosaveEditor } from './hooks/useAutosaveEditor'
import { RemovePhotoCtx } from './hooks/useRemovePhoto'
import { PhotoNode } from './nodes/PhotoNode'
import { SeparatorNode } from './nodes/SeparatorNode'
import { addSeparatorBetweenNodes, separatePhotoNodesInJSONContent } from './utils/separatePhotoNodesInJSONContent'
import { SelectDOMNodeForInsertionCtx } from './hooks/useSelectDOMNodeForInsertion'
import { EditorCtx } from './hooks/useEditorCtx'

export type ThreadPageProps = {
  title?: string
  contentAsJSON: TipTapContentAsJSON
  lastUpdated: string | undefined // ISO string
  threadId: ThreadId
  isAuthor: boolean
  authorName: string | undefined
  familyId: FamilyId
  sharedWithFamilyIds?: FamilyId[]
  isNewThread: boolean
  comments: Comment[]
}
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
    const lastUpdated = lastUpdatedAsString ? new Date(lastUpdatedAsString) : undefined

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
          <div className='mb-2 ml-4 sm:ml-6'>
            <a href={ThreadUrl(threadId, false)} className={`${linkStyles}`}>
              J'ai terminé mes modifications
            </a>
          </div>
          <div className='divide-y divide-gray-200 overflow-hidden sm:rounded-lg bg-white shadow'>
            {title ? <Title title={title} threadId={threadId} /> : null}
            <div className=''>
              <ClientOnly>
                <RichTextEditor content={contentAsJSON} threadId={threadId} lastUpdated={lastUpdated} />
              </ClientOnly>
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

type RichTextEditorProps = {
  content: Content
  threadId: ThreadId
  lastUpdated: Date | undefined
}
const RichTextEditor = (props: RichTextEditorProps) => {
  const { content, threadId } = props
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
    content,
    autofocus: null,
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  })

  const { status, lastUpdated } = useAutosaveEditor(editor, threadId, props.lastUpdated)

  // This will be used to insert photos or media at the right place
  const [nodeForMediaInsertion, setNodeForMediaInsertion] = useState<
    { node: HTMLElement; type: 'photos' | 'media' } | undefined
  >(undefined)

  // This is a callback called by the GlobalMediaSelector
  // it uses the information located in mediaSelector
  const handleAddMedia = useCallback(
    (photoIds: PhotoId[]) => {
      // console.log('onMediaSelected global')
      if (!editorRef.current || !nodeForMediaInsertion?.node) return
      const editor = editorRef.current
      let position = editor.view.posAtDOM(nodeForMediaInsertion?.node, 0)
      const editorChain = editor.chain()
      for (const photoId of photoIds) {
        editorChain.insertContentAt(position++, {
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
      }
      // See https://github.com/ueberdosis/tiptap/issues/3764
      setTimeout(() => {
        editorChain.run()
      })
    },
    [nodeForMediaInsertion?.node]
  )

  // Make sure the content always ends with a paragraph
  useEffect(() => {
    // console.log('useEffect', editor)
    if (!editor) return

    const handleUpdate = () => {
      // console.log('handleUpdate in useEffet')
      addSeparatorBetweenNodes(editor)
    }

    editor.on('update', handleUpdate)

    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor])

  const editorRef: React.MutableRefObject<Editor | null> = React.useRef(null)

  const handleRemovePhoto = useCallback(
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

  useLayoutEffect(() => {
    const photoElementId = window.location.hash.replace('#', '')
    if (photoElementId) {
      setTimeout(() => {
        const photoElement = document.getElementById(photoElementId)
        if (photoElement) {
          photoElement.scrollIntoView()
        }
      }, 100)
    }
  }, [])

  if (!editor) return null

  return (
    // These contexts are used to communicate between the editor nodes, the global media seletor and the editor itself
    // TODO: find a better way to do this
    <EditorCtx.Provider value={{ editorRef, threadId }}>
      <RemovePhotoCtx.Provider value={handleRemovePhoto}>
        <SelectDOMNodeForInsertionCtx.Provider value={setNodeForMediaInsertion}>
          <div className='sm:ml-6 max-w-2xl relative'>
            <EditorContent editor={editor} />
            <div className='fixed top-4 right-2'>
              <StatusIndicator status={status} />
            </div>
          </div>
          {!!lastUpdated ? (
            <div className='my-2 pl-4 pt-2 sm:pl-6 italic text-gray-500 '>
              Dernière mise à jour {formatRelative(lastUpdated, Date.now(), { locale: fr })}
            </div>
          ) : null}
          <GlobalMediaSelector
            isOpen={!!nodeForMediaInsertion?.node}
            selectedType={nodeForMediaInsertion?.type}
            close={() => {
              setNodeForMediaInsertion(undefined)
            }}
            onMediaSelected={handleAddMedia}
          />
        </SelectDOMNodeForInsertionCtx.Provider>
      </RemovePhotoCtx.Provider>
    </EditorCtx.Provider>
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
