import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
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
      saveNewCaption={saveNewCaption}
    />
  )
}

export function MediaNodeItemComponent({
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

      <MediaNodeItemComponentByStatus
        mediaId={mediaId}
        mediaStatus={mediaStatus}
        url={url}
        latestCaption={latestCaption}
        isReadonly={false}
        autosaveStatus={autosaveStatus}
        onCaptionChange={onCaptionChange}
      />
    </div>
  )
}

type MediaComponentProps = {
  mediaId: MediaId
  mediaStatus: MediaStatus
  url: string
  latestCaption: string | undefined
} & (
  | { isReadonly: true }
  | {
      isReadonly: false
      onCaptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => unknown
      autosaveStatus: AutosaveStatus
    }
)

export function MediaNodeItemComponentByStatus(props: MediaComponentProps) {
  const { mediaStatus, url, isReadonly, latestCaption } = props

  return (
    <div className='w-full pr-4'>
      {mediaStatus === 4 ? (
        <iframe
          src={url}
          loading='lazy'
          className='w-full h-44 sm:h-96 border rounded-md border-gray-300 shadow-sm'
          // style={{ border: 0, position: 'absolute', top: 0, height: '100%', width: '100%' }}
          allow='accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;'
          allowFullScreen={true}
        />
      ) : (
        <div className='w-full h-44 sm:h-96  flex items-center justify-center bg-gray-100 rounded-md'>
          <div className='flex items-center gap-2 justify-items-center'>
            {[5, 6, 404].includes(mediaStatus) ? (
              <>
                <XMarkIcon className='h-8 w-8 text-red-600' />
                <div className=''>
                  {MessageByStatus[mediaStatus]}
                  <span className='sr-only'>Loading...</span>
                </div>
              </>
            ) : (
              <>
                <svg
                  aria-hidden='true'
                  className='block w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600'
                  viewBox='0 0 100 101'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                    fill='currentColor'
                  />
                  <path
                    d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                    fill='currentFill'
                  />
                </svg>
                <div className=''>
                  {MessageByStatus[mediaStatus]}
                  <span className='sr-only'>Loading...</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {mediaStatus === 4 ? (
        <div className='w-full pr-10'>
          <div className='inline-flex my-3 mr-10 items-center w-full'>
            {isReadonly ? (
              <div>
                {latestCaption ? <p className='text-md text-gray-600 mb-1 whitespace-pre-wrap'>{latestCaption}</p> : null}
              </div>
            ) : (
              <>
                <TextareaAutosize
                  minRows={1}
                  className='flex-1 text-md text-gray-600 whitespace-pre-wrap placeholder:italic border-none p-0 ring-0 focus:ring-0'
                  placeholder='Cliquer ici pour ajouter une légende'
                  defaultValue={latestCaption || ''}
                  onChange={props.onCaptionChange}
                />
                <div className='flex-0 h-6 w-8'>
                  <StatusIndicator status={props.autosaveStatus} />
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

const MessageByStatus: Record<MediaStatus, string> = {
  0: 'En cours de traitement',
  1: 'En cours de traitement',
  2: 'En cours de traitement',
  3: 'En cours de transcodage',
  4: 'Terminé',
  5: 'Erreur',
  6: 'Upload échoué',
  404: 'Média non-trouvé',
}
