import * as React from 'react'

import { UUID } from '../../domain'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../_components/layout/AppLayout'
import { SendIcon } from '../chat/ChatPage/SendIcon'
import { PhotoIcon } from '@heroicons/react/24/outline'
import { InlinePhotoUploadBtn } from '../_components/InlinePhotoUploadBtn'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { PersonAutocomplete } from './step3-learnAboutUsersFamily/PersonAutocomplete'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

type OpenAIMessage = {
  role: 'assistant' | 'user' | 'system'
  content: string | null
  function_call?: {
    name: string
    arguments: string
  }
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
      stage: 'relationship-in-progress'
      messages: OpenAIMessage[]
      name: string
      personId: UUID
    }
  | {
      stage: 'done'
      messages: OpenAIMessage[]
      result: {
        personId: UUID
        name: string
        relationship?: {}
      }
    }
)

type OnboardingStep =
  | ({
      goal: 'get-user-name'
    } & ({ stage: 'awaiting-name' } | { stage: 'done'; name: string; personId: UUID }))
  | ({ goal: 'upload-first-photo' } & (
      | { stage: 'waiting-upload' }
      | {
          stage: 'photo-uploaded'
          photoId: UUID
          photoUrl: string
          faces: {
            faceId: UUID
          }[]
        }
      | {
          stage: 'face-confirmed'
          photoId: UUID
          photoUrl: string
          confirmedFaceId: UUID
          faces: {
            faceId: UUID
          }[]
        }
    ))
  | ({ goal: 'upload-family-photo' } & (
      | { stage: 'awaiting-upload' }
      | {
          stage: 'annotating-photo'
          photos: {
            photoId: UUID
            photoUrl: string
            faces: FamilyMemberPhotoFace[]
          }[]
        }
    ))

export type BienvenuePageProps = {
  userId: UUID
  steps: OnboardingStep[]
}

export const BienvenuePage = withBrowserBundle(({ userId, steps }: BienvenuePageProps) => {
  const bottomOfPageRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomOfPageRef.current?.scrollIntoView()
  }, [])

  return (
    <AppLayout hideNavBarItems={true}>
      <div className='bg-white '>
        <div className='max-w-7xl'>
          <div className='pt-10 px-4'>
            <p className='mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl'>Bienvenue!</p>
          </div>
        </div>
        <div className='divide-y divide-dashed divide-gray-400'>
          {steps?.map((step, stepIndex) => {
            const { goal, stage } = step
            if (goal === 'get-user-name') {
              return (
                <div className='pb-5' key={`step_${goal}_${stepIndex}`}>
                  <div className='text-xl px-4 pt-3 text-gray-500'>
                    Faisons connaissance ! Pour commencer, comment t'appelles-tu ?
                  </div>
                  {stage === 'done' ? (
                    <div className='px-4 pt-3 text-xl text-gray-500'>
                      Bienvenue <span className='text-black'>{step.name}</span> ! Je suis ravi de faire ta connaissance.
                    </div>
                  ) : (
                    <div className='px-4 pt-2'>
                      <form method='POST' className='relative'>
                        <input type='hidden' name='action' value='submitPresentation' />
                        <div className='overflow-hidden -ml-4 border border-gray-200 shadow-sm sm:max-w-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
                          <label htmlFor='presentation' className='sr-only'>
                            Nom complet
                          </label>
                          <input
                            type='text'
                            name='presentation'
                            className='block w-full resize-none border-0 py-3 px-4 focus:ring-0 text-xl'
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
                          className='inline-flex items-center mt-3 px-3 py-1.5 border border-transparent sm:sm:text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                          <SendIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
                          Envoyer
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )
            }

            if (goal === 'upload-first-photo') {
              if (stage === 'waiting-upload') {
                return (
                  <div className='pb-5' key={`step_${goal}_${stepIndex}`}>
                    <div className='py-3 px-4'>
                      <p className={`mt-3 text-xl text-gray-500`}>Je te propose d'envoyer une photo de toi !</p>
                      <InlinePhotoUploadBtn hiddenFields={{ action: 'userSendsPhotoOfThemself' }}>
                        <span className='cursor-pointer inline-flex items-center mt-3 px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                          <PhotoIcon className='-ml-0.5 mr-2 h-6 w-6' aria-hidden='true' />
                          Choisir la photo
                        </span>
                      </InlinePhotoUploadBtn>
                    </div>
                  </div>
                )
              } else if (stage === 'photo-uploaded' || stage === 'face-confirmed') {
                const { photoId, photoUrl, faces } = step

                if (!faces || faces.length === 0) {
                  return (
                    <div className='pb-5' key={`step_${goal}_${stepIndex}`}>
                      <div className='py-3 px-4'>
                        <p className={`mt-3 text-xl text-gray-500`}>Je te propose d'envoyer une photo de toi !</p>

                        <div className='grid grid-cols-1 w-full mt-3'>
                          <img src={photoUrl} className='max-w-full max-h-[50vh]' />
                        </div>

                        <p className={`mt-3 text-xl text-gray-500`}>
                          Aucun visage n'a été détecté sur cette photo. Merci d'en choisir une autre.
                        </p>
                        <InlinePhotoUploadBtn hiddenFields={{ action: 'userSendsPhotoOfThemself' }}>
                          <span className='cursor-pointer inline-flex items-center mt-3 px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                            <PhotoIcon className='-ml-0.5 mr-2 h-6 w-6' aria-hidden='true' />
                            Choisir la photo
                          </span>
                        </InlinePhotoUploadBtn>
                      </div>
                    </div>
                  )
                }

                // Case: single face
                if (faces.length === 1) {
                  return (
                    <div className='pb-5' key={`step_${goal}_${stepIndex}`}>
                      <div className='py-3 px-4'>
                        <p className={`mt-3 text-xl text-gray-500`}>Je te propose d'envoyer une photo de toi !</p>

                        <div className='grid grid-cols-1 w-full mt-3'>
                          <img src={photoUrl} className='max-w-full max-h-[50vh]' />
                        </div>
                        <div className=''>
                          <PhotoBadge photoId={photoId} faceId={faces[0].faceId} className='m-2' />
                          {stage === 'face-confirmed' ? (
                            <div className='inline-flex items-center py-1 px-2 pl-7 rounded-full bg-white text-sm relative font-semibold text-green-600 shadow-sm ring-2 ring-green-600 ring-inset'>
                              <CheckIcon className='absolute left-2 h-4 w-4' aria-hidden='true' />
                              C'est bien moi !
                            </div>
                          ) : (
                            <form method='POST' className='inline-block ml-2'>
                              <input type='hidden' name='action' value='confirmFaceIsUser' />
                              <input type='hidden' name='photoId' value={photoId} />
                              <input type='hidden' name='faceId' value={faces[0].faceId} />
                              <button
                                type='submit'
                                className='inline-flex items-center py-1 px-2 pl-7 rounded-full bg-white text-sm relative hover:font-semibold text-green-600 shadow-sm ring-1 hover:ring-2 ring-green-600 ring-inset'>
                                <CheckIcon className='absolute left-2 h-4 w-4' aria-hidden='true' />
                                C'est bien moi !
                              </button>
                            </form>
                          )}
                        </div>
                        {stage === 'face-confirmed' ? (
                          <div className='text-gray-500 text-xl py-3 pb-2'>
                            Heureux de pouvoir mettre un visage sur un nom !
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                }

                return (
                  <div className='pb-5' key={`step_${goal}_${stepIndex}`}>
                    <div className='py-3 px-4'>
                      <p className={`mt-3 text-xl text-gray-500`}>Je te propose d'envoyer une photo de toi !</p>

                      <div className='grid grid-cols-1 w-full mt-3'>
                        <img src={photoUrl} className='max-w-full max-h-[50vh]' />
                      </div>
                      <div className='text-gray-500 text-lg py-3 pb-2'>
                        Plusieurs visages ont été détectés sur cette photo, quel est le tien ?
                      </div>
                      <div className='mx-auto'>
                        {stage === 'face-confirmed'
                          ? faces.map((face) => (
                              <PhotoBadge
                                key={`confirmedFaces${face.faceId}`}
                                photoId={photoId}
                                faceId={face.faceId}
                                className={`m-2 hover:cursor-default ${
                                  face.faceId === step.confirmedFaceId
                                    ? 'ring-4 ring-green-500 w-[80px] h-[80px]'
                                    : 'mix-blend-luminosity'
                                }`}
                              />
                            ))
                          : faces.map((face) => (
                              <form method='POST' key={`confirmFace${face.faceId}`} className='inline-block ml-2'>
                                <input type='hidden' name='action' value='confirmFaceIsUser' />
                                <input type='hidden' name='photoId' value={photoId} />
                                <input type='hidden' name='faceId' value={face.faceId} />
                                <button type='submit' className=''>
                                  <PhotoBadge
                                    photoId={photoId}
                                    faceId={face.faceId}
                                    className='m-2 hover:ring-4 hover:ring-green-500'
                                  />
                                </button>
                              </form>
                            ))}
                      </div>
                      {stage === 'face-confirmed' ? (
                        <div className='text-gray-500 text-lg py-3 pb-2'>Heureux de pouvoir mettre un visage sur un nom !</div>
                      ) : null}
                    </div>
                  </div>
                )
              }
            }

            if (goal === 'upload-family-photo') {
              if (stage === 'awaiting-upload') {
                return (
                  <div className='pb-5' key={`step_${goal}_${stepIndex}`}>
                    <div className='py-3 px-4'>
                      <p className={`mt-3 text-xl text-gray-500`}>
                        Maintenant, je te propose de présenter ta famille, à travers une ou plusieurs photo.
                      </p>
                      <InlinePhotoUploadBtn hiddenFields={{ action: 'userSendsPhotoOfFamily' }}>
                        <span className='cursor-pointer inline-flex items-center mt-3 px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                          <PhotoIcon className='-ml-0.5 mr-2 h-6 w-6' aria-hidden='true' />
                          Choisir une photo avec des membres de ma famille
                        </span>
                      </InlinePhotoUploadBtn>
                    </div>
                  </div>
                )
              }

              if (stage === 'annotating-photo') {
                const { photos } = step

                return (
                  <div className='pb-5' key={`step_${goal}_${stepIndex}`}>
                    <div className='py-3 px-4'>
                      <p className={`mt-3 text-xl text-gray-500`}>
                        Maintenant, je te propose de présenter ta famille, à travers une ou plusieurs photo.
                      </p>
                    </div>
                    {photos.map((photo, photoIndex) => {
                      const isLastPhoto = photoIndex === photos.length - 1
                      const { faces, photoUrl } = photo

                      if (!faces || faces.length === 0) {
                        return (
                          <div className='pb-5' key={`step_${goal}_${stepIndex}_${photoIndex}`}>
                            <div className='py-3 px-4'>
                              <div className='grid grid-cols-1 w-full mt-3'>
                                <img src={photoUrl} className='max-w-full max-h-[10vh] opacity-60' />
                              </div>
                              {photoIndex === photos.length - 1 ? (
                                <>
                                  <p className={`mt-3 text-xl text-gray-500`}>
                                    Aucun visage n'a été détecté sur cette photo. Merci d'en choisir une autre.
                                  </p>
                                  <InlinePhotoUploadBtn hiddenFields={{ action: 'userSendsPhotoOfFamily' }}>
                                    <span className='cursor-pointer inline-flex items-center mt-3 px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                                      <PhotoIcon className='-ml-0.5 mr-2 h-6 w-6' aria-hidden='true' />
                                      Choisir une photo avec des membres de ma famille
                                    </span>
                                  </InlinePhotoUploadBtn>
                                </>
                              ) : (
                                <p className={`mt-3 text-md italic text-gray-500`}>
                                  Aucun visage n'a été détecté sur cette photo.
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      }

                      const faceInProgress = faces.find(
                        (face): face is FamilyMemberPhotoFace & { stage: 'awaiting-name' | 'relationship-in-progress' } =>
                          face.stage === 'awaiting-name' || face.stage === 'relationship-in-progress'
                      )

                      return (
                        <div className='pb-5' key={`step_${goal}_${stepIndex}_${photoIndex}`}>
                          <div className='py-3 px-4'>
                            <div className='grid grid-cols-1 w-full mt-3'>
                              <img src={photoUrl} className='max-w-full max-h-[50vh]' />
                            </div>

                            <div className='grid grid-cols-8 auto-cols-auto justify-items-stretch'>
                              <div className='col-span-8'>
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
                                        <span className='text-gray-500'>{face.result.name}</span>
                                      </div>
                                    )
                                  })}
                              </div>
                              <div className='w-24'>
                                {faceInProgress ? (
                                  <div className='' key={`annotatingFamilyFaces${faceInProgress.faceId}`}>
                                    <PhotoBadge
                                      photoId={photo.photoId}
                                      faceId={faceInProgress.faceId}
                                      className={`m-2 h-[80px] w-[80px] hover:cursor-default`}
                                    />
                                  </div>
                                ) : null}

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
                              </div>
                              <div className='col-span-7 max-w-md'>
                                {faceInProgress ? (
                                  faceInProgress.stage === 'awaiting-name' ? (
                                    <FamilyMemberNameForm faceId={faceInProgress.faceId} photoId={photo.photoId} />
                                  ) : (
                                    <FamilyMemberRelationshipForm face={faceInProgress} photoId={photo.photoId} />
                                  )
                                ) : null}
                              </div>
                              <div className='col-span-8'>
                                {faces
                                  .filter(
                                    (face): face is FamilyMemberPhotoFace & { stage: 'ignored' } => face.stage === 'ignored'
                                  )
                                  .map((face) => {
                                    return (
                                      <div key={`ignored_face_${face.faceId}`}>
                                        <PhotoBadge
                                          key={`annotatingFamilyFaces${face.faceId}${photo.photoId}`}
                                          photoId={photo.photoId}
                                          faceId={face.faceId}
                                          className={`m-2 hover:cursor-default mix-blend-luminosity`}
                                        />
                                        <span className='text-gray-500 italic'>Visage ignoré</span>
                                      </div>
                                    )
                                  })}
                              </div>
                            </div>
                            {isLastPhoto && faces.every((face) => face.stage === 'done' || face.stage === 'ignored') ? (
                              <>
                                <p className={`mt-3 text-xl text-gray-500`}>
                                  Top ! Est-ce que tu as d'autres photos pour présenter ta famille ?
                                </p>
                                <InlinePhotoUploadBtn hiddenFields={{ action: 'userSendsPhotoOfFamily' }}>
                                  <span className='cursor-pointer inline-flex items-center mt-3 px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                                    <PhotoIcon className='-ml-0.5 mr-2 h-6 w-6' aria-hidden='true' />
                                    Choisir une autre photo
                                  </span>
                                </InlinePhotoUploadBtn>
                              </>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              }
            }
          })}
          <div ref={bottomOfPageRef} />
        </div>
      </div>
    </AppLayout>
  )
})

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
      className={`inline-block cursor-pointer rounded-full h-14 w-14 bg-white ring-2 ring-white'
      } ${className || ''}`}
    />
  )
}

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
      <p className={`mt-3 text-xl text-gray-500 mb-2`}>Quel est le nom de cette personne ?</p>
      <PersonAutocomplete onPersonSelected={handlePersonSelected} />
      <form method='POST' ref={formRef}>
        <input type='hidden' name='action' value='submitFamilyMemberName' />
        <input type='hidden' name='faceId' value={faceId} />
        <input type='hidden' name='photoId' value={photoId} />
        <input type='hidden' name='newFamilyMemberName' value='' />
        <input type='hidden' name='existingFamilyMemberId' value='' />

        <button
          type='submit'
          className='inline-flex items-center mt-3 px-3 py-1.5 border border-transparent sm:sm:text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
          <SendIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
          Envoyer
        </button>
      </form>
      <form method='POST' className='relative'>
        <input type='hidden' name='action' value='ignoreFamilyMemberFaceInPhoto' />
        <input type='hidden' name='faceId' value={faceId} />
        <input type='hidden' name='photoId' value={photoId} />
        <button
          type='submit'
          className='inline-flex items-center px-3 py-1.5 border border-transparent sm:sm:text-xs font-medium rounded-full shadow-sm hover:font-semibold text-red-600 ring-1 hover:ring-2 ring-red-600 ring-inset'>
          <XMarkIcon className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
          Ignorer ce visage
        </button>
      </form>
    </>
  )
}

type FamilyMemberRelationshipFormProps = {
  face: FamilyMemberPhotoFace & { stage: 'relationship-in-progress' }
  photoId: UUID
}

const FamilyMemberRelationshipForm = ({ face, photoId }: FamilyMemberRelationshipFormProps) => {
  const { personId, faceId, name, messages } = face
  return (
    <div className='text-xl'>
      <p className={`mt-3 text-gray-500 mb-2`}>
        Qui est <span className='text-black'>{name}</span> ?
      </p>
      <div className='px-3'>
        {messages
          .filter(({ role, function_call }) => role === 'user' || (role === 'assistant' && !!function_call))
          .map(({ role, content, function_call }, index) => {
            return (
              <p
                key={`family_relation_message${face.faceId}${index}`}
                className={`mt-3 ${role === 'assistant' ? 'text-gray-500' : ''}`}>
                {content || <pre>{JSON.stringify(function_call, null, 2)}</pre>}
              </p>
            )
          })}
      </div>
      <form method='POST' className='relative -ml-3'>
        <input type='hidden' name='action' value='submitRelationship' />
        <input type='hidden' name='faceId' value={faceId} />
        <input type='hidden' name='personId' value={personId} />
        <input type='hidden' name='photoId' value={photoId} />
        <div className='overflow-hidden border border-gray-200 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
          <label htmlFor='userAnswer' className='sr-only'>
            Par exemple: mon père, l'épouse de...
          </label>
          <textarea
            rows={2}
            name='userAnswer'
            id='userAnswer'
            className='block w-full resize-none border-0 py-3 px-4 focus:ring-0 text-xl'
            placeholder="Par exemple: mon père, l'épouse de..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                // @ts-ignore
                e.target.form.submit()
              }
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
  )
}
