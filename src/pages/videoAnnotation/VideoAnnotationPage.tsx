import { PlusIcon } from '@heroicons/react/solid'
import * as React from 'react'

import { BunnyCDNVideo, VideoSequence } from '../../events'
import { getUuid } from '../../libs/getUuid'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../_components/layout/AppLayout'
import { SuccessError } from '../_components/SuccessError'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type PlaceDTO = string
export type TaggedPersonDTO = string

export type VideoSequenceDTO = {
  videoId: string
  sequenceId: string
  startTime?: string
  endTime?: string
  title?: string
  description?: string
  places?: PlaceDTO[]
  persons?: TaggedPersonDTO[]
}

export type VideoAnnotationProps =
  | {
      success?: never
      error: string
      video?: never
      sequences?: never
    }
  | {
      success: string
      error?: never
      video?: never
      sequences?: never
    }
  | {
      success?: never
      error?: never
      video: BunnyCDNVideo
      sequences: VideoSequenceDTO[]
    }

export const VideoAnnotationPage = withBrowserBundle(
  ({ error, success, video, sequences: originalSequences }: VideoAnnotationProps) => {
    if (!video) {
      return (
        <AppLayout>
          <SuccessError error={error} success={success} />
        </AppLayout>
      )
    }

    const [sequences, setSequences] = React.useState<VideoSequenceDTO[]>(originalSequences)

    const addNewSequence = React.useCallback(() => {
      setSequences((prevSequences) => [...prevSequences, { videoId: video.videoId, sequenceId: getUuid() }])
    }, [setSequences, video])

    return (
      <AppLayout>
        <div className='p-6'>
          <h3 className='mt-5 text-3xl font-semibold leading-6 text-gray-900'>{video.title}</h3>

          <a
            className='mt-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            href={video.directPlayUrl}
            target='_blank'>
            Voir la vidéo
          </a>

          <SuccessError success={success} error={error} />

          <div className='mt-5 md:grid md:grid-cols-1 md:gap-6'>
            {sequences.map((sequence) => (
              <SequenceBox sequence={sequence} key={`sequence_${sequence.sequenceId}`} />
            ))}
          </div>

          <button
            type='button'
            className='mt-5 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            onClick={() => addNewSequence()}>
            <PlusIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
            Ajouter une séquence
          </button>
        </div>
      </AppLayout>
    )
  }
)

type SequenceBoxProps = {
  sequence: VideoSequenceDTO
}
const SequenceBox = ({ sequence }: SequenceBoxProps) => {
  const { videoId, sequenceId, title, description, startTime, endTime, places, persons } = sequence
  return (
    <div className='mt-5 md:mt-0'>
      <form method='POST'>
        <input type='hidden' name='videoId' value={videoId} />
        <input type='hidden' name='sequenceId' value={sequenceId} />
        <div className='shadow sm:overflow-hidden sm:rounded-md'>
          <div className='space-y-6 bg-white px-4 py-5 sm:p-6'>
            <div className='grid grid-cols-2 gap-6'>
              <div className='col-span-1'>
                <label htmlFor='startTime' className='block text-sm font-medium text-gray-700'>
                  Début
                </label>
                <div className='mt-1 flex rounded-md shadow-sm'>
                  <input
                    type='text'
                    name='startTime'
                    id='startTime'
                    defaultValue={startTime}
                    className='block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                    placeholder='00:00:00'
                  />
                </div>
              </div>
              <div className='col-span-1'>
                <label htmlFor='endTime' className='block text-sm font-medium text-gray-700'>
                  Fin
                </label>
                <div className='mt-1 flex rounded-md shadow-sm'>
                  <input
                    type='text'
                    name='endTime'
                    id='endTime'
                    defaultValue={endTime}
                    className='block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                    placeholder='00:00:00'
                  />
                </div>
              </div>
              <div className='col-span-2'>
                <p className='text-sm text-gray-500'>
                  Les temps sont indiqués en heures, minutes et secondes (hh:mm:ss).
                  <br /> Si les heures sont omises, elles seront considérées comme nulles (ie 12:34 équivaudra à 00:12:34).
                </p>
              </div>
            </div>
            <div className='grid grid-cols-3 gap-6'>
              <div className='col-span-3 sm:col-span-2'>
                <label htmlFor='title' className='block text-sm font-medium text-gray-700'>
                  Titre de la séquence
                </label>
                <div className='mt-1 flex rounded-md shadow-sm'>
                  <input
                    type='text'
                    name='title'
                    id='title'
                    defaultValue={title}
                    className='block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  />
                </div>
              </div>
            </div>

            <div className='grid grid-cols-3 gap-6'>
              <div className='col-span-3 sm:col-span-2'>
                <label htmlFor='places' className='block text-sm font-medium text-gray-700'>
                  Lieux
                </label>
                <div className='mt-1 flex rounded-md shadow-sm'>
                  {places?.map((place, index) => (
                    <input
                      type='text'
                      name='places'
                      id='places'
                      key={`place${place}${index}`}
                      defaultValue={place}
                      className='block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-3 gap-6'>
              <div className='col-span-3 sm:col-span-2'>
                <label htmlFor='persons' className='block text-sm font-medium text-gray-700'>
                  Personnes
                </label>
                <div className='mt-1 flex rounded-md shadow-sm'>
                  <input
                    type='text'
                    name='persons'
                    id='persons'
                    defaultValue={persons}
                    className='block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor='description' className='block text-sm font-medium text-gray-700'>
                Détails supplémentaires
              </label>
              <div className='mt-1'>
                <textarea
                  id='description'
                  defaultValue={description}
                  name='description'
                  rows={3}
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                />
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-4 py-3 text-right sm:px-6'>
            <button
              type='submit'
              className='inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'>
              Sauvegarder
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
