import React, { useEffect, useReducer, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { useMutation, useQueryClient } from 'react-query'
import classNames from 'classnames'
import axios from 'axios'
import { useDropzone } from 'react-dropzone'

import { TDFModal } from '../_components/TDFModal'

type PhotoUploaderProps = {}

export function PhotoUploader({}: PhotoUploaderProps) {
  return (
    <TDFModal isOpen={true} close={() => {}} title={'Uploader photos'}>
      <UploadArea />
    </TDFModal>
  )
}

interface UploadData {
  id: string
  data: FormData
  progress: number
}

interface UploadAreaProps {
  familyId?: string
}
export const UploadArea = ({ familyId }: UploadAreaProps) => {
  const { uploadImages, uploads } = useUploadImage(familyId)

  return (
    <>
      <h3 className='text-md font-medium text-gray-900'>Ajouter des photos</h3>
      <UploadDropzone onFileUploads={uploadImages} />
      <div className='flex flex-wrap mt-3'>
        {!!Object.keys(uploads).length &&
          Object.values(uploads)
            .filter(({ data }) => data !== null)
            .map(({ id, data, progress }) => <UploadItem key={id} id={id} data={data!} progress={progress} />)}
      </div>
    </>
  )
}

const UploadItem = React.memo(({ id, progress, data }: UploadData) => {
  return (
    <div className='relative w-40 h-40 overflow-hidden rounded-lg shadow mb-3 mr-3 hover:ring-2 hover:ring-offset-2 hover:ring-indigo-500'>
      {progress && progress < 100 ? <CircularProgress progress={progress} radius={50} /> : ''}
      {/* {error ? (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <XIcon className="w-32 h-32 text-white" alt="Echec de l'envoi" />
        </div>
      ) : (
        ''
      )} */}
      <div
        className={classNames('cursor-pointer block w-full h-full', {
          ['opacity-60']: progress !== 100,
        })}>
        <LazyImage file={data} />
      </div>
    </div>
  )
})

export interface UploadDropzoneProps {
  onFileUploads: (files: any[]) => unknown
}
export const UploadDropzone = ({ onFileUploads }: UploadDropzoneProps) => {
  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    onDrop: (files: any) => {
      console.log(`dropzone onDrop`, files)
      onFileUploads(files)
    },
    accept: {
      'image/png': [],
      'image/jpeg': [],
    },
    minSize: 0,
    maxSize: 10 * 1024 * 1024,
  })

  return (
    <>
      <div
        className={classNames('mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md', {
          'border-gray-400': isDragActive,
          'bg-gray-50': isDragActive,
        })}
        {...getRootProps()}>
        <div className='space-y-1 text-center'>
          {isDragActive ? (
            <>
              <svg
                className='w-12 h-12 inline mr-4 ml-4 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5'
                />
              </svg>

              <div className='flex text-sm text-gray-600'>Relâcher pour envoyer</div>
            </>
          ) : (
            <>
              <svg
                className='mx-auto h-12 w-12 text-gray-400'
                stroke='currentColor'
                fill='none'
                viewBox='0 0 48 48'
                aria-hidden='true'>
                <path
                  d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                  strokeWidth={2}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>

              <div className='flex text-sm text-gray-600'>
                <label
                  htmlFor='file-upload'
                  className='relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500'>
                  <span>Choisir le fichier</span>
                  <input {...getInputProps()} className='sr-only' />
                </label>
                <p className='pl-1'>ou glisser-déposer sur cette zone</p>
              </div>
              <p className='text-xs text-gray-500'>Image PNG, JPG jusqu'à 10Mo</p>
            </>
          )}
        </div>
      </div>
    </>
  )
}

interface LazyImageProps {
  file: FormData
}
const LazyImage = React.memo(({ file }: LazyImageProps) => {
  const [source, setSource] = useState('data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==')

  useEffect(() => {
    const reader = new FileReader()
    const photoBlob = file?.get('photo') as Blob
    reader.readAsDataURL(photoBlob)
    reader.onload = (e) => {
      if (e.target) setSource(e.target.result as string)
    }
  }, [])

  return <img alt={'miniature'} className={'object-cover w-full h-full'} src={source} />
})

const postUploadImage = (familyId?: string) => (args: { data: FormData; onProgress: (progress: number) => unknown }) => {
  if (familyId) {
    args.data.append('familyId', familyId)
  }
  return axios.post('/upload-photo', args.data, {
    onUploadProgress: (event) => {
      args.onProgress(Math.round((100 * event.loaded) / (event.total || 1)))
    },
  })
}

type UploadAction =
  | {
      type: 'upload-started'
      id: string
      data: FormData
    }
  | { type: 'progress-updated'; id: string; progress: number }

const reducer = (uploads: Record<string, UploadData>, action: UploadAction): Record<string, UploadData> => {
  switch (action.type) {
    case 'upload-started':
      return {
        ...uploads,
        [action.id]: {
          id: action.id,
          data: action.data,
          progress: uploads[action.id]?.progress || 0,
        },
      }
    case 'progress-updated':
      if (action.progress === 100) {
        const { [action.id]: doneUpload, ...others } = uploads
        return others
      }
      return {
        ...uploads,
        [action.id]: {
          id: action.id,
          data: uploads[action.id]?.data || null,
          progress: action.progress,
        },
      }
    default:
      return uploads
  }
}

const initialState: Record<string, UploadData> = {}

export const useUploadImage = (familyId?: string) => {
  const queryClient = useQueryClient()
  const [uploads, dispatch] = useReducer(reducer, initialState)

  const mutation = useMutation(postUploadImage(familyId), {
    onSettled: () => {
      queryClient.invalidateQueries('stream')
    },
  })

  const uploadImages = (files: any) => {
    files.forEach((file: any) => {
      const id = uuid()

      const data = new FormData()
      data.append('id', id)
      data.append('photo', file)

      dispatch({ type: 'upload-started', data, id })

      mutation.mutate({
        data,
        onProgress: (progress) => {
          dispatch({ type: 'progress-updated', id, progress })
        },
      })
    })
  }

  return { uploadImages, uploads }
}

interface CircularProgressProps {
  radius: number
  progress: number
}

const CircularProgress = ({ radius, progress }: CircularProgressProps) => {
  const stroke = 12
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI

  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className='absolute inset-0 flex items-center justify-center z-10'>
      <svg height={radius * 2} width={radius * 2} className='opacity-75'>
        <circle
          stroke='white'
          fill='transparent'
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
    </div>
  )
}
