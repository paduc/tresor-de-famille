import debounce from 'lodash.debounce'
import { useCallback, useEffect, useState } from 'react'
import { Editor } from '@tiptap/react'
import { ThreadId } from '../../../../domain/ThreadId.js'
import { ThreadUrl } from '../../ThreadUrl.js'
import { TipTapContentAsJSON, removeSeparatorNodes } from '../../TipTapTypes.js'

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error'
export const useAutosaveEditor = (
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
    if (!editor) return

    const insideSave = () => {
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

  return { status, lastUpdated }
}
