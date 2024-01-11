import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { PhotoId } from '../../domain/PhotoId'
import { TDFModal } from '../_components/TDFModal'
import { MediaSelectorListURL } from '../photoApi/MediaSelectorListURL'
import { ThumbnailURL } from '../photoApi/ThumbnailURL'
import { HeartIcon, SparklesIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/20/solid'

type MediaSelectorProps = {
  onPhotoAdded?: (photoId: PhotoId) => void
  children: (open: (args?: any) => any) => JSX.Element
}
type FetchStatus = 'idle' | 'downloading' | 'error'
export function MediaSelector({ onPhotoAdded, children }: MediaSelectorProps) {
  const [photos, setPhotos] = useState<PhotoId[]>([])
  const [isOpen, setOpen] = useState(false)

  const [status, setStatus] = useState<FetchStatus>('idle')

  // Fetch photos here
  useEffect(() => {
    async function getPhotos() {
      try {
        setStatus('downloading')
        const res = await axios.get<{ photos: PhotoId[] }>(MediaSelectorListURL(), {
          headers: {
            Accept: 'application/json',
          },
        })

        if (res.status === 200) {
          setPhotos(res.data.photos)
          setStatus('idle')
          return
        }

        setStatus('error')
      } catch (error) {
        setStatus('error')
      }
    }

    getPhotos()
  }, [isOpen])

  return (
    <>
      {children(() => setOpen(true))}
      <MediaSelectorComponent
        isOpen={isOpen}
        close={() => {
          setOpen(false)
        }}
        photos={photos.map((photoId) => ({ photoId, url: ThumbnailURL(photoId) }))}
        status={status}
        onPhotoAdded={(photoId) => {
          if (onPhotoAdded) {
            onPhotoAdded(photoId)
          }
          setOpen(false)
        }}
      />
    </>
  )
}

/**
 * Use separate pure component to make it easier to test with Storybook
 */
type MediaSelectorComponentProps = {
  onPhotoAdded?: (photoId: PhotoId) => void
  photos: { photoId: PhotoId; url: string }[]
  isOpen: boolean
  close: () => unknown
  status: FetchStatus
}
export function MediaSelectorComponent({ isOpen, close, onPhotoAdded, photos, status }: MediaSelectorComponentProps) {
  return (
    <TDFModal title={"Insérer des photos dans l'histoire"} isOpen={isOpen} close={close}>
      <div className='max-h-[85vh] overflow-y-scroll'>
        {status === 'error' ? (
          <div className='inline-flex items-center'>
            <XCircleIcon className='h-6 w-6 mr-1 text-red-600' />
            Erreur de chargement
          </div>
        ) : null}
        {status === 'downloading' ? (
          <div className='inline-flex items-center animate-pulse'>
            <SparklesIcon className='h-6 w-6 mr-1 text-indigo-600' />
            Chargement...
          </div>
        ) : null}
        <ul role='list' className='grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 mt-3'>
          {photos.map(({ photoId, url }) => (
            <li key={photoId} className='relative'>
              <div className='group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 cursor-pointer'>
                <img src={url} alt='' className='pointer-events-none object-cover group-hover:opacity-75' />
                <a
                  onClick={() => {
                    if (onPhotoAdded) onPhotoAdded(photoId)
                  }}
                  className='absolute inset-0 focus:outline-none'>
                  <span className='sr-only'>Insérer cette photo</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </TDFModal>
  )
}
