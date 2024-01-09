import { CheckIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { FamilyId } from '../../domain/FamilyId'
import { getUuid } from '../../libs/getUuid'
import { primaryButtonStyles, smallButtonStyles } from '../_components/Button'
import { TDFModal } from '../_components/TDFModal'
import { FireIcon } from '@heroicons/react/20/solid'

type MultiuploadProps = {
  mock?: boolean
  children: (open: (args: any) => any) => JSX.Element
  familyId?: FamilyId
}

export function Multiupload({ mock, children, familyId }: MultiuploadProps) {
  const [isOpen, setOpen] = useState(false)
  const [photosToUpload, setPhotosToUploaed] = useState<{ file: File; id: string }[]>([])

  const handleFiles: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (event.target.files === null) return

      const newPhotos = Array.from(event.target.files).map((file) => ({ file, id: getUuid() }))

      setPhotosToUploaed((state) => {
        return [...newPhotos, ...state]
      })
    },
    [photosToUpload]
  )

  return (
    <>
      {children(() => setOpen(true))}
      <TDFModal
        title={'Ajouter des photos'}
        isOpen={isOpen}
        close={() => {
          setOpen(false)
          setTimeout(() => setPhotosToUploaed([]), 500)
        }}>
        <div className='divide-y divide-gray-200'>
          <div className='pb-4'>
            <label htmlFor='photo' className={`${primaryButtonStyles} ${smallButtonStyles}`}>
              Sélectionner des photos
            </label>
            <input type='file' multiple name='photo' id='photo' className='hidden' onChange={handleFiles} />
          </div>

          {photosToUpload.length ? (
            <ul className='pt-2'>
              {photosToUpload.map(({ file, id }) => (
                <SingleUpdate file={file} key={`photo_uploading_${id}`} mock={mock} familyId={familyId} />
              ))}
            </ul>
          ) : null}
        </div>
      </TDFModal>
    </>
  )
}

type SingleUploadProps = {
  file: File
  mock?: boolean
  familyId?: FamilyId
}

const SingleUpdate = memo(({ file, mock, familyId }: SingleUploadProps) => {
  const [progress, setProgress] = useState(0)
  const [isError, setError] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)

  if (!file) {
    return null
  }

  useEffect(() => {
    setPhoto(URL.createObjectURL(file))

    if (mock) {
      let progress = 0
      const interval = setInterval(() => {
        if (progress >= 100) {
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
      if (familyId) {
        formData.append('familyId', familyId)
      }
      try {
        const res = await axios.post('/upload-photo', {
          signal: controller,
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e: { loaded: number; total: number }) => {
            setProgress(Math.round((e.loaded * 100) / (e.total || 1)))
          },
        })

        console.log('Axios res.status', res.status)
      } catch (error) {
        console.error('Axios failed', error)
        setError(true)
      }
    }

    doRequest()

    return () => {
      controller.abort()
    }
  }, [])

  return (
    <li className='flex flex-grow items-center gap-3 mt-3'>
      {photo && <img src={photo} alt='' className='rounded-lg w-32 h-24 object-cover' />}
      <div className='flex-1 relative pt-1'>
        <div className='flex mb-2 items-center justify-between'>
          <div>
            {isError ? (
              <span className='text-xs font-semibold py-1 px-2 uppercase rounded-full text-red-600 bg-red-200 inline-flex'>
                Erreur
                <FireIcon className='h-4 w-4 ml-2' />
              </span>
            ) : progress < 100 ? (
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
      </div>
    </li>
  )
})
