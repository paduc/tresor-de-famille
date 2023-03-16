import * as React from 'react'

import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../../_components/layout/AppLayout'
import { SuccessError } from '../../_components/SuccessError'
import { ChatBubbleLeftEllipsisIcon } from './ChatBubbleLeftEllipsisIcon'
import { HoverContext, HoverProvider } from './HoverProvider'
import { PhotoIcon } from './PhotoIcon'
import { SendIcon } from './SendIcon'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type ChatPhotoFace = {
  person: {
    name: string
  } | null
  faceId: string
  position: {
    width: number
    height: number
    left: number
    top: number
  }
}

export type ChatDeduction = {
  // type: 'face-is-person'
  person: {
    name: string
  }
  faceId: string
  photo: {
    url: string
  }
  position: {
    width: number
    height: number
    left: number
    top: number
  }
}

export type ChatEvent = { timestamp: number } & (
  | {
      type: 'photo'
      profilePicUrl: string
      photo: {
        id: string
        url: string
        faces?: ChatPhotoFace[]
      }
    }
  | {
      type: 'message'
      profilePicUrl: string
      message: {
        body: string
      }
    }
  | {
      type: 'deductions'
      deductions: ChatDeduction[]
    }
)

export type PhotoPageProps = {
  success?: string
  error?: string
  photo: {
    id: string
    url: string
    faces?: ChatPhotoFace[]
  } | null
}

export const PhotoPage = withBrowserBundle(({ error, success, photo }: PhotoPageProps) => {
  const photoUploadForm = React.useRef<HTMLFormElement>(null)

  const photoUploadFileSelected = (e: any) => {
    if (photoUploadForm.current !== null) photoUploadForm.current.submit()
  }
  return (
    <AppLayout>
      <HoverProvider>
        <div className='bg-white'>
          <SuccessError success={success} error={error} />
          {photo ? (
            <div className='w-full sm:max-w-[100vh] sm:mx-auto bg-gray-100 sm:border sm:rounded-lg overflow-hidden'>
              <img src={photo.url} className='w-full sm:h-[75vh] object-contain' />
              {photo.faces?.map((face, index) => (
                <HoverableFace key={`face${index}`} face={face} />
              ))}
              <div className='pl-2'>
                {photo.faces
                  ?.filter((face) => face.person !== null)
                  .map(({ faceId, person }, index) => (
                    <FaceBadge key={`face${index}`} faceId={faceId} person={person!} />
                  ))}
              </div>
              <div className='bg-white'>
                <form method='POST' className='relative'>
                  <div className='overflow-hidden sm:border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
                    <label htmlFor='message' className='sr-only'>
                      Ajouter une légende...
                    </label>
                    <textarea
                      rows={3}
                      name='message'
                      id='message'
                      className='block w-full resize-none border-0 py-3 focus:ring-0 sm:text-sm'
                      placeholder='Ajouter une légende...'
                      defaultValue={''}
                    />

                    {/* Spacer element to match the height of the toolbar */}
                    <div className='py-2' aria-hidden='true'>
                      {/* Matches height of button in toolbar (1px border + 36px content height) */}
                      <div className='py-px'>
                        <div className='h-9' />
                      </div>
                    </div>
                  </div>

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
                </form>
              </div>
            </div>
          ) : (
            <div className='max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8'>
              <div className='text-center'>
                <p className='mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl'>
                  Des photos !
                </p>
                <p className='max-w-xl mt-5 mx-auto text-xl text-gray-500'>
                  Téléverse une photo et rajoute une description pour la postérité.
                </p>
                <form ref={photoUploadForm} method='post' encType='multipart/form-data'>
                  <input
                    type='file'
                    id='file-input'
                    name='photo'
                    className='hidden'
                    accept='image/png, image/jpeg, image/jpg'
                    onChange={photoUploadFileSelected}
                  />
                  <label
                    htmlFor='file-input'
                    className='inline-flex items-center mt-6 px-3 py-1.5 border border-transparent sm:text-sm cursor-pointer font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                    <PhotoIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
                    Ajouter une photo
                  </label>
                </form>
              </div>
            </div>
          )}
        </div>
      </HoverProvider>
    </AppLayout>
  )
})

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

type DeductionsItemProps = { event: ChatEvent & { type: 'deductions' } }
export const DeductionsItem = ({ event }: DeductionsItemProps) => {
  return (
    <ChatItem>
      <div className='relative'>
        <span className='inline-block h-10 w-10 overflow-hidden rounded-full bg-gray-100 ring-8 ring-white'>
          <svg className='h-full w-full text-gray-300' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z' />
          </svg>
        </span>

        <span className='absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px'>
          <ChatBubbleLeftEllipsisIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
        </span>
      </div>
      <div className='min-w-0 flex-1'>
        <div className='text-sm text-gray-700'>J'en ai déduit que</div>
        <div className='mt-1 mb-2 text-sm text-gray-700'>
          {event.deductions.map((deduction, index) => (
            <DeductionItem deduction={deduction} key={`deduction_${index}`} />
          ))}
        </div>
      </div>
    </ChatItem>
  )
}

const DeductionItem = ({ deduction: { position, photo, person, faceId } }: { deduction: ChatDeduction }) => {
  const bgSize = Math.round((8 / 10) * Math.min(Math.round(100 / position.height), Math.round(100 / position.width)))
  const { setHoveredFaceId } = React.useContext(HoverContext)
  return (
    <div
      className='inline-block mr-3 rounded-full pr-3 ring-2 ring-gray-300'
      onMouseOver={() => {
        setHoveredFaceId(faceId)
      }}
      onMouseOut={() => {
        setHoveredFaceId(null)
      }}>
      <a href='#' className='group block flex-shrink-0 '>
        <div className='flex items-center'>
          <div
            className='inline-block h-10 w-10 rounded-full'
            style={{
              backgroundImage: `url(${photo.url})`,
              backgroundPosition: `${Math.round(position.left * 100)}% ${Math.round(position.top * 100)}%`,
              backgroundSize: `${bgSize}% ${bgSize}%`,
            }}></div>
          <div className='ml-3'>
            <p className='text-sm font-medium text-gray-700 group-hover:text-gray-900'>est {person.name}</p>
          </div>
        </div>
      </a>
    </div>
  )
}

type FaceBadgeProps = {
  faceId: string
  person: {
    name: string
  }
}
const FaceBadge = ({ person, faceId }: FaceBadgeProps) => {
  const { hoveredFaceId, setHoveredFaceId } = React.useContext(HoverContext)
  return (
    <div
      className={`inline-block mr-3 mb-3 rounded-full pr-3  bg-white ${
        hoveredFaceId === faceId ? 'ring-indigo-500 ring-2' : 'ring-1 ring-gray-300'
      }`}
      onMouseOver={() => {
        setHoveredFaceId(faceId)
      }}
      onMouseOut={() => {
        setHoveredFaceId(null)
      }}>
      <a href='#' className='group block flex-shrink-0 '>
        <div className='flex items-center'>
          <div className='ml-3'>
            <p className={`text-sm font-medium  ${hoveredFaceId === faceId ? 'text-indigo-700' : 'text-gray-700'}`}>
              {person.name}
            </p>
          </div>
        </div>
      </a>
    </div>
  )
}

type HoverableFaceProps = {
  face: ChatPhotoFace
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
        height: `calc(${Math.round(face.position.height * 100)}% + 20px)`,
      }}
      className={`absolute  ${isFaceHovered ? 'border-2' : 'border-0'} border-white cursor-pointer`}></div>
  )
}
