import { RadioGroup } from '@headlessui/react'
import { ArrowRightIcon, PlusIcon } from '@heroicons/react/20/solid'
import { CheckIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import classNames from 'classnames'
import * as React from 'react'
import { UUID } from '../../domain'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { SessionContext } from '../_components'
import {
  buttonIconStyles,
  primaryButtonStyles,
  primaryGreenButtonStyles,
  secondaryButtonStyles,
  secondaryRedButtonStyles,
} from '../_components/Button'
import { InlinePhotoUploadBtn } from '../_components/InlinePhotoUploadBtn'
import { AppLayout } from '../_components/layout/AppLayout'
import { FamilyMemberRelationship, traduireRelation } from '../bienvenue/step3-learnAboutUsersFamily/FamilyMemberRelationship'
import { SendIcon } from '../chat/ChatPage/SendIcon'
import { PersonAutocomplete } from './PersonAutocomplete'
import { ThreadTextarea } from '../_components/ThreadTextarea'

type Steps = GetUserName & UploadFirstPhoto & UploadFamilyPhoto & CreateFirstThread & ChoseBeneficiaries

export type HomePageProps =
  | {
      isOnboarding: true
      steps: Steps
    }
  | {
      isOnboarding: false
      displayFinisherCongratulations: boolean
    }

export const HomePage = withBrowserBundle((props: HomePageProps) => {
  const { isOnboarding } = props

  const session = React.useContext(SessionContext)

  if (!session.isLoggedIn)
    return (
      <div>
        Vous ne devriez pas être là <a href='/login.html'>Me connecter</a>
      </div>
    )

  if (!isOnboarding) {
    return (
      <Wrapper>
        <div className='mt-8 space-y-6 divide divide-y divide-solid divide-gray-400'>
          {props.displayFinisherCongratulations ? (
            <div>
              <Paragraph>
                <div className='font-semibold text-gray-800'>Bravo !</div> Vous êtes maintenant parés.
              </Paragraph>
              <Paragraph>
                Vous trouverez, ci-dessous, l'écran qui vous accueillera dorénavant. Il vous invite à enrichir votre trésor.
              </Paragraph>
            </div>
          ) : null}
          <div>
            <Paragraph>Je note un souvenir qui me passe par la tête</Paragraph>
            <ThreadTextarea formAction='/chat.html' />
            <ul className='mt-2 px-1 text-gray-500 text-base list-inside list-disc'>
              Exemples:
              <li>Mon lieux de vacances quand j'étais enfant</li>
              <li>Plus ancien souvenir</li>
              <li>Le sport que j'ai pratiqué</li>
            </ul>
          </div>
          <div>
            <InlinePhotoUploadBtn formAction='/' formKey='uploadPhotoAsNewThread'>
              <span className='cursor-pointer inline-flex items-center mt-6 px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                <PhotoIcon className={`${buttonIconStyles}`} aria-hidden='true' />
                Commencer par une photo
              </span>
            </InlinePhotoUploadBtn>
          </div>
        </div>
      </Wrapper>
    )
  }

  const { steps } = props

  if (steps['get-user-name'] === 'pending') {
    return (
      <Wrapper>
        <GetUserName />
      </Wrapper>
    )
  }

  if (steps['upload-first-photo'] === 'pending') {
    return (
      <Wrapper>
        <UploadPhotoOfThemself />
      </Wrapper>
    )
  }

  if (steps['upload-first-photo'] === 'photo-uploaded') {
    return (
      <Wrapper>
        <ChoseOwnFaceInPhoto step={steps} />
      </Wrapper>
    )
  }

  if (steps['upload-family-photo'] === 'awaiting-upload') {
    return (
      <Wrapper>
        <UploadFamilyPhoto step={steps} />
      </Wrapper>
    )
  }

  if (steps['upload-family-photo'] === 'annotating-photo') {
    return (
      <Wrapper>
        <AnnotateFamilyPhoto step={steps} />
      </Wrapper>
    )
  }
  if (steps['create-first-thread'] === 'awaiting-input') {
    return (
      <Wrapper>
        <CreateFirstThread />
      </Wrapper>
    )
  }

  if (steps['create-first-thread'] === 'thread-written') {
    return (
      <Wrapper>
        <FirstThreadStep step={steps} />
      </Wrapper>
    )
  }

  if (steps['chose-beneficiaries'] === 'awaiting-input') {
    return (
      <Wrapper>
        <ChoseBeneficiariesStep step={steps} />{' '}
      </Wrapper>
    )
  }

  return <Wrapper />
})

function Wrapper({ children }: React.PropsWithChildren) {
  const session = React.useContext(SessionContext)

  if (!session.isLoggedIn)
    return (
      <div>
        Vous ne devriez pas être là <a href='/login.html'>Me connecter</a>
      </div>
    )

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
          <span className='block'>Bienvenu sur Trésor de famille</span>
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

export type GetUserName =
  | {
      'get-user-name': 'pending'
    }
  | {
      'get-user-name': 'done'
      name: string
      personId: UUID
    }

export type UploadFirstPhoto =
  | {
      'upload-first-photo': 'pending'
    }
  | {
      'upload-first-photo': 'photo-uploaded'
      photoId: UUID
      photoUrl: string
      faces: {
        faceId: UUID
      }[]
    }
  | {
      'upload-first-photo': 'user-face-confirmed'
      photoId: UUID
      photoUrl: string
      faceId: UUID
    }

export type UploadFamilyPhoto =
  | {
      'upload-family-photo': 'awaiting-upload'
    }
  | {
      'upload-family-photo': 'annotating-photo'
      photos: {
        photoId: UUID
        photoUrl: string
        faces: FamilyMemberPhotoFace[]
      }[]
    }
  | {
      'upload-family-photo': 'done'
    }

export type CreateFirstThread =
  | {
      'create-first-thread': 'awaiting-input'
    }
  | {
      'create-first-thread': 'thread-written'
      threadId: UUID
      message: string
    }
  | {
      'create-first-thread': 'done'
      threadId: UUID
      message: string
    }

export type ChoseBeneficiaries =
  | {
      'chose-beneficiaries': 'awaiting-input'
    }
  | {
      'chose-beneficiaries': 'done'
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
          <button
            type='submit'
            className='inline-flex items-center mt-3 px-3 py-1.5 border border-transparent sm:text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
            <SendIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
            Envoyer
          </button>
        </form>
      </div>
    </div>
  )
}

export const UploadPhotoOfThemself = () => {
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
  step: Steps & { 'upload-first-photo': 'photo-uploaded' }
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

function Paragraph({ children, className }: { className?: string } & React.PropsWithChildren) {
  return <div className={`text-gray-500 text-xl py-3 pb-2 max-w-3xl ${className}`}>{children}</div>
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

type FamilyMemberPhotoFace = {
  faceId: UUID
} & (
  | {
      stage: 'awaiting-name'
    }
  | {
      stage: 'ignored'
    }
  | {
      stage: 'awaiting-relationship'
      name: string
      personId: UUID
    }
  | {
      stage: 'awaiting-relationship-confirmation'
      name: string
      personId: UUID
      messages: OpenAIMessage[]
      userAnswer: string
      relationship: FamilyMemberRelationship
    }
  | {
      stage: 'done'
      personId: UUID
      name: string
      relationship?: FamilyMemberRelationship
    }
)

type OpenAIMessage = {
  role: 'assistant' | 'user' | 'system'
  content: string | null
  function_call?: {
    name: string
    arguments: string
  }
}

type UploadFamilyPhotoProps = {
  step: UploadFamilyPhoto & { 'upload-family-photo': 'awaiting-upload' }
}

export const UploadFamilyPhoto = ({ step }: UploadFamilyPhotoProps) => {
  return (
    <div className='mt-5'>
      <Paragraph>Maintenant, je vous propose de présenter votre famille, à travers une ou plusieurs photo.</Paragraph>
      <div className='mt-4'>
        <InlinePhotoUploadBtn formAction='/' formKey='uploadFamilyPhoto' hiddenFields={{ action: 'userSendsPhotoOfFamily' }}>
          <span className={`${primaryButtonStyles}`}>
            <PhotoIcon className={`${buttonIconStyles}`} aria-hidden='true' />
            Choisir une photo de ma famille
          </span>
        </InlinePhotoUploadBtn>
      </div>
    </div>
  )
}

type AnnotateFamilyPhotoProps = {
  step: UploadFamilyPhoto & { 'upload-family-photo': 'annotating-photo' }
}

export const AnnotateFamilyPhoto = ({ step }: AnnotateFamilyPhotoProps) => {
  const { photos } = step

  // Check if the latest photo has no faces
  const lastPhoto = photos[photos.length - 1]
  if (lastPhoto.faces.length === 0) {
    return (
      <div className='py-3'>
        <Photo photoUrl={lastPhoto.photoUrl} />
        <p className={`mt-3 text-xl text-gray-500`}>
          Aucun visage n'a été détecté sur cette photo. Merci d'en choisir une autre.
        </p>
        <UploadAnother className='mt-6' />
      </div>
    )
  }

  // Get first photo with a face to annotate
  const photoIndex = photos.findIndex((photo) => photo.faces.some(({ stage }) => stage !== 'done' && stage !== 'ignored'))

  // No photo with an unannotated face == We are done !
  if (photoIndex === -1) {
    return (
      <>
        <Photo photoUrl={lastPhoto.photoUrl} />
        <Paragraph className={`mt-3 mb-3`}>Annotation de cette photo terminée !</Paragraph>
        <FamilyMemberView steps={step} />
        <Paragraph>Voulez-vous continuer en ajoutant une autre photo ou passer à la suite ?</Paragraph>
        <InlinePhotoUploadBtn
          formAction='/'
          formKey='uploadAnotherPhotoOfFamily'
          hiddenFields={{ action: 'userSendsPhotoOfFamily' }}>
          <span className='cursor-pointer inline-flex items-center mt-3 px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm text-indigo-600 bg-white hover:bg-indigo-500 hover:text-white ring-2 ring-indigo-600'>
            <PhotoIcon className='-ml-0.5 mr-2 h-6 w-6' aria-hidden='true' />
            Choisir une autre photo
          </span>
        </InlinePhotoUploadBtn>
        <form method='POST' className='relative mt-4 pb-6'>
          <input type='hidden' name='action' value='familyMemberAnnotationIsDone' />
          <button type='submit' className={`${primaryButtonStyles}`}>
            <ArrowRightIcon className={`${buttonIconStyles}`} aria-hidden='true' />
            Passer à la suite
          </button>
        </form>
      </>
    )
  }

  const photo = photos[photoIndex]

  const { faces, photoUrl } = photo

  const faceInProgress = faces.find(
    (
      face
    ): face is FamilyMemberPhotoFace & {
      stage: 'awaiting-name' | 'awaiting-relationship' | 'awaiting-relationship-confirmation'
    } => !['done', 'ignored'].includes(face.stage)
  )

  if (!faceInProgress) throw new Error('Impossible')

  const ignoredFaces = faces.filter((face): face is FamilyMemberPhotoFace & { stage: 'ignored' } => face.stage === 'ignored')

  return (
    <div className='pb-5'>
      <div className='py-3'>
        <Photo photoUrl={photoUrl} />

        <div className='mt-3'>
          <div className='flex justify-center md:justify-start'>
            <PhotoBadge
              photoId={photo.photoId}
              faceId={faceInProgress.faceId}
              className={`m-2 h-[80px] w-[80px] hover:cursor-default`}
            />
          </div>
          <div>
            {faceInProgress.stage === 'awaiting-name' ? (
              <FamilyMemberNameForm faceId={faceInProgress.faceId} photoId={photo.photoId} />
            ) : (
              <FamilyMemberRelationshipForm face={faceInProgress} />
            )}
          </div>
        </div>
        <div className='mt-6'>
          {faces
            .filter((face) => face.stage === 'awaiting-name' && face.faceId !== faceInProgress?.faceId)
            .map((face) => {
              return (
                <div key={`awaiting_face_${face.faceId}`}>
                  <PhotoBadge
                    key={`annotatingFamilyFaces${face.faceId}`}
                    photoId={photo.photoId}
                    faceId={face.faceId}
                    className={`m-2 hover:cursor-default mix-blend-luminosity`}
                  />
                </div>
              )
            })}
          {faces
            .filter((face): face is FamilyMemberPhotoFace & { stage: 'done' } => face.stage === 'done')
            .map((face) => {
              return (
                <div key={`done_face_${face.faceId}`}>
                  <PhotoBadge
                    key={`annotatingFamilyFaces${face.faceId}`}
                    photoId={photo.photoId}
                    faceId={face.faceId}
                    className={`m-2 hover:cursor-default`}
                  />
                  <span className='text-gray-500'>
                    {face.name} {face.relationship ? `(${traduireRelation(face.relationship)})` : ''}
                  </span>
                </div>
              )
            })}
          {ignoredFaces.length ? (
            <span className='text-gray-500 ml-2'>
              et {ignoredFaces.length} visage{ignoredFaces.length > 1 ? 's' : ''} ignoré{ignoredFaces.length > 1 ? 's' : ''}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )

  function Photo({ photoUrl }: { photoUrl: string }) {
    return (
      <div className='grid grid-cols-1 w-full mt-3'>
        <img src={photoUrl} className='max-w-full max-h-[50vh] border border-gray-300 shadow-sm' />
      </div>
    )
  }

  function UploadAnother({ secondary, className }: { secondary?: true; className?: string }) {
    return (
      <InlinePhotoUploadBtn
        formAction='/'
        formKey='uploadAnotherPhotoOfFamily'
        hiddenFields={{ action: 'userSendsPhotoOfFamily' }}>
        <span className={`${secondary ? secondaryButtonStyles : primaryButtonStyles} ${className || ''}`}>
          <PhotoIcon className={`${buttonIconStyles}`} aria-hidden='true' />
          Choisir une autre photo
        </span>
      </InlinePhotoUploadBtn>
    )
  }
}

type AnnotatingSinglePhotoProps = {}

function AnnotatingSinglePhoto({}: AnnotatingSinglePhotoProps) {}

type FamilyMemberNameFormProps = {
  faceId: UUID
  photoId: UUID
}

const FamilyMemberNameForm = ({ faceId, photoId }: FamilyMemberNameFormProps) => {
  const formRef = React.useRef<HTMLFormElement>(null)

  const handlePersonSelected = (selection: { type: 'known'; personId: UUID } | { type: 'unknown'; name: string }) => {
    const { type } = selection
    if (formRef.current !== null) {
      if (type === 'unknown') {
        const element = formRef.current.elements.namedItem('newFamilyMemberName') as HTMLInputElement

        if (element !== null) {
          element.value = selection.name
        }
      } else {
        const element = formRef.current.elements.namedItem('existingFamilyMemberId') as HTMLInputElement

        if (element !== null) {
          element.value = selection.personId
        }
      }
      formRef.current.submit()
    }
  }

  return (
    <>
      <Paragraph className={`mb-2`}>Quel est le nom de cette personne ?</Paragraph>
      <PersonAutocomplete onPersonSelected={handlePersonSelected} className='max-w-xl' />
      <form method='POST' ref={formRef}>
        <input type='hidden' name='action' value='submitFamilyMemberName' />
        <input type='hidden' name='faceId' value={faceId} />
        <input type='hidden' name='photoId' value={photoId} />
        <input type='hidden' name='newFamilyMemberName' value='' />
        <input type='hidden' name='existingFamilyMemberId' value='' />

        <button type='submit' className={`${primaryButtonStyles} mt-3`}>
          <SendIcon className={`${buttonIconStyles}`} aria-hidden='true' />
          Envoyer
        </button>
      </form>
      <form method='POST' className='relative mt-3'>
        <input type='hidden' name='action' value='ignoreFamilyMemberFaceInPhoto' />
        <input type='hidden' name='faceId' value={faceId} />
        <input type='hidden' name='photoId' value={photoId} />
        <button type='submit' className={`${secondaryRedButtonStyles}`}>
          <XMarkIcon className={`${buttonIconStyles}`} aria-hidden='true' />
          Ignorer ce visage
        </button>
      </form>
    </>
  )
}

type FamilyMemberRelationshipFormProps = {
  face: FamilyMemberPhotoFace & { stage: 'awaiting-relationship-confirmation' | 'awaiting-relationship' }
}

const FamilyMemberRelationshipForm = ({ face }: FamilyMemberRelationshipFormProps) => {
  const { personId, name, stage } = face

  const [confirmBoxIsDisplayed, toggleConfirmBox] = React.useState(false)

  return (
    <div className=''>
      <Paragraph className={``}>
        Qui est <span className='text-black'>{name}</span> ?
      </Paragraph>
      {confirmBoxIsDisplayed || stage === 'awaiting-relationship' ? (
        <>
          <form method='POST' className='relative'>
            <input type='hidden' name='action' value='submitRelationship' />
            <input type='hidden' name='personId' value={personId} />

            <div className='overflow-hidden border border-gray-200 shadow-sm sm:max-w-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
              <label htmlFor='userAnswer' className='sr-only'>
                Par exemple: mon père, l'épouse de...
              </label>
              <input
                type='text'
                autoFocus
                name='userAnswer'
                className='block w-full resize-none border-0 py-3 px-4 focus:ring-0 text-xl'
                placeholder="Ex: mon père, l'épouse de mon frère, ma petite-fille..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    // @ts-ignore
                    e.target.form.submit()
                  }
                }}
              />
            </div>
            <button type='submit' className={`${primaryButtonStyles} mt-5`}>
              <SendIcon className={`${buttonIconStyles}`} aria-hidden='true' />
              Envoyer
            </button>
          </form>
          <form method='POST' className='relative mt-3'>
            <input type='hidden' name='action' value='ignoreRelationship' />
            <input type='hidden' name='personId' value={personId} />
            <button type='submit' className={`${secondaryRedButtonStyles}`}>
              <XMarkIcon className={`${buttonIconStyles}`} aria-hidden='true' />
              Passer
            </button>
          </form>
        </>
      ) : (
        <>
          <p className='text-black text-xl'>{face.userAnswer}</p>
          <Paragraph className=''>
            Si j'ai bien compris, {name} serait {traduireRelation(face.relationship)}.
          </Paragraph>
          <form method='POST' className='block'>
            <input type='hidden' name='action' value='confirmOpenAIRelationship' />
            <input type='hidden' name='personId' value={personId} />
            <input type='hidden' name='stringifiedRelationship' value={JSON.stringify(face.relationship)} />
            <button type='submit' className={`${primaryGreenButtonStyles}`}>
              <CheckIcon className={`${buttonIconStyles}`} aria-hidden='true' />
              C'est bien ça
            </button>
          </form>

          <button className={`${secondaryRedButtonStyles} mt-3 block`} onClick={() => toggleConfirmBox(true)}>
            <XMarkIcon className={`${buttonIconStyles}`} aria-hidden='true' />
            Non, pas tout à fait...
          </button>
        </>
      )}
    </div>
  )
}

type CreateFirstThreadProps = {}
export const CreateFirstThread = ({}: CreateFirstThreadProps) => {
  return (
    <div
      className='
-mx-3 mt-3'>
      <div className={`px-3 py-2 text-xl text-gray-500`}>
        <p className='py-1'>
          Dans trésor de famille, il est également possible de transmettre des souvenirs sous forme écrite.
        </p>
        <p className='py-1'>Il peuvent être très courts (une phrase ?) ou le début d'une histoire familiale plus fournie.</p>
        <p className='py-1'>Je te propose d'écrire ici ton premier fil de souvenir.</p>
      </div>
      <div className='px-3'>
        <ThreadTextarea hiddenFields={{ action: 'startFirstThread' }} />
        <ul className='mt-2 px-1 text-gray-500 text-base list-inside list-disc'>
          Exemples:
          <li>Mon lieux de vacances quand j'étais enfant</li>
          <li>Plus ancien souvenir</li>
          <li>Le sport que j'ai pratiqué</li>
        </ul>
      </div>
    </div>
  )
}

type FirstThreadStepProps = {
  step: CreateFirstThread & { 'create-first-thread': 'thread-written' }
}
export const FirstThreadStep = ({ step }: FirstThreadStepProps) => {
  const threadUrl = `/chat/${step.threadId}/chat.html`

  return (
    <div className='divide divide-y divide-gray-300'>
      <div className='pb-5'>
        <Paragraph className={``}>
          Bravo! Maintenant que vous avez lancé le fil de souvenir, vous pouvez le compléter avec un titre, des propos
          supplémentaires, des photos, etc.
        </Paragraph>
        <a className='text-indigo-600 text-lg font-semibold border-b border-b-indigo-600' href={threadUrl}>
          Aller à mon souvenir
        </a>
      </div>
      <div className='pt-5'>
        <Paragraph>
          Des photos de votre famille, des visages et des relations, un premier souvenir... vous avez déjà un{' '}
          <span className='text-black'>trésor</span> !
        </Paragraph>
        <Paragraph>
          Un trésor, fait pour être <span className='text-black'>transmis</span>. Mais à qui ?
        </Paragraph>
        <form method='POST' className='relative mt-3'>
          <input type='hidden' name='action' value='gotoTransmission' />
          <button type='submit' className={`${primaryButtonStyles}`}>
            <ArrowRightIcon className={`${buttonIconStyles}`} aria-hidden='true' />
            Choisir le mode de transmission
          </button>
        </form>
      </div>
    </div>
  )
}

type ChoseBeneficiariesStepProps = {
  step: ChoseBeneficiaries & { 'chose-beneficiaries': 'awaiting-input' }
}
type TriggerMode = {
  mode: 'tdf-detection-contacts-beneficiaries' | 'user-distributes-codes'
  name: string
  description: JSX.Element
}

const triggerModes: TriggerMode[] = [
  {
    mode: 'tdf-detection-contacts-beneficiaries',
    name: 'Automatique',
    description: (
      <div className='space-y-3'>
        <div>
          Si Trésor de famille détecte une inactivité de votre part, nous vous contactons pour nous assurer que tout va bien.
        </div>
        <div>
          En l'absence de réponse, nous déclenchons la procédure de transmission, en prenant contact avec vos bénéficiaires.
        </div>
      </div>
    ),
  },
  {
    mode: 'user-distributes-codes',
    name: 'Manuel',
    description: (
      <div className='space-y-3'>
        <div>Vous imprimez et distribuez des QR code spécialement conçus à vos bénéficiaires.</div>
        <div>Le moment venu, vos bénéficiaires pourront flasher le QR code et obtenir l'accès à votre trésor.</div>
      </div>
    ),
  },
]

export const ChoseBeneficiariesStep = ({ step }: ChoseBeneficiariesStepProps) => {
  const [selectedMode, setSelectedMode] = React.useState<TriggerMode>(triggerModes[0])

  const [beneficiaryCount, setBeneficiaryCount] = React.useState<number>(1)

  return (
    <div className=''>
      <Paragraph>
        Voici comment votre <span className='text-indigo-600'>trésor</span> sera transmis à la postérité.
      </Paragraph>
      <form method='POST' className='relative mt-3'>
        <input type='hidden' name='action' value='choseTransmissionMode' />
        <div className='space-y-6'>
          <div className='space-y-6'>
            <div>
              <h2 className='text-xl font-semibold leading-7 text-gray-900'>Déclenchement</h2>
              <p className='mt-1 max-w-2xl text-base leading-6 text-gray-600'>
                Vous avez le choix entre deux modes de transmission.
              </p>
              <div className='mt-4'>
                <RadioGroup value={selectedMode} onChange={setSelectedMode}>
                  <RadioGroup.Label className='sr-only'>Déclencheur</RadioGroup.Label>
                  <div className='-space-y-px rounded-md bg-white md:max-w-2xl'>
                    {triggerModes.map((setting, settingIdx) => (
                      <RadioGroup.Option
                        key={setting.name}
                        value={setting}
                        className={({ checked }) =>
                          classNames(
                            settingIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                            settingIdx === triggerModes.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
                            checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200',
                            'relative flex cursor-pointer border p-4 focus:outline-none'
                          )
                        }>
                        {({ active, checked }) => (
                          <>
                            <span
                              className={classNames(
                                checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300',
                                active ? 'ring-2 ring-offset-2 ring-indigo-600' : '',
                                'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-full border flex items-center justify-center'
                              )}
                              aria-hidden='true'>
                              <span className='rounded-full bg-white w-1.5 h-1.5' />
                            </span>
                            <span className='ml-3 flex flex-col'>
                              <RadioGroup.Label
                                as='span'
                                className={classNames(
                                  checked ? 'text-indigo-900' : 'text-gray-900',
                                  'block text-base font-medium'
                                )}>
                                {setting.name}
                              </RadioGroup.Label>
                              <RadioGroup.Description
                                as='span'
                                className={classNames(checked ? 'text-indigo-700' : 'text-gray-500', 'block text-base mt-2')}>
                                {setting.description}
                              </RadioGroup.Description>
                            </span>
                          </>
                        )}
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          {selectedMode.mode === 'tdf-detection-contacts-beneficiaries' ? (
            <div className='space-y-6'>
              <div>
                <h2 className='text-xl font-semibold leading-7 text-gray-900'>Bénéficiaires</h2>
                <p className='mt-1 max-w-2xl text-base leading-6 text-gray-600'>
                  La ou les personne(s) que nous allons contacter pour recevoir les accès à votre trésor. Il nous faut au
                  minimum une, et si possible plusieurs, manières de les contacter.
                </p>
              </div>

              <ul className='space-y-6 divide-y divide-solid'>
                {Array(beneficiaryCount)
                  .fill(0)
                  .map((_, index) => (
                    <Beneficiary index={index} key={`beneficiaryBox${index}`} />
                  ))}
              </ul>
              <button
                className={`${secondaryButtonStyles}`}
                onClick={(e) => {
                  e.preventDefault()
                  setBeneficiaryCount(beneficiaryCount + 1)
                }}>
                <PlusIcon className={`${buttonIconStyles}`} />
                Ajouter un bénéficiaire
              </button>
            </div>
          ) : (
            <div className='py-3'>
              <div className='text-lg'>
                <a
                  href='#'
                  className='text-indigo-600 font-semibold border-b border-b-indigo-600'
                  onClick={(e) => {
                    e.preventDefault()
                    alert(`Cette option n'est pas encore disponible.`)
                  }}>
                  Cliquez ici
                </a>{' '}
                pour télécharger le QR Code de transmission.
              </div>
              <p className='mt-1 max-w-2xl text-base leading-6 text-gray-600'>
                N'hésitez pas à l'imprimer en plusieurs exemplaires et à le placer à des endroits sur (chez le notaire, dans un
                dossier 'en cas de décès', chez des proches...).
              </p>
            </div>
          )}
        </div>
        <div>
          <button type='submit' className={`${primaryButtonStyles} mt-6`}>
            <CheckIcon className={`${buttonIconStyles}`} aria-hidden='true' />
            Valider
          </button>
          <p className='mt-2 max-w-2xl text-base leading-6 text-gray-600'>
            Quoi qu'il en soit, vous pourrez modifier ces choix plus tard.
          </p>
        </div>
        <input type='hidden' name='mode' value={selectedMode.mode} />
      </form>
    </div>
  )
}

type BeneficiaryProps = {
  index: number
}

function Beneficiary({ index }: BeneficiaryProps) {
  return (
    <li className='pt-5'>
      <div>
        <div className='text-lg font-semibold leading-7'>Bénéficiaire {index + 1}</div>
      </div>
      <div className='grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
        <div className='sm:col-span-4'>
          <label htmlFor='beneficiaryName' className='block text-base font-medium leading-6 text-gray-700'>
            Nom complet du bénéficiaire
          </label>
          <div className='mt-2'>
            <div className='flex shadow-sm ring-1 ring-inset ring-gray-300  focus-within:ring-inset sm:max-w-md border border-gray-200  focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
              <input
                type='text'
                autoFocus
                name='beneficiaryName'
                id='beneficiaryName'
                className='block w-full resize-none border-0 py-3  focus:ring-0 text-xl'
                placeholder='ex: Valentin Cognito'
              />
            </div>
          </div>
        </div>
        <div className='sm:col-span-4'>
          <label htmlFor='beneficiaryEmail' className='block text-base font-medium leading-6 text-gray-700'>
            Courrier électronique
          </label>
          <div className='mt-2'>
            <div className='flex shadow-sm ring-1 ring-inset ring-gray-300  focus-within:ring-inset sm:max-w-md border border-gray-200  focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
              <input
                type='email'
                name='beneficiaryEmail'
                id='beneficiaryEmail'
                className='block w-full resize-none border-0 py-3  focus:ring-0 text-xl'
                placeholder='ex: valentin@exemple.com'
              />
            </div>
          </div>
        </div>
        <div className='sm:col-span-4'>
          <label htmlFor='beneficiaryAddress' className='block text-base font-medium leading-6 text-gray-700'>
            Adresse postale
          </label>
          <div className='mt-2'>
            <div className='flex shadow-sm ring-1 ring-inset ring-gray-300  focus-within:ring-inset sm:max-w-md border border-gray-200  focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
              <textarea
                rows={3}
                name='beneficiaryAddress'
                id='beneficiaryAddress'
                autoComplete='beneficiaryAddress'
                className='block w-full resize-none border-0 py-3  focus:ring-0 text-xl'
                placeholder={`3 rue des Suisses 75014 Paris France`}
              />
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

type FamilyMemberViewProps = {
  steps: UploadFamilyPhoto & { 'upload-family-photo': 'annotating-photo' }
}

function FamilyMemberView({ steps }: FamilyMemberViewProps) {
  const faceMap = new Map<UUID, any>()

  steps.photos.forEach(({ faces, photoId }) =>
    faces
      .filter(({ stage }) => stage === 'done')
      .forEach((face) => {
        faceMap.set(face.faceId, { ...face, photoId })
      })
  )

  const faces = Array.from(faceMap.values())

  if (!faces.length) return null

  return (
    <>
      <div className='text-lg leading-5 mt-3 text-gray-500'>
        Voici un aperçu de votre famille, à partir de vos annotations:{' '}
      </div>
      <ul className='flex gap-2 mt-3 pt-3'>
        {faces.map((face) => (
          <li key={`doneface${face.faceId}`} className='text-gray-500 mr-2 mb-2 flex flex-col items-center'>
            <PhotoBadge faceId={face.faceId} photoId={face.photoId} className='' />
            <div className='max-w-[80px] truncate'>{face.stage === 'done' ? face.name : ''}</div>
          </li>
        ))}
      </ul>
    </>
  )
}
