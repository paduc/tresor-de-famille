import React, { useRef } from 'react'
import { Node } from '@tiptap/core'
import { Attributes, ReactNodeViewRenderer, mergeAttributes } from '@tiptap/react'
import { Bars3BottomLeftIcon, PhotoIcon } from '@heroicons/react/20/solid'
import { NodeViewWrapper } from '@tiptap/react'
import { useSelectDOMNodeForInsertion } from '../hooks/useSelectDOMNodeForInsertion.js'
import { useEditorCtx } from '../hooks/useEditorCtx.js'

export const SeparatorNode = Node.create({
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

const SeparatorNodeItem = (props: { node: {} }) => {
  const { editorRef } = useEditorCtx()
  const { selectDOMNodeForInsertion } = useSelectDOMNodeForInsertion()
  const nodeRef = useRef<HTMLElement>()

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
        <button
          onClick={() => {
            if (nodeRef.current) {
              selectDOMNodeForInsertion({ node: nodeRef.current, type: 'photos' })
            }
          }}
          title='Insérer des photos'
          className={`pl-4  text-indigo-600 hover:text-indigo-500 cursor-pointer inline-flex items-center gap-x-2`}>
          <PhotoIcon className={`h-5 w-5`} aria-hidden='true' />
          Insérer des photos
        </button>
        <button
          onClick={() => {
            if (nodeRef.current) {
              selectDOMNodeForInsertion({ node: nodeRef.current, type: 'media' })
            }
          }}
          title='Insérer des vidéos'
          className={`pl-4  text-indigo-600 hover:text-indigo-500 cursor-pointer inline-flex items-center gap-x-2`}>
          <PhotoIcon className={`h-5 w-5`} aria-hidden='true' />
          Insérer des vidéos
        </button>
      </div>
    </NodeViewWrapper>
  )
}
