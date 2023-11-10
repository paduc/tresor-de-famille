import { CheckIcon, PhotoIcon } from '@heroicons/react/24/outline'
import * as React from 'react'
import { UUID } from '../../domain'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { SessionContext } from '../_components'
import { buttonIconStyles, primaryButtonStyles, primaryGreenButtonStyles, secondaryButtonStyles } from '../_components/Button'
import { InlinePhotoUploadBtn } from '../_components/InlinePhotoUploadBtn'
import TextareaAutosize from 'react-textarea-autosize'
import { AppLayout } from '../_components/layout/AppLayout'
import { SendIcon } from '../chat/ChatPage/SendIcon'

type Steps = GetUserName & UploadProfilePicture
export type HomePageProps =
  | {
      isOnboarding: true
      steps: Steps
    }
  | {
      isOnboarding: false
      latestThreads: {
        threadId: UUID
        title: string
        lastUpdatedOn: number
      }[]
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
      {!props.isOnboarding && props.latestThreads.length ? (
        <div className='mt-3'>
          <Paragraph>Reprenez vos derniers souvenirs</Paragraph>
          <div className='bg-white border border-gray-300 shadow-sm sm:max-w-lg md:max-w-xl'>
            <ul role='list' className='divide-y divide-gray-100'>
              {props.latestThreads.map((thread) => {
                const chatPageUrl = '/chat/' + thread.threadId + '/chat.html'
                return (
                  <li key={thread.threadId} className='flex flex-wrap items-center justify-between gap-y-1 ml-0 sm:flex-nowrap'>
                    <a href={chatPageUrl} className='w-full py-3 px-3 hover:bg-gray-50'>
                      <p className='text-base text-gray-800'>{thread.title}</p>
                      <div className='mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500'>
                        {/* <p>
                        <a href='' className='hover:underline'>
                          Autre ligne
                        </a>
                      </p>
                      <svg viewBox='0 0 2 2' className='h-0.5 w-0.5 fill-current'>
                        <circle cx={1} cy={1} r={1} />
                      </svg> */}
                        <p>
                          Dernière mise à jour le{' '}
                          <time dateTime={new Date(thread.lastUpdatedOn).toISOString()}>
                            {new Intl.DateTimeFormat('fr').format(new Date(thread.lastUpdatedOn))}
                          </time>
                        </p>
                      </div>
                      {/* <dl className='flex w-full flex-none justify-between gap-x-8 sm:w-auto'>
                  <div className='flex w-16 gap-x-2.5'>
                  <dt>
                  <span className='sr-only'>Total comments</span>
                  <ChatBubbleLeftIconOutline className='h-6 w-6 text-gray-400' aria-hidden='true' />
                  </dt>
                  <dd className='text-sm leading-6 text-gray-900'>32</dd>
                  </div>
                </dl> */}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className='mt-10 mb-7 w-full border-t border-gray-300 ' aria-hidden='true' />
        </div>
      ) : null}

      <div className='mt-3'>
        <Paragraph>Commencez un nouveau souvenir</Paragraph>
        <ThreadTextarea formAction='/chat.html' />
        <ul className='mt-2 px-1 text-gray-500 text-base list-inside list-disc'>
          Exemples:
          <li>Mon lieux de vacances quand j'étais enfant</li>
          <li>Plus ancien souvenir</li>
          <li>Le sport que j'ai pratiqué</li>
        </ul>
      </div>

      <div className='mt-3'>
        <InlinePhotoUploadBtn formAction='/add-photo.html' hiddenFields={{ chatId: 'new' }} formKey='uploadPhotoAsNewThread'>
          <span className='cursor-pointer inline-flex items-center mt-6 px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
            <PhotoIcon className={`${buttonIconStyles}`} aria-hidden='true' />
            Partir d'une photo
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

const ThreadTextarea = ({
  message,
  showTitle,
  hiddenFields,
  formAction = '',
}: {
  message?: string
  showTitle?: boolean
  hiddenFields?: Record<string, string>
  formAction?: string
}) => {
  return (
    <form method='POST' action={formAction} className='relative sm:max-w-lg md:max-w-xl'>
      {hiddenFields
        ? Object.entries(hiddenFields).map(([key, value]) => (
            <input type='hidden' key={`hidden_${key}`} name={key} value={value} />
          ))
        : null}
      <div className='pt-2 overflow-hidden bg-white border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
        {showTitle ? (
          <>
            <label htmlFor='title' className='sr-only'>
              Titre
            </label>
            <input
              type='text'
              name='title'
              id='title'
              className='block w-full border-0 pt-2.5 text-xl sm:text-lg font-medium placeholder:text-gray-400 focus:ring-0'
              placeholder='Titre (optionnel)'
            />
          </>
        ) : null}
        <label htmlFor='message' className='sr-only'>
          Je me souviens...
        </label>

        <TextareaAutosize
          name='message'
          id='message'
          minRows={4}
          autoFocus
          className='block w-full resize-none border-0 py-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-lg sm:text-base sm:leading-6 pb-3'
          placeholder='Je me souviens...'
          defaultValue={message}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.metaKey) {
              e.preventDefault()
              // @ts-ignore
              e.target.form.submit()
            }
          }}
        />

        {/* Spacer element to match the height of the toolbar */}
        <div aria-hidden='true'>
          {/* <div className='py-2'>
                      <div className='h-9' />
                    </div> */}
          <div className='h-px' />
          <div className='py-2'>
            <div className='py-px'>
              <div className='h-9' />
            </div>
          </div>
        </div>
      </div>
      <div className='absolute inset-x-px bottom-0'>
        <div className='flex items-center justify-between space-x-3 border-t border-gray-200 px-2 py-2 sm:px-3'>
          <div className='flex-shrink-0'>
            <button
              type='submit'
              className='inline-flex items-center rounded-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
