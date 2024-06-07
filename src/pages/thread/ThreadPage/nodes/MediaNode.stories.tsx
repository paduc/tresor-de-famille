import React from 'react'
import { MediaNodeItemComponent } from './MediaNode.js'
import { MediaId } from '../../../../domain/MediaId.js'
import { MediaStatus } from '../../../media/MediaStatus.js'

export default { title: 'MediaNode', component: MediaNodeItemComponent, parameters: { layout: 'fullscreen' } }

const fakeVideoUrl =
  'https://iframe.mediadelivery.net/embed/222778/1f5d2e38-c4f7-435f-b024-1ecbd3bc7bb9?autoplay=true&loop=false&muted=false&preload=true&responsive=true'

function MediaNodeItemComponentByStatus(mediaStatus: MediaStatus) {
  return () => (
    <div className='w-full sm:ml-6 max-w-2xl pt-3 pb-40'>
      <div className='divide-y divide-gray-200 overflow-hidden sm:rounded-lg bg-white shadow'>
        <div className='px-4 sm:px-0 py-4 text-gray-800 text-lg  whitespace-pre-wrap [&+p]:-mt-1 [&+p]:border-t-0 [&+p]:pt-0'>
          <div className='sm:ml-6 max-w-2xl relative'>
            <MediaNodeItemComponent
              mediaId={'mediaId' as MediaId}
              url={fakeVideoUrl}
              latestCaption={undefined}
              removeMedia={() => alert('removeMedia')}
              mediaStatus={mediaStatus}
              autosaveStatus='idle'
              saveNewCaption={() => alert('saveNewCaption')}
              onCaptionChange={(e) => alert(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export const Created = MediaNodeItemComponentByStatus(0)
export const Uploaded = MediaNodeItemComponentByStatus(1)
export const Processing = MediaNodeItemComponentByStatus(2)
export const Transcoding = MediaNodeItemComponentByStatus(3)
export const Finished = MediaNodeItemComponentByStatus(4)
export const Error = MediaNodeItemComponentByStatus(5)
export const UploadFailed = MediaNodeItemComponentByStatus(6)
export const NotFound = MediaNodeItemComponentByStatus(404)
// @ts-ignore
export const SansStatus = MediaNodeItemComponentByStatus()
