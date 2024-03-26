import React, { createContext, useContext } from 'react'
import { Editor } from '@tiptap/react'
import { ThreadId } from '../../../../domain/ThreadId'

export const EditorCtx = createContext<{ editorRef: React.MutableRefObject<Editor | null>; threadId: ThreadId } | null>(null)

export const useEditorCtx = () => {
  const editorRef = useContext(EditorCtx)
  if (editorRef === null) {
    throw new Error('This hook should only be used in a proper Provider')
  }

  return editorRef
}
