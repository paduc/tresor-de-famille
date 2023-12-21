import { PhotoIcon, PlusIcon } from '@heroicons/react/24/outline'
import * as React from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { FaceId } from '../../domain/FaceId'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'
import { ThreadId } from '../../domain/ThreadId'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { buttonIconStyles, linkStyles, primaryButtonStyles } from '../_components/Button'
import { InlinePhotoUploadBtn } from '../_components/InlinePhotoUploadBtn'
import { useLoggedInSession, useSession } from '../_components/SessionContext'
import { AppLayout } from '../_components/layout/AppLayout'
import { SendIcon } from '../thread/ThreadPage/SendIcon'
import { FamilyId } from '../../domain/FamilyId'
import { ThreadList } from '../_components/ThreadList'

type Steps = GetUserName
export type HomePageProps =
  | {
      isOnboarding: true
      steps: Steps
    }
  | {
      isOnboarding: false
      latestThreads: {
        threadId: ThreadId
        title: string | undefined
        lastUpdatedOn: number
        authors: {
          name: string
        }[]
        contents: string
        thumbnails: string[]
        familyId: FamilyId
      }[]
    }

export const HomePage = withBrowserBundle((props: HomePageProps) => {
  const session = useLoggedInSession()
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
  }

  return (
    <Wrapper>
      {!props.isOnboarding && props.latestThreads.length ? (
        <div className='mt-3'>
          {session.userFamilies.length > 1 ? (
            <Paragraph>Les nouveautés dans votre famille</Paragraph>
          ) : (
            <Paragraph>Reprenez vos derniers souvenirs</Paragraph>
          )}

          <div className='-mt-2'>
            <a href='/thread.html' className={`${linkStyles} text-base`}>
              + Démarrer une nouvelle anecdote
            </a>
          </div>
          <div className='mt-3 bg-white border border-gray-300 shadow-sm -mx-4 sm:max-w-lg md:max-w-xl'>
            <ThreadList threads={props.latestThreads} />
          </div>
        </div>
      ) : null}

      <a href='/thread.html' className={`${primaryButtonStyles} mt-5`}>
        <PlusIcon className={`${buttonIconStyles}`} />
        Créer une nouvelle anecdote familiale
      </a>
    </Wrapper>
  )
})

function Wrapper({ children }: React.PropsWithChildren) {
  const session = useSession()

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
      personId: PersonId
    }

export type UploadProfilePicture =
  | {
      'upload-profile-picture': 'pending'
    }
  | {
      'upload-profile-picture': 'photo-uploaded'
      photoId: PhotoId
      photoUrl: string
      faces: {
        faceId: FaceId
      }[]
    }
  | {
      'upload-profile-picture': 'user-face-confirmed'
      photoId: PhotoId
      photoUrl: string
      faceId: FaceId
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
