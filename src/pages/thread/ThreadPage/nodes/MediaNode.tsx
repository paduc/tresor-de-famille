import { TrashIcon } from '@heroicons/react/24/outline'
import { Node } from '@tiptap/core'
import { Attributes, NodeViewWrapper, ReactNodeViewRenderer, mergeAttributes } from '@tiptap/react'
import axios from 'axios'
import debounce from 'lodash.debounce'
import React, { useCallback, useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { UUID } from '../../../../domain'
import { MediaId } from '../../../../domain/MediaId'
import { ThreadId } from '../../../../domain/ThreadId'
import { secondaryCircularButtons } from '../../../_components/Button'
import { ThreadUrl } from '../../ThreadUrl'
import { StatusIndicator } from '../_components/StatusIndicator'
import { AutosaveStatus } from '../hooks/useAutosaveEditor'
import { useRemoveMedia } from '../hooks/useRemoveMedia'
import { GetMediaStatusURL } from '../../../media/GetMediaStatusURL'
import { MediaStatus, ReadyOrErrorStatus } from '../../../media/MediaStatus'

/*
  A MediaNode for Tiptap
*/
export const MediaNode = Node.create({
  name: 'mediaNode',

  group: 'block',

  atom: true,

  addAttributes(): (Attributes | {}) & {
    [Attr in keyof MediaItemProps]: any
  } {
    return {
      threadId: {},
      mediaId: {},
      url: {},
      caption: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'tdf-media',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['tdf-media', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaNodeItem)
  },
})

/*
  A MediaItem wrapped for Tiptap
*/
const MediaNodeItem = (props: {
  node: {
    attrs: {
      [Attr in keyof MediaItemProps]: MediaItemProps[Attr] extends ThreadId
        ? ThreadId
        : MediaItemProps[Attr] extends MediaId
        ? MediaId
        : MediaItemProps[Attr] extends UUID
        ? UUID
        : MediaItemProps[Attr] extends number
        ? number
        : string
    }
  }
}) => {
  try {
    const { threadId, mediaId, url, caption: description } = props.node.attrs

    return (
      <NodeViewWrapper className='tdf-media'>
        <MediaItem threadId={threadId} mediaId={mediaId} url={url} caption={description} key={mediaId} />
      </NodeViewWrapper>
    )
  } catch (error) {
    console.error(error)
    return (
      <NodeViewWrapper className='tdf-media'>
        <div>Error: illegal values in media module</div>
      </NodeViewWrapper>
    )
  }
}

type MediaItemProps = {
  mediaId: MediaId
  url: string
  caption?: string
  threadId: ThreadId
}

const MediaItem = (props: MediaItemProps) => {
  const removeMedia = useRemoveMedia()
  const { caption, mediaId, url, threadId } = props
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>(0)

  const [latestCaption, setLatestCaption] = useState<string | undefined>(caption)
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle')

  const saveNewCaption = (newCaption: string) => {
    if (latestCaption === newCaption) {
      return
    }

    setAutosaveStatus('saving')
    fetch(ThreadUrl(threadId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clientsideCaptionUpdate', caption: newCaption, mediaId }),
    }).then((res) => {
      if (!res.ok) {
        alert("La nouvelle légende n'a pas pu être sauvegardée")
        setAutosaveStatus('error')
        return
      }
      setAutosaveStatus('saved')
      setLatestCaption(newCaption)
      setTimeout(() => {
        setAutosaveStatus('idle')
      }, 2000)
    })
  }

  const debouncedSaveNewCaption = useCallback(debounce(saveNewCaption, 1500), [])

  // call the API to check if the media is ready (triggers only on first render, no dependencies) using axios
  useEffect(() => {
    const checkMediaReady = async () => {
      // console.log('checking media status...')
      const res = await axios.get<{ status: MediaStatus }>(GetMediaStatusURL(mediaId), { withCredentials: true, timeout: 4000 })

      if (res.status === 200) {
        setMediaStatus(res.data.status)
        return res.data.status
      }
    }

    let intervalId: any = undefined
    checkMediaReady().then((status) => {
      if (!status || ReadyOrErrorStatus.includes(status)) {
        // console.log('the first check returned that media ready or errored, no setting interval')
        return
      }

      intervalId = setInterval(async () => {
        const latestStatus = await checkMediaReady()
        if (latestStatus && ReadyOrErrorStatus.includes(latestStatus)) {
          console.log(`clearing interval because status=${latestStatus}`)
          clearInterval(intervalId)
        }
      }, 5000)
    })

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  return (
    <MediaNodeItemComponent
      mediaId={mediaId}
      url={url}
      latestCaption={latestCaption}
      removeMedia={removeMedia}
      mediaStatus={mediaStatus}
      autosaveStatus={autosaveStatus}
      onCaptionChange={(e) => {
        debouncedSaveNewCaption(e.target.value)
      }}
    />
  )
}

function MediaNodeItemComponent({
  mediaId,
  url,
  latestCaption,
  removeMedia,
  mediaStatus,
  autosaveStatus,
  onCaptionChange,
}: {
  mediaId: MediaId
  url: string
  removeMedia: (mediaId: MediaId) => void
  autosaveStatus: AutosaveStatus
  saveNewCaption: (newCaption: string) => void
  latestCaption: string | undefined
  mediaStatus: MediaStatus
  onCaptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => unknown
}) {
  return (
    <div id={mediaId} className='relative inline-flex w-full px-4 sm:px-0 py-2'>
      <div className='flex-none flex-col w-12 border-r border-gray-200 mr-3 -ml-2'>
        <div className='w-10 h-10 my-10'>
          <button
            onClick={() => {
              if (confirm('Etes-vous sur de vouloir retirer cet élément de cette histoire ?')) {
                removeMedia(mediaId)
              }
            }}
            title='Retirer cet élément'
            className={`${secondaryCircularButtons} bg-opacity-60`}>
            <TrashIcon className={`h-5 w-5`} />
          </button>
        </div>
      </div>

      <div>
        <div className='mb-2'>
          <div style={{ position: 'relative', paddingTop: '56.25%' }}>
            {mediaStatus === 4 ? (
              <iframe
                src={url}
                loading='lazy'
                style={{ border: 0, position: 'absolute', top: 0, height: '100%', width: '100%' }}
                allow='accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;'
                allowFullScreen={true}
              />
            ) : (
              <div>Not ready {MediaStatus[mediaStatus]}</div>
            )}
          </div>
        </div>

        <div className='w-full pr-10'>
          <div className='inline-flex my-3 mr-10 items-center w-full'>
            <TextareaAutosize
              minRows={1}
              className='flex-1 text-md text-gray-600 whitespace-pre-wrap placeholder:italic border-none p-0 ring-0 focus:ring-0'
              placeholder='Cliquer ici pour ajouter une légende'
              defaultValue={latestCaption || ''}
              onChange={onCaptionChange}
            />
            <div className='flex-0 h-6 w-8'>
              <StatusIndicator status={autosaveStatus} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
