import * as React from 'react'
import { UUID } from '../../../domain'

import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'
import { SuccessError } from '../../_components/SuccessError'
import { AppLayout } from '../../_components/layout/AppLayout'
import { HoverContext, HoverProvider } from './HoverProvider'
import { SendIcon } from './SendIcon'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type PhotoFace = {
  person: {
    name: string
    annotatedBy: 'face-recognition' | 'ai'
  } | null
  faceId: UUID
  position: {
    width: number
    height: number
    left: number
    top: number
  }
}

type PhotoCaption = {
  body: string
}

export type PhotoPageProps = {
  success?: string
  error?: string
  photoId: UUID
  url: string
  caption?: string
}

export const PhotoPage = withBrowserBundle(({ error, success, photoId, url, caption }: PhotoPageProps) => {
  // const knownFaces = photo?.faces
  //   ?.filter((face) => face.person !== null)
  //   .sort((faceA, faceB) => faceA.position.left - faceB.position.left)

  // const unknownFacesCount = (photo?.faces?.length || 0) - (knownFaces?.length || 0)

  const [isSubmitCaptionButtonVisible, setSubmitCaptionButtonVisible] = React.useState(false)

  return (
    <AppLayout>
      <HoverProvider>
        <div className='bg-white w-full h-full pt-3'>
          <SuccessError success={success} error={error} />
          <div className='w-full sm:max-w-2xl sm:mx-auto grid grid-cols-1 justify-items-center bg-gray-100 sm:border sm:rounded-lg overflow-hidden'>
            <div className='relative'>
              <img src={url} className='' />
              {/* {photo.faces?.map((face, index) => (
                  <HoverableFace key={`face${index}`} face={face} />
                ))} */}
            </div>
            {/* <div className='pl-2 pt-3 w-full'>
                {knownFaces?.map(({ faceId, person }, index) => (
                  <FaceBadge key={`face${index}`} faceId={faceId} person={person!} />
                ))}
                <div className='inline-block mr-3 pr-3 align-middle sm:text-sm text-gray-700'>
                  {unknownFacesCount ? `${knownFaces?.length ? 'et ' : ''} ${unknownFacesCount} visages non identifiés` : ''}
                </div>
              </div> */}

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
          </div>
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

type FaceBadgeProps = {
  faceId: UUID
  person: {
    name: string
    annotatedBy: 'face-recognition' | 'ai'
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
          <div
            className={`inline-block h-4 w-4 ml-2 text-gray-500 ${
              hoveredFaceId === faceId ? 'text-indigo-700' : 'text-gray-500'
            }`}>
            {person.annotatedBy === 'face-recognition' ? (
              <svg
                fill='none'
                stroke='currentColor'
                strokeWidth={1.5}
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden='true'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
            ) : (
              <svg
                fill='none'
                stroke='currentColor'
                strokeWidth={1.5}
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden='true'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z'
                />
              </svg>
            )}
          </div>
          <div className='ml-1'>
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
