import * as React from 'react'
import { UUID } from '../../../domain'

import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { SuccessError } from '../../_components/SuccessError'
import { AppLayout } from '../../_components/layout/AppLayout'
import { HoverContext, HoverProvider } from './HoverProvider'
import { SendIcon } from './SendIcon'
import type { UserAddedCaptionToPhoto } from '../UserAddedCaptionToPhoto'
import type { PhotoAnnotatedUsingOpenAI } from '../annotatePhotoUsingOpenAI/PhotoAnnotatedUsingOpenAI'
import type { AWSDetectedFacesInPhoto } from '../recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { PhotoIcon } from './PhotoIcon'
import { ClientOnly } from '../../_components/ClientOnly'
import { CheckIcon } from '@heroicons/react/solid'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type PhotoFace = {
  person: {
    name: string
  } | null
  faceId: UUID
  position: {
    width: number
    height: number
    left: number
    top: number
  }
}

export type PhotoPageProps = {
  success?: string
  error?: string
  photoId: UUID
  url: string
  caption?: string
  confirmedPersons: PhotoFace[]
  confirmedDeductions: UUID[]
  personsByFaceId: {
    [faceId: UUID]: { personId: UUID; name: string }[] // There can be multiple persons associated to a face
  }
  personById: {
    [personId: UUID]: { name: string }
  }
  annotationEvents: (UserAddedCaptionToPhoto | PhotoAnnotatedUsingOpenAI | AWSDetectedFacesInPhoto)[]
}

export const PhotoPage = withBrowserBundle(
  ({
    error,
    success,
    photoId,
    url,
    caption,
    personsByFaceId,
    personById,
    annotationEvents,
    confirmedPersons,
    confirmedDeductions,
  }: PhotoPageProps) => {
    const [isSubmitCaptionButtonVisible, setSubmitCaptionButtonVisible] = React.useState(false)

    const getConfirmedPersonForFace = (faceId: UUID) => {
      return confirmedPersons.find(({ faceId: _faceId }) => _faceId === faceId)?.person?.name
    }

    // Serialization breaks dates in events,
    // runtime gives us event.occurredAt as a string
    annotationEvents.forEach((event) => (event.occurredAt = new Date(event.occurredAt)))

    const faces = annotationEvents
      .filter((event): event is AWSDetectedFacesInPhoto => {
        return event.type === 'AWSDetectedFacesInPhoto'
      })
      .reduce((faces, event) => {
        for (const { faceId, position } of event.payload.faces) {
          faces.set(faceId, {
            faceId,
            position: {
              width: position.Width!,
              height: position.Height!,
              top: position.Top!,
              left: position.Left!,
            },
            person: null,
          })
        }

        return faces
      }, new Map<string, PhotoFace>())
      .values()

    return (
      <AppLayout>
        <HoverProvider>
          <div className='bg-white w-full min-h-full pt-3 pb-10'>
            <SuccessError success={success} error={error} />
            <div className='w-full sm:max-w-2xl sm:mx-auto grid grid-cols-1 justify-items-center bg-gray-100 sm:border sm:rounded-lg overflow-hidden'>
              <div className='relative'>
                <img src={url} className='' />
                {[...faces].map((face) => {
                  return <HoverableFace key={`faceSpot${face.faceId}`} face={face} />
                })}
              </div>

              {confirmedPersons && Boolean(confirmedPersons.length) ? (
                <div className='bg-gray-100 w-full py-2 px-2'>
                  {confirmedPersons.map((person) => (
                    <FaceBadge
                      faceId={person.faceId}
                      title={person.person!.name}
                      className='mr-2'
                      key={`confirmedPerson${person.faceId}`}
                    />
                  ))}
                </div>
              ) : null}
              <div className='bg-white w-full'>
                <form method='POST' className='relative'>
                  <input type='hidden' name='photoId' defaultValue={photoId} />
                  <div className='overflow-hidden sm:border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
                    <label htmlFor='caption' className='sr-only'>
                      Ajouter une légende...
                    </label>
                    <textarea
                      rows={3}
                      name='caption'
                      id='caption'
                      className='block w-full resize-none border-0 py-3 focus:ring-0 sm:text-sm'
                      placeholder='Ajouter une légende...'
                      defaultValue={caption}
                      onKeyUp={(e) => {
                        setSubmitCaptionButtonVisible(e.currentTarget.value !== caption)
                      }}
                    />

                    {/* Spacer element to match the height of the toolbar */}
                    <div className='py-2' aria-hidden='true'>
                      {/* Matches height of button in toolbar (1px border + 36px content height) */}
                      <div className='py-px'>
                        <div className='h-9' />
                      </div>
                    </div>
                  </div>

                  {isSubmitCaptionButtonVisible ? (
                    <div className='absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
                      <div className='flex-shrink-0'>
                        <button
                          type='submit'
                          className='inline-flex items-center mt-3 px-3 py-1.5 border border-transparent sm:sm:text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                          <SendIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
                          Envoyer
                        </button>
                      </div>
                    </div>
                  ) : null}
                </form>
              </div>
              <div className='bg-gray-100 w-full  divide-y divide-dashed divide-gray-400'>
                {annotationEvents
                  .sort((eventA, eventB) => {
                    return eventA.occurredAt.getTime() - eventB.occurredAt.getTime()
                  })
                  .map((event) => {
                    if (event.type === 'AWSDetectedFacesInPhoto' && event.payload.faces.length === 0) return

                    return (
                      <div className='pl-2 pt-3 w-full' key={event.id}>
                        <ClientOnly>
                          <div className='text-gray-500 text-sm'>
                            Le {new Date(event.occurredAt).toLocaleDateString()} à{' '}
                            {new Date(event.occurredAt).toLocaleTimeString()}
                            <span className='ml-2 italic'>{event.type}</span>
                          </div>
                        </ClientOnly>
                        {event.type === 'AWSDetectedFacesInPhoto' ? (
                          <div className='py-2 text-sm'>
                            <div className='mb-1'>
                              La reconnaissance automatique a détecté {event.payload.faces.length} visage(s).
                            </div>
                            <ul className=''>
                              {event.payload.faces
                                .sort((faceA, faceB) => {
                                  return (
                                    faceB.position.Width! * faceB.position.Height! -
                                    faceA.position.Width! * faceA.position.Height!
                                  )
                                })
                                .map((face, index) => {
                                  const confirmedNameForFace = getConfirmedPersonForFace(face.faceId)
                                  return (
                                    <li key={'face' + event.id + face.faceId} className='mb-1 mr-2 text-sm'>
                                      <PhotoBadge faceId={face.faceId} photoId={photoId} className='mr-2' />
                                      {confirmedNameForFace ? (
                                        <span className=''>confirmé comme étant {confirmedNameForFace}</span>
                                      ) : personsByFaceId[face.faceId] ? (
                                        <span className=''>
                                          est reconnu et a été associé à{' '}
                                          {personsByFaceId[face.faceId].map(({ name }) => name).join(' ou ')}
                                        </span>
                                      ) : (
                                        // Il y a deux cas ici: première fois qu'on le voit (vraiment inconnu) et présent dans d'autres photos mais pas associé à une personne
                                        <span className=''>n'est pas connu</span>
                                      )}
                                    </li>
                                  )
                                })}
                            </ul>
                          </div>
                        ) : event.type === 'UserAddedCaptionToPhoto' ? (
                          <div className='py-2 text-sm'>
                            <div className='mb-1'>Vous avez mis à jour la légende.</div>
                            <div className='italic'>{event.payload.caption.body}</div>
                          </div>
                        ) : event.type === 'PhotoAnnotatedUsingOpenAI' ? (
                          <div className='py-2 text-sm'>
                            <div className='mb-1'>
                              A partir des informations connues, l'IA est arrivée aux conclusions suivantes.
                            </div>
                            <ul className='mt-2 mb-2'>
                              {event.payload.deductions.map((deduction, index) => {
                                const confirmedDeduction = confirmedDeductions.includes(deduction.deductionId)
                                const confirmedNameForFace = getConfirmedPersonForFace(deduction.faceId)
                                return (
                                  <li key={'deduction' + event.id + deduction.faceId} className='mb-1 mr-2 text-sm'>
                                    <>
                                      <PhotoBadge photoId={photoId} faceId={deduction.faceId} className='mr-1' />
                                      {deduction.type === 'face-is-person'
                                        ? ` serait le visage de 
                                      ${personById[deduction.personId]?.name}`
                                        : ` serait le visage d'une
                                      nouvelle personne appelée "${deduction.name}"`}
                                      {confirmedDeduction ? (
                                        <ConfirmedBadge />
                                      ) : confirmedNameForFace ? (
                                        <span className=''>(confirmé comme étant {confirmedNameForFace})</span>
                                      ) : (
                                        <ConfirmButton photoId={photoId} deduction={deduction} />
                                      )}
                                    </>
                                  </li>
                                )
                              })}
                            </ul>
                            <details className='text-sm text-gray-600 ml-1'>
                              <summary className='cursor-pointer'>voir les details</summary>

                              <div>model: {event.payload.model}</div>
                              <div className='mt-2'>
                                prompt:
                                <pre className='overflow-scroll'>{event.payload.prompt}</pre>
                              </div>
                              {event.payload.response ? (
                                <div className='mt-2'>
                                  response:
                                  <pre className='overflow-scroll'>{event.payload.response}</pre>
                                </div>
                              ) : null}
                            </details>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                {caption ? (
                  <form method='POST' className='mb-3 ml-2'>
                    <input type='hidden' name='action' value='triggerAnnotation' />
                    <input type='hidden' name='photoId' value={photoId} />
                    <button
                      type='submit'
                      className='inline-flex items-center mt-3 px-3 py-1.5 border border-transparent sm:text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                      <PhotoIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
                      Lancer une annotation par IA
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </div>
        </HoverProvider>
      </AppLayout>
    )
  }
)

type ChatItemProps = { children: React.ReactNode; isLastItem?: boolean }
export const ChatItem = ({ children, isLastItem }: ChatItemProps) => {
  return (
    <li>
      <div className='relative pb-8'>
        {!isLastItem ? <span className='absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200' aria-hidden='true' /> : null}
        <div className='relative flex items-start space-x-3'>{children}</div>
      </div>
    </li>
  )
}

type FaceBadgeProps = {
  faceId: UUID
  title: string
  className?: string
}
const FaceBadge = ({ title, faceId, className }: FaceBadgeProps) => {
  const { hoveredFaceId, setHoveredFaceId } = React.useContext(HoverContext)
  return (
    <div
      className={`inline-block rounded-full py-1 px-2  bg-white ${
        hoveredFaceId === faceId ? 'ring-indigo-500 ring-2' : 'ring-1 ring-gray-300'
      } ${className || ''}`}
      onMouseOver={() => {
        setHoveredFaceId(faceId)
      }}
      onMouseOut={() => {
        setHoveredFaceId(null)
      }}>
      <a href='#' className='group block flex-shrink-0 '>
        <div className='flex items-center'>
          {/* <div
            className={`inline-block h-4 w-4 ml-2 text-gray-500 ${
              hoveredFaceId === faceId ? 'text-indigo-700' : 'text-gray-500'
            }`}></div> */}
          <p className={`text-sm font-medium  ${hoveredFaceId === faceId ? 'text-indigo-700' : 'text-gray-700'}`}>{title}</p>
        </div>
      </a>
    </div>
  )
}

type PhotoBadgeProps = {
  faceId: UUID
  photoId: UUID
  className?: string
}
const PhotoBadge = ({ photoId, faceId, className }: PhotoBadgeProps) => {
  const { hoveredFaceId, setHoveredFaceId } = React.useContext(HoverContext)
  return (
    <img
      // src='https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=100&h=100&q=80'
      src={`/photo/${photoId}/face/${faceId}`}
      className={`inline-block rounded-full h-8 w-8 bg-white ${
        hoveredFaceId === faceId ? 'ring-indigo-500 ring-2' : 'ring-2 ring-white'
      } ${className || ''}`}
      onMouseOver={() => {
        setHoveredFaceId(faceId)
      }}
      onMouseOut={() => {
        setHoveredFaceId(null)
      }}
    />
  )
}

type HoverableFaceProps = {
  face: PhotoFace
}
const HoverableFace = ({ face }: HoverableFaceProps) => {
  const { hoveredFaceId, setHoveredFaceId } = React.useContext(HoverContext)

  const isFaceHovered = hoveredFaceId === face.faceId

  return (
    <div
      onMouseOver={() => {
        setHoveredFaceId(face.faceId)
      }}
      onMouseOut={() => {
        setHoveredFaceId(null)
      }}
      style={{
        top: `${Math.round(face.position.top * 100)}%`,
        left: `${Math.round(face.position.left * 100)}%`,
        width: `${Math.round(face.position.width * 100)}%`,
        height: `${Math.round(face.position.height * 100)}%`,
      }}
      className={`absolute  ${isFaceHovered ? 'border-2' : 'border-0'} border-white cursor-pointer`}></div>
  )
}
function ConfirmButton(props: { photoId: UUID; deduction: { deductionId: UUID; photoId: UUID } }) {
  const { photoId, deduction } = props
  return (
    <form method='POST' className='inline-block ml-2'>
      <input type='hidden' name='action' value='confirmAnnotation' />
      <input type='hidden' name='photoId' value={photoId} />
      <input type='hidden' name='deductionId' value={deduction.deductionId} />
      <button
        type='submit'
        className='inline-flex items-center py-1 px-2 pl-7 rounded-full bg-white text-sm relative hover:font-semibold text-green-600 shadow-sm ring-1 hover:ring-2 ring-green-600 ring-inset'>
        <CheckIcon className='absolute left-2 h-4 w-4' aria-hidden='true' />
        Je valide
      </button>
    </form>
  )
}

function ConfirmedBadge() {
  return (
    <div className='inline-flex items-center ml-1 py-1 px-2 pl-7 rounded-full bg-white text-sm relative font-semibold  text-green-600 shadow-sm ring-1 ring-green-600 ring-inset'>
      <CheckIcon className='absolute left-2 h-4 w-4' aria-hidden='true' />
      Validé
    </div>
  )
}
