import * as React from 'react'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import AdaptiveLayout from '../_components/layout/AdaptiveLayout'
import { UUID } from '../../domain'
import { SendIcon } from '../chat/ChatPage/SendIcon'
import { PhotoIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ArrowRightIcon } from '@heroicons/react/20/solid'
import { InlinePhotoUploadBtn } from '../_components/InlinePhotoUploadBtn'
import { FamilyMemberRelationship, traduireRelation } from '../bienvenue/step3-learnAboutUsersFamily/FamilyMemberRelationship'
import {
  buttonIconStyles,
  primaryButtonStyles,
  primaryGreenButtonStyles,
  secondaryButtonStyles,
  secondaryGreenButtonStyles,
  secondaryRedButtonStyles,
} from '../_components/Button'
import { PersonAutocomplete } from './PersonAutocomplete'

export type HomePageProps = {
  steps: GetUserName & UploadFirstPhoto & UploadFamilyPhoto & CreateFirstThread
}

export const HomePage = withBrowserBundle(({ steps }: HomePageProps) => {
  if (steps['get-user-name'] === 'pending') {
    return (
      <Wrapper steps={steps}>
        <GetUserName />
      </Wrapper>
    )
  }

  if (steps['upload-first-photo'] === 'pending') {
    return (
      <Wrapper steps={steps}>
        <UploadPhotoOfThemself />
      </Wrapper>
    )
  }

  if (steps['upload-first-photo'] === 'photo-uploaded') {
    return (
      <Wrapper steps={steps}>
        <ChoseOwnFaceInPhoto step={steps} />
      </Wrapper>
    )
  }

  if (steps['upload-family-photo'] === 'awaiting-upload') {
    return (
      <Wrapper steps={steps}>
        <UploadFamilyPhoto step={steps} />
      </Wrapper>
    )
  }

  if (steps['upload-family-photo'] === 'annotating-photo') {
    const faceMap = new Map<UUID, any>()

    steps.photos.forEach(({ faces, photoId }) =>
      faces
        .filter(({ stage }) => stage === 'done')
        .forEach((face) => {
          faceMap.set(face.faceId, { ...face, photoId })
        })
    )

    const faces = Array.from(faceMap.values())

    return (
      <Wrapper steps={steps}>
        {faces.length ? (
          <>
            <div className='text-lg leading-5 mt-3 text-gray-500'>
              Grace à vos annotations, voici déjà un aperçu de votre famille:{' '}
            </div>
            <ul className='flex gap-2 mt-3'>
              {faces.map((face) => (
                <li key={`doneface${face.faceId}`} className='text-gray-500 mr-2 mb-2 flex flex-col items-center'>
                  <PhotoBadge faceId={face.faceId} photoId={face.photoId} className='' />
                  <div className='max-w-[80px] truncate'>{face.stage === 'done' ? face.name : ''}</div>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <AnnotateFamilyPhoto step={steps} />
      </Wrapper>
    )
  }
  if (steps['create-first-thread'] === 'awaiting-input') {
    return (
      <Wrapper steps={steps}>
        <CreateFirstThread />
      </Wrapper>
    )
  }

  if (steps['create-first-thread'] === 'done') {
    return (
      <Wrapper steps={steps}>
        <FirstThreadStep step={steps} />
      </Wrapper>
    )
  }

  return <Wrapper steps={steps} />
})

function Wrapper({ steps, children }: HomePageProps & React.PropsWithChildren) {
  const UserName = () =>
    steps['get-user-name'] === 'done' ? (
      <span className='block text-indigo-600'>{steps.name}</span>
    ) : (
      <span className='block text-indigo-600'>illustre inconnu</span>
    )

  return (
    <AdaptiveLayout sidebarAccessible={false}>
      <div className='px-4 py-6 md:px-8 md:py-12'>
        <h2 className='text-3xl font-bold tracking-tight text-gray-900 md:text-4xl'>
          <span className='block'>Bienvenu sur Trésor de famille</span>
          <div>
            {steps['upload-first-photo'] === 'user-face-confirmed' ? (
              <div className='mt-2 inline-flex items-center'>
                <img
                  src='https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80'
                  // src={`/photo/${steps.photoId}/face/${steps.faceId}`}
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
    </AdaptiveLayout>
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
      photos: {
        photoId: UUID
        photoUrl: string
        faces: FamilyMemberPhotoFace[]
      }[]
    }

export type CreateFirstThread =
  | {
      'create-first-thread': 'awaiting-input'
    }
  | {
      'create-first-thread': 'done'
      threadId: UUID
      message: string
    }

function GetUserName() {
  return (
    <div className='pb-5'>
      <div className='text-xl  pt-3 text-gray-500'>Faisons connaissance ! Pour commencer, comment t'appelles-tu ?</div>
      <div className=' pt-2'>
        <form method='POST' className='relative'>
          <input type='hidden' name='action' value='submitPresentation' />
          <div className='overflow-hidden -ml-4 sm:ml-0 -mr-4 border border-gray-200 shadow-sm sm:max-w-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
            <label htmlFor='presentation' className='sr-only'>
              Nom complet
            </label>
            <input
              type='text'
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
        <p className={`mt-3 text-xl text-gray-500`}>Je te propose d'envoyer une photo de toi !</p>
        <InlinePhotoUploadBtn hiddenFields={{ action: 'userSendsPhotoOfThemself' }}>
          <span className='cursor-pointer inline-flex items-center mt-3 px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
            <PhotoIcon className={`${buttonIconStyles}`} aria-hidden='true' />
            Choisir la photo
          </span>
        </InlinePhotoUploadBtn>
      </div>
    </div>
  )
}

type ChoseOwnFaceInPhotoProps = {
  step: HomePageProps['steps'] & { 'upload-first-photo': 'photo-uploaded' }
}

export const ChoseOwnFaceInPhoto = ({ step }: ChoseOwnFaceInPhotoProps) => {
  const { photoId, photoUrl, faces } = step

  const UploadAnother = ({ secondary, className }: { secondary?: true; className?: string }) => (
    <InlinePhotoUploadBtn hiddenFields={{ action: 'userSendsPhotoOfThemself' }}>
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
      <div className='pb-5 py-3'>
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
        <UploadAnother secondary className='mt-10' />
      </div>
    )
  }

  // Case: multiple faces
  return (
    <div className='pb-5 py-3'>
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
      <UploadAnother secondary className='mt-10' />
    </div>
  )

  function Photo() {
    return (
      <div className='grid grid-cols-1 w-full mt-3'>
        <img src={photoUrl} className='max-w-full max-h-[50vh]' />
      </div>
    )
  }
}

function Paragraph({ children, className }: { className?: string } & React.PropsWithChildren) {
  return <div className={`text-gray-500 text-xl py-3 pb-2 ${className}`}>{children}</div>
}

type PhotoBadgeProps = {
  photoId: UUID
  faceId: UUID
  className?: string
}
const PhotoBadge = ({ photoId, className, faceId }: PhotoBadgeProps) => {
  return (
    <img
      src='https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80'
      // src={`/photo/${photoId}/face/${faceId}`}
      className={`inline-block cursor-pointer rounded-full h-14 w-14 bg-white ring-2 ring-white'
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
      <Paragraph>Maintenant, je te propose de présenter ta famille, à travers une ou plusieurs photo.</Paragraph>
      <div className='mt-4'>
        <InlinePhotoUploadBtn hiddenFields={{ action: 'userSendsPhotoOfFamily' }}>
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
        <p className={`mt-3 text-xl text-gray-500`}>Top ! Est-ce que vous voulez en ajouter d'autres ou passer à la suite ?</p>
        <InlinePhotoUploadBtn hiddenFields={{ action: 'userSendsPhotoOfFamily' }}>
          <span className='cursor-pointer inline-flex items-center mt-3 px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm text-indigo-600 bg-white hover:bg-indigo-500 hover:text-white ring-2 ring-indigo-600'>
            <PhotoIcon className='-ml-0.5 mr-2 h-6 w-6' aria-hidden='true' />
            Choisir une autre photo
          </span>
        </InlinePhotoUploadBtn>
        <form method='POST' className='relative mt-3'>
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
        <img src={photoUrl} className='max-w-full max-h-[50vh]' />
      </div>
    )
  }

  function UploadAnother({ secondary, className }: { secondary?: true; className?: string }) {
    return (
      <InlinePhotoUploadBtn hiddenFields={{ action: 'userSendsPhotoOfFamily' }}>
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
          <form method='POST' className='inline-block'>
            <input type='hidden' name='action' value='confirmOpenAIRelationship' />
            <input type='hidden' name='personId' value={personId} />
            <input type='hidden' name='stringifiedRelationship' value={JSON.stringify(face.relationship)} />
            <button type='submit' className={`${primaryGreenButtonStyles}`}>
              <CheckIcon className={`${buttonIconStyles}`} aria-hidden='true' />
              C'est bien ça
            </button>
          </form>

          <button className={`${secondaryRedButtonStyles} mt-3`} onClick={() => toggleConfirmBox(true)}>
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
      <div className={`divide-y divide divide-dashed divide-gray-400`}>
        <div className='pt-3' /> {/* To force a divider */}
        <div>
          <div className={`px-3 py-2 text-xl text-gray-500`}>
            <p className='py-1'>
              Dans trésor de famille, il est également possible de transmettre des souvenirs sous forme écrite.
            </p>
            <p className='py-1'>
              Il peuvent être très courts (une phrase ?) ou le début d'une histoire familiale plus fournie.
            </p>
            <p className='py-1'>Je te propose d'écrire ici ton premier fil de souvenir.</p>
          </div>
          <div className='px-3'>
            <form method='POST' className='relative sm:max-w-lg'>
              <input type='hidden' name='action' defaultValue='startFirstThread' />
              <div className='pt-2 overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
                {/* <label htmlFor='title' className='sr-only'>
                  Title
                </label>
                <input
                  type='text'
                  name='title'
                  id='title'
                  className='block w-full border-0 pt-2.5 text-lg font-medium placeholder:text-gray-400 focus:ring-0'
                  placeholder='Title'
                /> */}
                <label htmlFor='message' className='sr-only'>
                  Je me souviens...
                </label>
                <textarea
                  rows={4}
                  name='message'
                  id='message'
                  className='block w-full resize-none border-0 py-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-lg sm:text-base sm:leading-6'
                  placeholder='Je me souviens...'
                  defaultValue={''}
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
                  <div className='flex'>
                    {/* <button
                        type='button'
                        className='group -my-2 -ml-2 inline-flex items-center rounded-full px-3 py-2 text-left text-gray-400'>
                        <PhotoIcon className='-ml-1 mr-2 h-5 w-5 group-hover:text-gray-500' aria-hidden='true' />
                        <span className='text-sm italic text-gray-500 group-hover:text-gray-600'>Ajouter une photo</span>
                      </button> */}
                  </div>
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
            <ul className='mt-2 px-1 text-gray-500 text-base list-inside list-disc'>
              Exemples:
              <li>Mon lieux de vacances quand j'étais enfant</li>
              <li>Plus ancien souvenir</li>
              <li>Le sport que j'ai pratiqué</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

type FirstThreadStepProps = {
  step: CreateFirstThread & { 'create-first-thread': 'done' }
}
export const FirstThreadStep = ({ step }: FirstThreadStepProps) => {
  const { message } = step

  return (
    <div className=''>
      <Paragraph className={``}>
        Bravo! Maintenant que vous avez lancé le fil de souvenir, vous pouvez le compléter avec un titre, des propos
        supplémentaires, des photos, etc.
      </Paragraph>
      <form method='POST' className='relative sm:max-w-lg'>
        <input type='hidden' name='action' defaultValue='startFirstThread' />
        <div className='pt-2 overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
          <label htmlFor='title' className='sr-only'>
            Titre
          </label>
          <input
            type='text'
            name='title'
            id='title'
            className='block w-full border-0 pt-2.5 text-xl sm:text-lg font-medium placeholder:text-gray-400 focus:ring-0'
            placeholder='Titre'
          />
          <div className='divide divide-y divide-solid'>
            <p className='text-gray-900 text-lg sm:text-base sm:leading-6 px-3 py-2'>{message}</p>
            <div className='h-2' />
          </div>
          <label htmlFor='message' className='sr-only'>
            ...
          </label>
          <textarea
            rows={2}
            name='message'
            id='message'
            className='block w-full resize-none border-0 py-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-lg sm:text-base sm:leading-6'
            placeholder='...'
            defaultValue={''}
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
            <div className='flex'>
              <button
                type='button'
                className='group -my-2 -ml-2 inline-flex items-center rounded-full px-3 py-2 text-left text-gray-400'>
                <PhotoIcon className='-ml-1 mr-2 h-5 w-5 group-hover:text-gray-500' aria-hidden='true' />
                <span className='text-sm italic text-gray-500 group-hover:text-gray-600'>Ajouter une photo</span>
              </button>
            </div>
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
    </div>
  )
}
