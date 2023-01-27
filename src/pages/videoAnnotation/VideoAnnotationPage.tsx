import { Combobox } from '@headlessui/react'
import { CheckIcon, PlusIcon } from '@heroicons/react/solid'
import * as React from 'react'

import { BunnyCDNVideo, VideoSequence } from '../../events'
import { getUuid } from '../../libs/getUuid'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { useSearchClient } from '../_components/AlgoliaContext'
import { AppLayout } from '../_components/layout/AppLayout'
import { PlaceholderAvatar } from '../_components/PlaceholderAvatar'
import { SuccessError } from '../_components/SuccessError'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type PlaceDTO = string
export type TaggedPersonDTO = {
  objectID: string
  name: string
  bornOn?: string
  sex?: 'M' | 'F'
}

export type VideoSequenceDTO = {
  videoId: string
  sequenceId: string
  startTime?: string
  endTime?: string
  title?: string
  date?: string
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
      description?: never
      parsedDescription?: never
    }
  | {
      success: string
      error?: never
      video?: never
      sequences?: never
      description?: never
      parsedDescription?: never
    }
  | {
      success?: never
      error?: never
      video: BunnyCDNVideo
      description: string
      parsedDescription: any
      sequences: VideoSequenceDTO[]
    }

export const VideoAnnotationPage = withBrowserBundle(
  ({ error, success, video, sequences: initialSequences = [], description = '', parsedDescription }: VideoAnnotationProps) => {
    if (!video) {
      return (
        <AppLayout>
          <SuccessError error={error} success={success} />
        </AppLayout>
      )
    }

    const [sequences, setSequences] = React.useState<VideoSequenceDTO[]>(initialSequences)

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

          <form method='POST'>
            <label htmlFor='description'>Description</label>
            <textarea name='description' defaultValue={description}></textarea>
            <button>Valider</button>
          </form>

          <pre>{JSON.stringify(parsedDescription, null, 2)}</pre>

          {/* <div className='mt-5 md:grid md:grid-cols-1 md:gap-6'>
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
          </button> */}
        </div>
      </AppLayout>
    )
  }
)

type SequenceBoxProps = {
  sequence: VideoSequenceDTO
}
const SequenceBox = ({ sequence }: SequenceBoxProps) => {
  const {
    videoId,
    sequenceId,
    title,
    description,
    startTime,
    endTime,
    date,
    places: initialPlaces = [],
    persons: initialPersons = [],
  } = sequence

  const [places, setPlaces] = React.useState<string[]>(initialPlaces)

  const { index } = useSearchClient()

  const [hits, setHits] = React.useState<TaggedPersonDTO[]>([])
  const [query, setQuery] = React.useState<string>('')
  const [persons, setPersons] = React.useState<TaggedPersonDTO[]>(initialPersons || [])

  React.useEffect(() => {
    if (!index) return

    const fetchResults = async () => {
      if (query === '') {
        setHits([])
        return
      }
      const { hits } = await index.search(query)
      setHits(hits as TaggedPersonDTO[])
    }

    fetchResults()
  }, [index, setHits, query])

  const setNewPersons = React.useCallback(
    (newPersonsToAdd: TaggedPersonDTO[]) => {
      setQuery('')

      const uniquePersons = [...initialPersons, ...newPersonsToAdd].reduce((uniques, person) => {
        if (uniques.find(({ objectID }) => objectID === person.objectID) === undefined) {
          uniques.push(person)
        }
        return uniques
      }, [] as TaggedPersonDTO[])
      setPersons(uniquePersons)
    },
    [setPersons]
  )

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
                <label htmlFor='date' className='block text-sm font-medium text-gray-700'>
                  Date
                </label>
                <div className='mt-1 flex rounded-md shadow-sm'>
                  <input
                    type='text'
                    name='date'
                    id='date'
                    defaultValue={date}
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
                {places?.map((place, index) => (
                  <div key={`place_${index}`} className='mt-1 flex rounded-md shadow-sm'>
                    <input
                      type='text'
                      name='places'
                      id='places'
                      defaultValue={place}
                      className='block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                    />
                  </div>
                ))}
                <div className=''>
                  <button
                    type='button'
                    className='mt-1 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                    onClick={() => setPlaces((prevPlaces) => prevPlaces.concat(['']))}>
                    <PlusIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
                    Ajouter un autre lieu
                  </button>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-3 gap-6'>
              <div className='col-span-3 sm:col-span-2'>
                <label htmlFor='persons' className='block text-sm font-medium text-gray-700'>
                  Personnes
                </label>
                {index ? (
                  <Combobox as='div' value={persons} onChange={setNewPersons} multiple>
                    <ul role='list' className='divide-y divide-gray-200'>
                      {persons?.map((person) => (
                        <li key={`tagged_person${person.objectID}`} className='flex py-4'>
                          <PlaceholderAvatar className='h-10 w-10 rounded-full' />
                          <div className='ml-3'>
                            <p className='text-sm font-medium text-gray-900'>{person.name}</p>
                            {person.bornOn ? (
                              <p className='text-sm text-gray-500'>
                                {person.sex === 'M' ? 'né le ' : 'née le '}
                                {person.bornOn}
                              </p>
                            ) : (
                              ''
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className='relative mt-3 max-w-lg'>
                      <Combobox.Input
                        className='w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm'
                        placeholder='Ajouter une personne'
                        onChange={(event) => setQuery(event.target.value)}
                      />

                      {hits.length > 0 && (
                        <Combobox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                          {hits.map((hit) => (
                            <Combobox.Option
                              key={`hit_${hit.objectID}`}
                              value={hit}
                              className={({ active }) =>
                                classNames(
                                  'relative cursor-default select-none py-2 pl-3 pr-9',
                                  active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                                )
                              }>
                              {({ active, selected }) => (
                                <>
                                  <div className='sm:flex'>
                                    <div className={classNames('truncate', selected && 'font-semibold')}>{hit.name}</div>
                                    {hit.bornOn ? (
                                      <div
                                        className={classNames(
                                          'sm:ml-2 truncate text-gray-500',
                                          active ? 'text-indigo-200' : 'text-gray-500'
                                        )}>
                                        {hit.sex === 'M' ? 'né le ' : 'née le '}
                                        {hit.bornOn}
                                      </div>
                                    ) : (
                                      ''
                                    )}
                                  </div>

                                  {selected && (
                                    <span
                                      className={classNames(
                                        'absolute inset-y-0 right-0 flex items-center pr-4',
                                        active ? 'text-white' : 'text-indigo-600'
                                      )}>
                                      <CheckIcon className='h-5 w-5' aria-hidden='true' />
                                    </span>
                                  )}
                                </>
                              )}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      )}
                    </div>
                  </Combobox>
                ) : (
                  <div>Pas dispo</div>
                )}
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
        {persons?.map((person) => (
          <input type='hidden' name='persons' key={`person_field_${person.objectID}`} defaultValue={person.objectID} />
        ))}
      </form>
    </div>
  )
}

function stripToTaggedDTO(obj: TaggedPersonDTO): TaggedPersonDTO {
  const { objectID, name, bornOn, sex } = obj

  return { objectID, name, bornOn, sex }
}
