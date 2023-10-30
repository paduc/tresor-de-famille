import classNames from 'classnames'
import * as React from 'react'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { SessionContext } from '../_components'
import { AppLayout } from '../_components/layout/AppLayout'
import { CheckIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { buttonIconStyles, primaryButtonStyles, primaryGreenButtonStyles, secondaryButtonStyles } from '../_components/Button'
import { InlinePhotoUploadBtn } from '../_components/InlinePhotoUploadBtn'
import { ThreadTextarea } from '../_components/ThreadTextarea'
import { UUID } from '../../domain'
import { SendIcon } from '../chat/ChatPage/SendIcon'

type Steps = GetUserName & UploadProfilePicture
export type HomePageProps =
  | {
      isOnboarding: true
      steps: Steps
    }
  | {
      isOnboarding: false
    }

export const HomePage = withBrowserBundle((props: HomePageProps) => {
  const { isOnboarding } = props

  if (isOnboarding) {
    const { steps } = props

    if (steps['get-user-name'] === 'pending') {
      return (
        <Wrapper>
          <GetUserName />
        </Wrapper>
      )
    }

    if (steps['upload-profile-picture'] === 'pending') {
      return (
        <Wrapper>
          <UploadPhotoOfThemself />
        </Wrapper>
      )
    }

    if (steps['upload-profile-picture'] === 'photo-uploaded') {
      return (
        <Wrapper>
          <ChoseOwnFaceInPhoto step={steps} />
        </Wrapper>
      )
    }
  }

  return (
    <Wrapper>
      <div className='mt-3'>
        <Paragraph>Ici commence votre nouveau souvenir</Paragraph>
        <ThreadTextarea formAction='/chat.html' />
        <ul className='mt-2 px-1 text-gray-500 text-base list-inside list-disc'>
          Exemples:
          <li>Mon lieux de vacances quand j'étais enfant</li>
          <li>Plus ancien souvenir</li>
          <li>Le sport que j'ai pratiqué</li>
        </ul>
      </div>
      <div>
        <InlinePhotoUploadBtn formAction='/add-photo.html' hiddenFields={{ chatId: 'new' }} formKey='uploadPhotoAsNewThread'>
          <span className='cursor-pointer inline-flex items-center mt-6 px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
            <PhotoIcon className={`${buttonIconStyles}`} aria-hidden='true' />
            Commencer par une photo
          </span>
        </InlinePhotoUploadBtn>
      </div>
    </Wrapper>
  )
})

function Wrapper({ children }: React.PropsWithChildren) {
  const session = React.useContext(SessionContext)

  if (!session.isLoggedIn) return null

  const UserName = () =>
    session.userName ? (
      <span className='block text-indigo-600'>{session.userName}</span>
    ) : (
      <span className='block text-indigo-600'>illustre inconnu</span>
    )

  return (
    <AppLayout>
      <div className='px-4 py-6 md:px-8 md:py-12'>
        <h2 className='text-3xl font-bold tracking-tight text-gray-900 md:text-4xl'>
          <span className='block'>Bienvenue sur Trésor de famille</span>
          <div>
            {session.profilePic ? (
              <div className='mt-2 inline-flex items-center'>
                <img
                  src={session.profilePic}
                  className={`inline-block cursor-pointer rounded-full h-16 w-16 bg-white ring-2 ring-white mr-2`}
                />
                <UserName />
              </div>
            ) : (
              <UserName />
            )}
          </div>
        </h2>
        {children}
      </div>
    </AppLayout>
  )
}

function Paragraph({ children, className }: { className?: string } & React.PropsWithChildren) {
  return <div className={`text-gray-500 text-xl py-3 pb-2 max-w-3xl ${className}`}>{children}</div>
}

export type GetUserName =
  | {
      'get-user-name': 'pending'
    }
  | {
      'get-user-name': 'done'
      name: string
      personId: UUID
    }

export type UploadProfilePicture =
  | {
      'upload-profile-picture': 'pending'
    }
  | {
      'upload-profile-picture': 'photo-uploaded'
      photoId: UUID
      photoUrl: string
      faces: {
        faceId: UUID
      }[]
    }
  | {
      'upload-profile-picture': 'user-face-confirmed'
      photoId: UUID
      photoUrl: string
      faceId: UUID
    }

function GetUserName() {
  return (
    <div className='pb-5'>
      <div className='text-xl pt-6 text-gray-500'>Faisons connaissance ! Pour commencer, comment vous appelez-vous ?</div>
      <div className=''>
        <form method='POST' className='relative space-y-6'>
          <input type='hidden' name='action' value='submitPresentation' />
          <div className='overflow-hidden border border-gray-200 shadow-sm sm:max-w-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
            <label htmlFor='presentation' className='sr-only'>
              Nom complet
            </label>
            <input
              type='text'
              autoFocus
              name='presentation'
              className='block w-full resize-none border-0 py-3  focus:ring-0 text-xl'
              placeholder="Je m'appelle ..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  // @ts-ignore
                  e.target.form.submit()
                }
              }}
            />
          </div>
          <button type='submit' className={primaryButtonStyles}>
            <SendIcon className={buttonIconStyles} aria-hidden='true' />
            Envoyer
          </button>
        </form>
      </div>
    </div>
  )
}

const UploadPhotoOfThemself = () => {
  return (
    <div className='pb-5'>
      <div className='py-3'>
        <p className={`mt-3 text-xl text-gray-500`}>Je vous propose d'envoyer une photo de vous !</p>
        <InlinePhotoUploadBtn
          hiddenFields={{ action: 'userSendsPhotoOfThemself' }}
          formAction='/'
          formKey='uploadPhotoOfThemself'>
          <span className='cursor-pointer inline-flex items-center mt-6 px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
            <PhotoIcon className={`${buttonIconStyles}`} aria-hidden='true' />
            Choisir la photo
          </span>
        </InlinePhotoUploadBtn>
      </div>
    </div>
  )
}

type ChoseOwnFaceInPhotoProps = {
  step: Steps & { 'upload-profile-picture': 'photo-uploaded' }
}

export const ChoseOwnFaceInPhoto = ({ step }: ChoseOwnFaceInPhotoProps) => {
  const { photoId, photoUrl, faces } = step

  const UploadAnother = ({ secondary, className }: { secondary?: true; className?: string }) => (
    <InlinePhotoUploadBtn
      formAction='/'
      formKey='uploadAnotherPhotoOfThemselfy'
      hiddenFields={{ action: 'userSendsPhotoOfThemself' }}>
      <span className={`${secondary ? secondaryButtonStyles : primaryButtonStyles} ${className || ''}`}>
        <PhotoIcon className={`${buttonIconStyles}`} aria-hidden='true' />
        Choisir une autre photo
      </span>
    </InlinePhotoUploadBtn>
  )

  // Case: no faces
  if (!faces || faces.length === 0) {
    return (
      <div className='pb-5 py-3'>
        <Photo />
        <Paragraph>Aucun visage n'a été détecté sur cette photo. Merci d'en choisir une autre.</Paragraph>
        <UploadAnother className='mt-6' />
      </div>
    )
  }

  // Case: single face
  if (faces.length === 1) {
    return (
      <div className='pb-5 space-y-4'>
        <Photo />
        <Paragraph>Ce visage a été détecté. Est-ce bien le votre ?</Paragraph>
        <div className='flex justify-start items-center my-4'>
          <PhotoBadge photoId={photoId} faceId={faces[0].faceId} className='w-16 h-16' />
          <form method='POST' className='inline-block ml-2'>
            <input type='hidden' name='action' value='confirmFaceIsUser' />
            <input type='hidden' name='photoId' value={photoId} />
            <input type='hidden' name='faceId' value={faces[0].faceId} />
            <button type='submit' className={`${primaryGreenButtonStyles}`}>
              <CheckIcon className={`${buttonIconStyles}`} aria-hidden='true' />
              C'est bien moi !
            </button>
          </form>
        </div>
        <UploadAnother secondary className='mt-2' />
      </div>
    )
  }

  // Case: multiple faces
  return (
    <div className='pb-5 space-y-4'>
      <Photo />
      <Paragraph>Plusieurs visages ont été détectés sur cette photo, quel est le votre ?</Paragraph>
      <div className='p-0 -ml-1'>
        {faces.map((face) => (
          <form method='POST' key={`confirmFace${face.faceId}`} className='inline-block mr-2 mb-2'>
            <input type='hidden' name='action' value='confirmFaceIsUser' />
            <input type='hidden' name='photoId' value={photoId} />
            <input type='hidden' name='faceId' value={face.faceId} />
            <button type='submit' className=''>
              <PhotoBadge photoId={photoId} faceId={face.faceId} className='m-1 ring-green-600 hover:ring-4' />
            </button>
          </form>
        ))}
      </div>
      <UploadAnother secondary className='mt-2' />
    </div>
  )

  function Photo() {
    return (
      <div className='grid grid-cols-1 w-full mt-3'>
        <img src={photoUrl} className='max-w-full max-h-[50vh] border border-gray-300 shadow-sm' />
      </div>
    )
  }
}

type PhotoBadgeProps = {
  photoId: UUID
  faceId: UUID
  className?: string
}
const PhotoBadge = ({ photoId, className, faceId }: PhotoBadgeProps) => {
  return (
    <img
      // src='https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80'
      src={`/photo/${photoId}/face/${faceId}`}
      className={`inline-block cursor-pointer rounded-full h-14 w-14 bg-white ring-2 ring-white shadow-sm'
      } ${className || ''}`}
    />
  )
}
