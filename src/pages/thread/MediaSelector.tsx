import { CheckIcon, FireIcon, SparklesIcon, XCircleIcon } from '@heroicons/react/20/solid'
import axios, { AxiosError } from 'axios'
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { UUID } from '../../domain'
import { PhotoId } from '../../domain/PhotoId'
import { getUuid } from '../../libs/getUuid'
import { primaryButtonStyles, smallButtonStyles } from '../_components/Button'
import { TDFModal } from '../_components/TDFModal'
import { MediaSelectorListURL } from '../photoApi/MediaSelectorListURL'
import { ThumbnailURL } from '../photoApi/ThumbnailURL'

type MediaSelectorProps = {
  onMediaSelected?: (photoIds: PhotoId[]) => void
  children: (open: (args?: any) => any) => JSX.Element
}
type FetchStatus = 'idle' | 'downloading' | 'error'
export function MediaSelector({ onMediaSelected, children }: MediaSelectorProps) {
  const [photos, setPhotos] = useState<PhotoId[]>([])
  const [isOpen, setOpen] = useState(false)
  const [status, setStatus] = useState<FetchStatus>('idle')
  const uniqueKey = useMemo(() => getUuid(), [])

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
        uniqueKey={uniqueKey}
        isOpen={isOpen}
        close={() => {
          setOpen(false)
          // setTimeout(() => {
          //   setPhotos([])
          // }, 500)
        }}
        photos={photos.map((photoId) => ({ photoId, url: ThumbnailURL(photoId) }))}
        status={status}
        onMediaSelectedInComponent={(photoIds) => {
          if (onMediaSelected) {
            onMediaSelected(photoIds)
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
  onMediaSelectedInComponent?: (photoIds: PhotoId[]) => void
  photos: { photoId: PhotoId; url: string }[]
  isOpen: boolean
  close: () => unknown
  status: FetchStatus
  uniqueKey: UUID
}
export function MediaSelectorComponent({
  isOpen,
  close,
  onMediaSelectedInComponent,
  photos,
  status,
  uniqueKey,
}: MediaSelectorComponentProps) {
  const [newPhotos, setNewPhotos] = useState<{ photoId: PhotoId; url: string }[]>([])

  return (
    <TDFModal
      title={"Insérer des photos dans l'histoire"}
      isOpen={isOpen}
      close={() => {
        close()
        setNewPhotos([])
      }}>
      <UploadNewPhotos
        onPhotosUploaded={(photoIds) => {
          if (onMediaSelectedInComponent) onMediaSelectedInComponent(photoIds)
          // setNewPhotos((state) => [{ photoId, url: ThumbnailURL(photoId) }, ...state])
        }}
      />
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
          {[...newPhotos, ...photos].map(({ photoId, url }) => (
            <li key={`${uniqueKey}_${photoId}`} className='relative'>
              <div className='group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 cursor-pointer'>
                <img src={url} alt='' className='pointer-events-none object-cover group-hover:opacity-75' />
                <a
                  onClick={() => {
                    if (onMediaSelectedInComponent) onMediaSelectedInComponent([photoId])
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
            <SingleUpdate
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

const SingleUpdate = memo(({ file, uploadId, mock, onPhotoUploaded }: SingleUploadProps) => {
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
                      Téléchargé
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
