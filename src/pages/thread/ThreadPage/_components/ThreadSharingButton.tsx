import { RadioGroup } from '@headlessui/react'
import { LockClosedIcon, UsersIcon } from '@heroicons/react/20/solid'
import { CheckCircleIcon, DocumentDuplicateIcon, PlusIcon } from '@heroicons/react/24/outline'
import classNames from 'classnames'
import React, { useEffect, useMemo, useState } from 'react'
import { FamilyId } from '../../../../domain/FamilyId.js'
import {
  buttonIconStyles,
  linkStyles,
  primaryButtonStyles,
  secondaryButtonStyles,
  smallButtonIconStyles,
} from '../../../_components/Button.js'
import { TDFModal } from '../../../_components/TDFModal.js'
import { Session, useLoggedInSession } from '../../../_components/SessionContext.js'

type ThreadSharingButtonProps = {
  familyId: FamilyId
  sharedWithFamilyIds?: FamilyId[]
  isAuthor: boolean
}

type Family = ReturnType<typeof useLoggedInSession>['userFamilies'][number]

export function ThreadSharingButton({ familyId, sharedWithFamilyIds, isAuthor }: ThreadSharingButtonProps) {
  const session = useLoggedInSession()
  const [isFamilyModalOpen, openFamilyModal] = useState<boolean>(false)
  const [isShareCodeModalOpen, openShareCodeModal] = useState<boolean>(false)
  const [isNewFamilyModalOpen, openNewFamilyModal] = useState<boolean>(false)

  const [latestUserFamilies, setLatestUserFamilies] = useState(session.userFamilies)

  const userSpace = session.userFamilies.find((f) => f.isUserSpace)

  // const currentFamily = useMemo(() => latestUserFamilies.find((f) => f.familyId === familyId), [latestUserFamilies, familyId])

  // if (!currentFamily) {
  //   return null
  // }

  return (
    <>
      {sharedWithFamilyIds && (
        <ShareWithMultipleFamilyModal
          onNewFamily={() => {
            openFamilyModal(false)
            openNewFamilyModal(true)
          }}
          onClose={() => openFamilyModal(false)}
          currentFamilyIds={sharedWithFamilyIds}
          isOpen={isFamilyModalOpen}
          latestUserFamilies={latestUserFamilies}
        />
      )}
      {/* <ShareWithFamilyModal
        onNewFamily={() => {
          openFamilyModal(false)
          openNewFamilyModal(true)
        }}
        onClose={() => openFamilyModal(false)}
        currentFamilyId={currentFamily.familyId}
        isOpen={isFamilyModalOpen}
        latestUserFamilies={latestUserFamilies}
      /> */}
      {/* <ShareCodeModal
        isOpen={isShareCodeModalOpen}
        currentFamily={currentFamily}
        onClose={() => openShareCodeModal(false)}
        onChangeFamily={() => openFamilyModal(true)}
      /> */}
      <CreateNewFamilyModal
        isOpen={isNewFamilyModalOpen}
        onClose={() => openNewFamilyModal(false)}
        setLatestUserFamilies={setLatestUserFamilies}
        onOpenShareWithFamilyModal={() => openFamilyModal(true)}
      />
      <div className='w-full'>
        {sharedWithFamilyIds?.length ? (
          <>
            <span className='text-gray-500 mr-2'>Partagé avec les membres de</span>
            <ul className='inline'>
              {sharedWithFamilyIds.map((familyId) => {
                const family = latestUserFamilies.find((f) => f.familyId === familyId)

                if (!family) return null

                if (sharedWithFamilyIds.length > 1 && family.isUserSpace) {
                  return null
                }

                return (
                  <li className='inline' key={`family_badge_${familyId}`}>
                    <button
                      onClick={() => {
                        if (isAuthor) {
                          openFamilyModal(true)
                        }
                      }}
                      className={`px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm ring-inset ring-2 ${
                        isAuthor ? 'hover:bg-white hover:ring-4' : 'cursor-default'
                      } ${family.color} ring-2`}>
                      {family.familyName}
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        ) : (
          <div className='flex items-center gap-2'>
            <span className='text-gray-500 mr-2 inline-flex items-center'>
              <LockClosedIcon className='h-4 w-4 mr-1' />
              Cette anecdote n'est pas encore partagée.
            </span>
            <button
              className={`${primaryButtonStyles}`}
              onClick={() => (latestUserFamilies.length > 1 ? openFamilyModal(true) : openNewFamilyModal(true))}>
              Partager
            </button>
          </div>
        )}
      </div>
    </>
  )
}

type CreateNewFamilyModalProps = {
  isOpen: boolean
  onClose: () => unknown
  onOpenShareWithFamilyModal: () => unknown
  setLatestUserFamilies: (families: Family[]) => unknown
}

function CreateNewFamilyModal({
  isOpen,
  onClose,
  onOpenShareWithFamilyModal,
  setLatestUserFamilies,
}: CreateNewFamilyModalProps) {
  const [isFamilyCreationSuccess, setFamilySuccess] = useState<boolean>(false)
  const session = useLoggedInSession()

  return (
    <TDFModal
      title='Partage'
      isOpen={isOpen}
      close={() => {
        onClose()
        setFamilySuccess(false)
      }}>
      <div className='border-b border-gray-300 pb-6'>
        <p className='mt-1 max-w-full overflow-hidden md:max-w-xl text-sm leading-6 text-gray-600'>
          Que ça soit pour partager vos souvenirs <b>tout de suite</b> ou bien avoir un <b>coup de main</b> pour ressortir les
          archives familiales...
          <b>partager</b> nos trésors <b>en famille</b>, c'est plus facile et convivial !
        </p>
        <div className='mt-5 max-w-full overflow-hidden md:max-w-xl text-sm leading-6 text-gray-600'>
          Pour partager
          <ul className=' text-gray-500 py-1'>
            <li className='flex items-center py-2'>
              <CheckCircleIcon className='shrink-0 h-6 w-6 mr-2 text-green-600' />
              <div className='flex-1'>Vous créez une famille sur cette page,</div>
            </li>
            <li className='flex items-center py-2'>
              <CheckCircleIcon className='shrink-0 h-6 w-6 mr-2 text-green-600' />
              <div className='flex-1'>Vous invitez d'autres personnes grace à un lien spécial,</div>
            </li>
            <li className='flex py-2'>
              <CheckCircleIcon className='shrink-0 h-6 w-6 mr-2 text-green-600' />
              <div className='flex-1'>
                Vous et les membres de la famille ajoutez du contenu. Celui-ci sera immédiatement accessible aux autres membres
                de la famille.
              </div>
            </li>
          </ul>
        </div>
        <div className='rounded-md bg-yellow-50 p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <LockClosedIcon className='h-5 w-5 text-yellow-400' aria-hidden='true' />
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-yellow-800'>
                Les contenus qui ne sont pas explicitement partagés, restent confidentiels.
              </h3>
            </div>
          </div>
        </div>
      </div>
      <div className='pt-6'>
        <div>Créer une nouvelle famille</div>
        {isFamilyCreationSuccess ? (
          <div className='rounded-md bg-green-50 p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <CheckCircleIcon className='h-5 w-5 text-green-400' aria-hidden='true' />
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-green-800'>Votre nouvelle famille a bien été créée !</h3>
                <div className='mt-2 text-sm text-green-700'>
                  <p>
                    Vous la trouverez dans le menu{' '}
                    <button
                      className='font-bold'
                      onClick={() => {
                        onClose()
                        setFamilySuccess(false)
                        onOpenShareWithFamilyModal()
                      }}>
                      Partager
                    </button>{' '}
                    de toutes les anecdotes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form
            method='POST'
            onSubmit={async (e) => {
              e.preventDefault()

              // @ts-ignore
              const familyName = e.target.familyName.value
              // @ts-ignore
              const about = e.target.about.value

              if (!familyName || !familyName.trim().length) {
                alert('Il est obligatoire de donner un nom à la famille.')
                return
              }

              try {
                const newUserFamilies = await createNewFamily({ familyName, about })
                setLatestUserFamilies(newUserFamilies)

                // @ts-ignore
                e.target.reset()

                setFamilySuccess(true)
              } catch (error) {
                console.error('La nouvelle famille na pas pu être créée.', error)
                alert('Échec de la création de nouvelle famille.')
              }
            }}>
            <div className='mt-4'>
              <label htmlFor='familyName' className='block text-sm font-medium leading-6 text-gray-900 cursor-pointer'>
                Nommez votre famille <span className='text-red-600 font-bold'>*</span>
              </label>
              <div className='mt-2'>
                <div className='flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 max-w-lg'>
                  <input
                    type='text'
                    name='familyName'
                    id='familyName'
                    className='block flex-1 border-0 bg-transparent py-1.5 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6'
                    placeholder={`ex: Famille ${session.userName}`}
                  />
                </div>
              </div>
            </div>
            <div className='mt-4 max-w-lg'>
              <label htmlFor='about' className='block text-sm font-medium leading-6 text-gray-900 cursor-pointer'>
                A propos
              </label>
              <div className='mt-2'>
                <textarea
                  id='about'
                  name='about'
                  rows={2}
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  placeholder={`ex: Les descendants de ${session.userName} et leurs conjoints.`}
                  defaultValue={''}
                />
              </div>
              <p className='mt-2 text-sm leading-6 text-gray-600'>
                Décrivez en quelques mots qui sont les personnes de cette famille.
              </p>
            </div>

            <input type='hidden' name='action' value='createNewFamily' />
            <button type='submit' className={`${primaryButtonStyles} mt-6`}>
              Créer cette famille
            </button>
          </form>
        )}
      </div>
    </TDFModal>
  )
}

// type ShareWithFamilyModalProps = {
//   isOpen: boolean
//   onClose: () => unknown
//   onNewFamily: () => unknown
//   currentFamilyId: FamilyId
//   latestUserFamilies: Family[]
// }

// function ShareWithFamilyModal({
//   isOpen,
//   onClose,
//   onNewFamily,
//   currentFamilyId,
//   latestUserFamilies,
// }: ShareWithFamilyModalProps) {
//   const currentFamily: Family | undefined = useMemo(() => {
//     return latestUserFamilies.find((fam) => fam.familyId === currentFamilyId)
//   }, [latestUserFamilies, currentFamilyId])
//   const [selectedFamily, setSelectedFamily] = useState<Family | undefined>(currentFamily)

//   return (
//     <TDFModal
//       title='Choisissez la famille avec laquelle vous voulez partager cette histoire'
//       isOpen={isOpen}
//       close={() => {
//         setSelectedFamily(currentFamily)
//         onClose()
//       }}>
//       <form method='POST'>
//         <input type='hidden' name='action' value='shareWithFamily' />
//         <input type='hidden' name='familyId' value={selectedFamily?.familyId} />
//         <div>
//           <RadioGroup name='family' value={selectedFamily} onChange={setSelectedFamily}>
//             <RadioGroup.Label className='sr-only'>Privacy setting</RadioGroup.Label>
//             <div className='-space-y-px rounded-md bg-white mt-8'>
//               {latestUserFamilies.map((family, familyIndex) => (
//                 <RadioGroup.Option
//                   key={family.familyId}
//                   value={family}
//                   className={({ checked }) =>
//                     classNames(
//                       familyIndex === 0 ? 'rounded-tl-md rounded-tr-md' : '',
//                       familyIndex === latestUserFamilies.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
//                       checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200',
//                       'relative flex cursor-pointer border p-4 focus:outline-none'
//                     )
//                   }>
//                   {({ active, checked }) => (
//                     <>
//                       <span
//                         className={classNames(
//                           checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300',
//                           active ? 'ring-2 ring-offset-2 ring-indigo-600' : '',
//                           'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-full border flex items-center justify-center'
//                         )}
//                         aria-hidden='true'>
//                         <span className='rounded-full bg-white w-1.5 h-1.5' />
//                       </span>
//                       <span className='ml-3 flex flex-col'>
//                         {family.isUserSpace ? (
//                           <RadioGroup.Label
//                             as='span'
//                             className={classNames(
//                               checked ? 'text-indigo-900' : 'text-gray-900',
//                               'inline-flex justify-items-start items-center text-sm font-medium '
//                             )}>
//                             <LockClosedIcon className='h-4 w-4 mr-1' />
//                             {family.familyName}
//                           </RadioGroup.Label>
//                         ) : (
//                           <RadioGroup.Label
//                             as='span'
//                             className={classNames(
//                               checked ? 'text-indigo-900' : 'text-gray-900',
//                               'inline-flex justify-items-start items-center text-sm font-medium'
//                             )}>
//                             <UsersIcon className='h-4 w-4 mr-1' />
//                             {family.familyName}
//                           </RadioGroup.Label>
//                         )}
//                         {family.isUserSpace ? (
//                           <RadioGroup.Description
//                             as='span'
//                             className={classNames(checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm')}>
//                             Cette anecdote reste confidentielle et vous seul pouvez y accéder.
//                           </RadioGroup.Description>
//                         ) : (
//                           <RadioGroup.Description
//                             as='span'
//                             className={classNames(checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm')}>
//                             {family.about}
//                           </RadioGroup.Description>
//                         )}
//                       </span>
//                     </>
//                   )}
//                 </RadioGroup.Option>
//               ))}
//             </div>
//           </RadioGroup>
//         </div>
//         <button
//           onClick={(e) => {
//             e.preventDefault()
//             onNewFamily()
//           }}
//           className={`mt-3 text-sm ${linkStyles}`}>
//           <PlusIcon className={`${buttonIconStyles}`} />
//           Nouvelle famille
//         </button>
//         <div className='mt-6'>
//           <button type='submit' className={`mb-4 ${primaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
//             Valider
//           </button>
//           <button
//             type='reset'
//             onClick={onClose}
//             className={`mb-4 ${secondaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
//             Annuler
//           </button>
//         </div>
//       </form>
//     </TDFModal>
//   )
// }

const createNewFamily = async ({
  familyName,
  about,
}: {
  familyName: string
  about: string
}): Promise<(Session & { isLoggedIn: true })['userFamilies']> => {
  const response = await fetch(`/share.html`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ familyName, about, action: 'createNewFamilyClientSide' }),
  })

  if (response.ok && response.status === 200) {
    const data = await response.json()
    const { newUserFamilies } = data
    return newUserFamilies
  }

  return Promise.reject()
}

// type ShareCodeModalProps = {
//   isOpen: boolean
//   onClose: () => unknown
//   onChangeFamily: () => unknown
//   currentFamily: Family
// }

// function ShareCodeModal({ isOpen, onClose, onChangeFamily, currentFamily }: ShareCodeModalProps) {
//   return (
//     <TDFModal
//       isOpen={isOpen}
//       close={() => {
//         onClose()
//       }}>
//       <div>Votre histoire est partagée avec {currentFamily.familyName}.</div>
//       <div className='mt-2'>Vous pouvez inviter des personnes à rejoindre la famille en copiant le lien suivant:</div>
//       <div className='mt-3 w-full inline-flex rounded-full shadow-sm'>
//         <input
//           type='text'
//           value={`${currentFamily.shareUrl}`}
//           className='block w-full rounded-none rounded-l-full border-0 py-1.5 pl-4 text-gray-900 ring-2 ring-inset ring-indigo-600 text-sm sm:leading-6 cursor-text'
//           disabled
//         />
//         <button
//           type='button'
//           onClick={() => {
//             navigator.clipboard.writeText(currentFamily.shareUrl).then(
//               () => {
//                 alert(
//                   'Le lien de partage est bien copié.\n\nVous pouvez maintenant le partager par email, sms, whatsapp, ou tout autre moyen de communication.'
//                 )
//               },
//               () => {
//                 alert(
//                   'Impossible de copier le lien de partager.\n\nVous pouvez essayer de le faire en copiant le contenu de la case.'
//                 )
//               }
//             )
//           }}
//           className='relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-full px-3 py-2 text-sm font-semibold text-indigo-600 bg-white ring-2 ring-inset ring-indigo-600 hover:bg-indigo-600 hover:text-white'>
//           <DocumentDuplicateIcon className='-ml-0.5 h-5 w-5 ' aria-hidden='true' title='Copier' />
//         </button>
//       </div>
//       <div className='mt-6'>
//         <button
//           onClick={() => {
//             onClose()
//             onChangeFamily()
//           }}
//           className={`mb-4 ${primaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
//           Changer de famille
//         </button>
//         <button onClick={onClose} className={`mb-4 ${secondaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
//           Ok
//         </button>
//       </div>
//     </TDFModal>
//   )
// }

type ShareWithMultipleFamilyModalProps = {
  isOpen: boolean
  onClose: () => unknown
  onNewFamily: () => unknown
  currentFamilyIds: FamilyId[]
  latestUserFamilies: Family[]
}

export function ShareWithMultipleFamilyModal({
  isOpen,
  onClose,
  onNewFamily,
  currentFamilyIds,
  latestUserFamilies: userFamilies,
}: ShareWithMultipleFamilyModalProps) {
  const [selectedFamilies, setSelectedFamilies] = useState<FamilyId[]>(currentFamilyIds)

  function addSelected(familyId: FamilyId) {
    setSelectedFamilies((state) => [familyId, ...state])
  }

  function removeSelected(familyId: FamilyId) {
    setSelectedFamilies((state) => state.filter((famId) => famId !== familyId))
  }

  return (
    <TDFModal
      title='Choisissez les familles avec laquelle vous voulez partager cette histoire'
      isOpen={isOpen}
      close={() => {
        setSelectedFamilies(currentFamilyIds)
        onClose()
      }}>
      <form method='POST'>
        <input type='hidden' name='action' value='shareWithMultipleFamilies' />
        {/* <input type='hidden' name='familyId' value={selectedFamily?.familyId} /> */}
        <fieldset className='border-b border-t border-gray-200'>
          <div className='-space-y-px rounded-md bg-white mt-8'>
            <div
              className={
                // @ts-ignore
                classNames(
                  'rounded-tl-md rounded-tr-md',
                  userFamilies.length === 1 ? 'rounded-bl-md rounded-br-md' : '',
                  'z-10 border-indigo-200 bg-indigo-50',
                  'relative flex border p-4 focus:outline-none'
                )
              }>
              <input type='checkbox' checked={true} className='h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-0' />
              <span className='ml-3 flex flex-col'>
                <span
                  className={
                    // @ts-ignore
                    classNames('text-gray-900', 'inline-flex justify-items-start items-center text-sm font-medium ')
                  }
                  id='headlessui-label-:rc:'>
                  <LockClosedIcon className='h-4 w-4 mr-1' />
                  Votre espace personnel
                </span>

                <span
                  className={
                    // @ts-ignore
                    classNames('text-gray-500', 'block text-sm')
                  }>
                  Un espace pour vos histoires confidentielles et vous seul pouvez y accéder.
                </span>
              </span>
            </div>
            {userFamilies
              .filter((fam) => !fam.isUserSpace)
              .map((family, familyIndex) => {
                const checked = selectedFamilies.includes(family.familyId)
                return (
                  <div
                    key={family.familyId}
                    onClick={(e) => {
                      if (checked) {
                        removeSelected(family.familyId)
                      } else {
                        addSelected(family.familyId)
                      }
                    }}
                    className={
                      // @ts-ignore
                      classNames(
                        familyIndex === userFamilies.length - 2 ? 'rounded-bl-md rounded-br-md' : '',
                        checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200',
                        'relative flex cursor-pointer border p-4 focus:outline-none'
                      )
                    }>
                    <input
                      type='checkbox'
                      name='familiesToShareWith'
                      value={family.familyId}
                      checked={checked}
                      onChange={(e) => {
                        if (checked) {
                          removeSelected(family.familyId)
                        } else {
                          addSelected(family.familyId)
                        }
                      }}
                      className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600'
                    />
                    <span className='ml-3 flex flex-col'>
                      <span
                        className={
                          // @ts-ignore
                          classNames(
                            checked ? 'text-indigo-900' : 'text-gray-900',
                            'inline-flex justify-items-start items-center text-sm font-medium '
                          )
                        }
                        id='headlessui-label-:rc:'>
                        <UsersIcon className='h-4 w-4 mr-1' />
                        {family.familyName}
                      </span>
                      {family.isUserSpace ? (
                        <span
                          className={
                            // @ts-ignore
                            classNames(checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm')
                          }>
                          Un espace pour vos histoires confidentielles et vous seul pouvez y accéder.
                        </span>
                      ) : (
                        <span
                          className={
                            // @ts-ignore
                            classNames(checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm')
                          }>
                          {family.about}
                        </span>
                      )}
                    </span>
                  </div>
                )
              })}
          </div>
        </fieldset>

        <button
          onClick={(e) => {
            e.preventDefault()
            onNewFamily()
          }}
          className={`mt-3 text-sm ${linkStyles}`}>
          <PlusIcon className={`${buttonIconStyles}`} />
          Nouvelle famille
        </button>
        <div className='mt-6'>
          <button type='submit' className={`mb-4 ${primaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
            Valider
          </button>
          <button
            type='reset'
            onClick={onClose}
            className={`mb-4 ${secondaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
            Annuler
          </button>
        </div>
      </form>
    </TDFModal>
  )
}
