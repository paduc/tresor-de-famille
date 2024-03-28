import { CheckIcon, FireIcon, SparklesIcon, XCircleIcon } from '@heroicons/react/20/solid'
import Uppy from '@uppy/core'
import { Dashboard } from '@uppy/react'
import Tus from '@uppy/tus'
import axios, { AxiosError } from 'axios'
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
// @ts-ignore
import UppyFrancais from '@uppy/locales/lib/fr_FR'

import { UUID } from '../../domain'
import { MediaId } from '../../domain/MediaId'
import { PhotoId } from '../../domain/PhotoId'
import { getUuid } from '../../libs/getUuid'
import { primaryButtonStyles, smallButtonStyles } from '../_components/Button'
import { TDFModal } from '../_components/TDFModal'
import { MediaUploadCompleteURL } from '../media/MediaUploadCompleteURL'
import { MediaSelectorListURL } from '../photoApi/MediaSelectorListURL'
import { ThumbnailURL } from '../photoApi/ThumbnailURL'
import { PrepareMediaUploadURL } from '../media/PrepareMediaUploadURL'

type FetchStatus = 'idle' | 'downloading' | 'error'
export type MediaSelectedType =
  | {
      type: 'photos'
      photoIds: PhotoId[]
    }
  | {
      type: 'media'
      mediaId: MediaId
      url: string
    }

type MediaSelectorProps = {
  onMediaSelected?: (media: MediaSelectedType) => void
  isOpen: boolean
  selectedType: 'photos' | 'media' | undefined
  close: () => void
}
export function MediaSelector({ onMediaSelected, isOpen, close, selectedType }: MediaSelectorProps) {
  console.log('MediaSelector', { selectedType })
  const uniqueKey = useMemo(() => getUuid(), [])

  const [currentType, setCurrentType] = useState<'photos' | 'media'>(selectedType || 'photos')

  return (
    <TDFModal title={"Insérer dans l'histoire"} isOpen={isOpen} close={close}>
      {/* <div className='mb-3'>
        <div className='sm:hidden'>
          <label htmlFor='tabs' className='sr-only'>
            Choissisez un onglet
          </label>
          <select
            id='tabs'
            name='tabs'
            className='block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            value={selectedType}
            onChange={(e) => {
              setCurrentType(e.target.value as 'photos' | 'media')
            }}>
            <option key={'photos'}>{'photos'}</option>
            <option key={'media'}>{'vidéos'}</option>
          </select>
        </div>
        <div className='hidden sm:block'>
          <div className='border-b border-gray-200'>
            <nav className='-mb-px flex' aria-label='Tabs'>
              <button
                value='photos'
                onClick={(e) => setCurrentType(e.currentTarget.value as 'photos' | 'media')}
                className={classNames(
                  selectedType === 'photos'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium'
                )}
                aria-current={selectedType === 'photos' ? 'page' : undefined}>
                Photos
              </button>
              <button
                value='media'
                onClick={(e) => setCurrentType(e.currentTarget.value as 'photos' | 'media')}
                className={classNames(
                  selectedType === 'media'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium'
                )}
                aria-current={selectedType === 'media' ? 'page' : undefined}>
                Vidéos
              </button>
            </nav>
          </div>
        </div>
      </div> */}
      {selectedType === 'photos' ? (
        <div>
          <UploadNewPhotos
            onPhotosUploaded={(photoIds) => {
              if (onMediaSelected) onMediaSelected({ type: 'photos', photoIds })
            }}
          />
          <SelectExistingPhoto
            onPhotoSelected={(photoId) => {
              if (onMediaSelected) onMediaSelected({ type: 'photos', photoIds: [photoId] })
            }}
            isOpen={isOpen}
            uniqueKey={uniqueKey}
          />
        </div>
      ) : (
        <UppyDashboard
          onMediaSelected={({ mediaId, url }) => {
            if (onMediaSelected) onMediaSelected({ type: 'media', mediaId, url })
          }}
        />
      )}
    </TDFModal>
  )
}

function SelectExistingPhoto({
  onPhotoSelected,
  isOpen,
  uniqueKey,
}: {
  uniqueKey: string
  isOpen: boolean
  onPhotoSelected: (photoId: PhotoId) => unknown
}) {
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [photos, setPhotos] = useState<{ photoId: PhotoId; url: string }[]>([])

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
          setPhotos(res.data.photos.map((photoId) => ({ photoId, url: ThumbnailURL(photoId) })))

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
      <div>Choisir une photo de mon trésor</div>
      <div className='max-h-[50vh] overflow-y-scroll border-y border-gray-300 px-2'>
        {status === 'error' ? (
          <div className='inline-flex items-center'>
            <XCircleIcon className='h-6 w-6 mr-1 text-red-600' />
            Erreur de chargement
          </div>
        ) : null}
        {status === 'downloading' && !photos.length ? (
          <div className='inline-flex items-center animate-pulse'>
            <SparklesIcon className='h-6 w-6 mr-1 text-indigo-600' />
            Chargement...
          </div>
        ) : null}
        <ul role='list' className='grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 sm:gap-x-2 mt-3'>
          {photos.map(({ photoId, url }) => (
            <li key={`${uniqueKey}_${photoId}`} className='relative'>
              <div className='group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 cursor-pointer'>
                <img src={url} loading='lazy' alt='' className='pointer-events-none object-cover group-hover:opacity-75' />
                <a
                  onClick={() => {
                    if (onPhotoSelected) onPhotoSelected(photoId)
                  }}
                  className='absolute inset-0 focus:outline-none'>
                  <span className='sr-only'>Insérer cette photo</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

type UploadNewPhotosProps = {
  onPhotosUploaded?: (photoIds: PhotoId[]) => unknown
}

function UploadNewPhotos({ onPhotosUploaded }: UploadNewPhotosProps) {
  const [photosToUpload, setPhotosToUploaed] = useState<{ file: File; uploadId: UUID }[]>([])
  const [photosUploaded, setPhotosUploaded] = useState<{ photoId: PhotoId; uploadId: UUID }[]>([])

  const handleFiles: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (event.target.files === null) return

      const newPhotos = Array.from(event.target.files).map((file) => ({ file, uploadId: getUuid() }))

      setPhotosToUploaed((state) => {
        return [...newPhotos, ...state]
      })
    },
    [photosToUpload]
  )

  const handlePhotoUploaded = (args: { photoId: PhotoId; uploadId: UUID }) => {
    setPhotosUploaded((state) => [...state, args])
  }

  useEffect(() => {
    if (photosToUpload.length === 0) return

    const uploadedPhotoUploadIds = photosUploaded.map((p) => p.uploadId)

    if (onPhotosUploaded && photosToUpload.every((photo) => uploadedPhotoUploadIds.includes(photo.uploadId))) {
      // Do it like this to insure they are in the same order as they were uploaded
      const photoIdsInOrderOfUpload = photosToUpload.map(
        (photoToUpload) => photosUploaded.find((p) => p.uploadId === photoToUpload.uploadId)!.photoId
      )

      onPhotosUploaded(photoIdsInOrderOfUpload)
    }
  }, [photosToUpload, photosUploaded])

  return (
    <div className='mb-3'>
      <div className=''>
        <label htmlFor='photo' className={`${primaryButtonStyles} ${smallButtonStyles}`}>
          Envoyer des nouvelles photos
        </label>
        <input
          type='file'
          multiple
          name='photo'
          id='photo'
          className='hidden'
          onChange={handleFiles}
          accept='image/jpeg, image/jpg, image/png'
        />
      </div>

      {photosToUpload.length ? (
        <ul className='pt-2'>
          {photosToUpload.map(({ file, uploadId: id }) => (
            <SingleUpload
              file={file}
              uploadId={id}
              key={`photo_uploading_${id}`}
              mock={false}
              onPhotoUploaded={handlePhotoUploaded}
            />
          ))}
        </ul>
      ) : null}
    </div>
  )
}

type SingleUploadProps = {
  file: File
  uploadId: UUID
  mock?: boolean
  onPhotoUploaded?: (args: { photoId: PhotoId; uploadId: UUID }) => unknown
}

const SingleUpload = memo(({ file, uploadId, mock, onPhotoUploaded }: SingleUploadProps) => {
  const [progress, setProgress] = useState(0)
  const [errorCode, setError] = useState<{ code: number; text: string } | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [isVisible, setVisible] = useState<boolean>(true)

  if (!file) {
    console.error('No file given to update')
    return null
  }

  useEffect(() => {
    if (mock) {
      let progress = 0
      const interval = setInterval(() => {
        if (progress >= 100) {
          setTimeout(() => setVisible(false), 1000)
          clearInterval(interval)
          return
        }
        setProgress(++progress)
      })
      return () => clearInterval(interval)
    }

    const controller = new AbortController()
    async function doRequest() {
      const formData = new FormData()
      formData.append('photo', file)
      try {
        const res = await axios.post('/upload-photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            setProgress(Math.round((e.loaded * 100) / (e.total || 1)))
          },
        })

        if (res.status !== 200) {
          setError({ code: res.status, text: res.statusText })
          console.error('Axios res.status', res.status)
        } else {
          const { photoId } = res.data
          if (onPhotoUploaded && photoId) {
            onPhotoUploaded({ photoId: photoId as PhotoId, uploadId })
          }
          // setTimeout(() => setVisible(false), 1000)
        }
      } catch (error) {
        console.error('Axios failed', error)
        if (error instanceof AxiosError && error.response) {
          setError({ code: error.response.status, text: error.response.data || error.response.statusText })
        } else {
          setError({ code: 500, text: 'Erreur coté serveur.' })
        }
      }
    }

    doRequest()
    setPhoto(URL.createObjectURL(file))

    return () => {
      controller.abort()
    }
  }, [])

  return (
    <li
      className={`transition-all duration-500 ease-out ${
        isVisible ? 'max-h-40 mt-3 translate-x-0 translate-y-0' : 'max-h-0 mt-0 -translate-x-6 -translate-y-3'
      }`}>
      <div
        className={`flex flex-grow items-center gap-3 transition duration-500 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}>
        {photo && <img src={photo} alt='' className='rounded-lg w-32 h-24 object-cover' />}
        <div className='flex-1 relative pt-1'>
          {errorCode ? (
            <div>
              <div className='text-xs font-semibold py-1 px-2 uppercase rounded-full text-red-600 bg-red-200 inline-flex'>
                Erreur
                <FireIcon className='h-4 w-4 ml-2' />
              </div>
              <div className='text-sm text-gray-900 mt-2'>Cette photo n'a pas pu être envoyée au serveur.</div>
              <div className='text-sm text-gray-700'>
                {errorCode.text} ({errorCode.code})
              </div>
            </div>
          ) : (
            <>
              <div className='flex mb-2 items-center justify-between'>
                <div>
                  {progress < 100 ? (
                    <span className='text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200 transition-colors'>
                      Téléchargement...
                    </span>
                  ) : (
                    <span className='text-xs font-semibold py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 inline-flex'>
                      Inséré dans l'histoire
                      <CheckIcon className='h-4 w-4 ml-2' />
                    </span>
                  )}
                </div>
                <div className='text-right'>
                  {progress < 100 ? (
                    <span className='text-xs font-semibold inline-block text-indigo-600'>{progress}%</span>
                  ) : (
                    <span className='text-xs font-semibold inline-block text-gray-400'>{progress}%</span>
                  )}
                </div>
              </div>
              {progress < 100 ? (
                <div className='overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200'>
                  <div
                    style={{ width: `${progress}%` }}
                    className='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500'
                  />
                </div>
              ) : (
                <div className='overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200'>
                  <div
                    style={{ width: `${progress}%` }}
                    className='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-200'
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </li>
  )
})

const UppyDashboard = ({ onMediaSelected }: { onMediaSelected: (args: { mediaId: MediaId; url: string }) => unknown }) => {
  const uppy = useState(() => {
    const uppy = new Uppy({ locale: UppyFrancais }).use(Tus, {
      endpoint: 'https://video.bunnycdn.com/tusupload',
      async onBeforeRequest(req, file) {
        // onBeforeRequest is called multiple times, so we need to check if we already have the meta
        if (!file.meta.VideoId) {
          const res = await axios.get(PrepareMediaUploadURL(file.name || file.size.toString()), {
            withCredentials: true,
          })

          const { AuthorizationSignature, AuthorizationExpire, LibraryId, VideoId, collectionId } = res.data

          file.meta = { ...file.meta, AuthorizationSignature, AuthorizationExpire, LibraryId, VideoId, collectionId }
        }

        const { AuthorizationSignature, AuthorizationExpire, LibraryId, VideoId } = file.meta

        // Useful for upload-success event
        uppy.setMeta({ LibraryId, VideoId })

        req.setHeader('AuthorizationSignature', AuthorizationSignature as string)
        req.setHeader('AuthorizationExpire', AuthorizationExpire as string)
        req.setHeader('LibraryId', LibraryId as string)
        req.setHeader('VideoId', VideoId as string)
      },
    })

    uppy.setOptions({ restrictions: { allowedFileTypes: ['video/*', 'audio/*'] } })

    // TODO: call the server to warn that the video is uploaded
    uppy.on('upload-success', async (file, response) => {
      // console.log('Upload success', file?.meta)
      const { LibraryId, VideoId } = file!.meta
      const res = await axios.post(
        MediaUploadCompleteURL,
        { VideoId, LibraryId },
        {
          withCredentials: true,
        }
      )

      const { mediaId } = res.data as { mediaId: MediaId }
      const url = `https://iframe.mediadelivery.net/embed/${LibraryId}/${VideoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`

      onMediaSelected({ mediaId, url })
    })

    return uppy
  })[0]

  return <Dashboard uppy={uppy} />
}
