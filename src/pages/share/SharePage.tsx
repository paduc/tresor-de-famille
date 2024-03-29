import * as React from 'react'

import { CheckCircleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { FamilyId } from '../../domain/FamilyId.js'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle.js'
import { linkStyles, primaryButtonStyles } from '../_components/Button.js'
import { useLoggedInSession, useSession } from '../_components/SessionContext.js'
import { AppLayout } from '../_components/layout/AppLayout.js'
import { AppUserId } from '../../domain/AppUserId.js'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type SharePageProps = {
  userFamilies: {
    familyId: FamilyId
    name: string
    about?: string
    shareUrl: string
    isUserSpace: boolean
    users: {
      userId: AppUserId
      name: string
      partialEmail: string
    }[]
  }[]
}

export const SharePage = withBrowserBundle(({ userFamilies }: SharePageProps) => {
  const session = useLoggedInSession()

  return (
    <AppLayout>
      <div className='bg-white p-6 pl-9'>
        <div className='space-y-12'>
          <div className='border-b border-gray-900/10 pb-12'>
            <h2 className='text-2xl font-semibold leading-7 text-gray-900'>Partage</h2>

            <p className='mt-1 max-w-full overflow-hidden md:max-w-xl text-sm leading-6 text-gray-600'>
              La création d'une famille est la première étape du partage. Construire un trésor de famille à plusieurs, c'est
              plus facile et convivial !
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
                    Vous et les membres de la famille ajoutez du contenu. Celui-ci sera immédiatement accessible aux autres
                    membres de la famille.
                  </div>
                </li>
              </ul>
            </div>
            <p className='mt-2 max-w-full overflow-hidden md:max-w-xl text-sm leading-6 text-gray-600'>
              Les contenus qui ne sont <b>pas explicitement partagés</b> avec cette famille, resteront <b>confidentiels</b>.
            </p>
          </div>

          {userFamilies.length > 1 ? (
            <div className='border-b border-gray-900/10'>
              <h3 className='text-lg font-medium leading-6 text-gray-900'>Mes familles</h3>
              <ul role='list' className='divide-y divide-gray-200'>
                {userFamilies
                  .filter((f) => !f.isUserSpace)
                  .map((family) => {
                    return (
                      <li
                        key={family.familyId}
                        className='flex flex-wrap items-center justify-between gap-y-4 ml-0 sm:flex-nowrap'>
                        <div className='w-full py-5'>
                          <p className='text-base text-gray-900'>{family.name}</p>
                          {family.about ? (
                            <div className='mt-1  text-sm leading-5 text-gray-500'>
                              <p>{family.about}</p>
                            </div>
                          ) : null}
                          <div className='mt-1'>
                            <span className='text-gray-500 text-sm mr-3'>Lien de partage :</span>
                            <div className='mt-1 flex rounded-full shadow-sm'>
                              <div className='relative flex flex-grow items-stretch focus-within:z-10'>
                                <input
                                  type='text'
                                  value={`${family.shareUrl}`}
                                  className='block rounded-none rounded-l-full border-0 py-1.5 pl-4 text-gray-900 ring-2 ring-inset ring-indigo-600  sm:text-sm sm:leading-6 cursor-text'
                                  disabled
                                />
                                <button
                                  type='button'
                                  onClick={() => {
                                    // This will not trigger on iOS if served by localhost
                                    navigator.clipboard.writeText(family.shareUrl).then(
                                      () => {
                                        alert(
                                          'Le lien de partage est bien copié.\n\nVous pouvez maintenant le partager par email, sms, whatsapp, ou tout autre moyen de communication.'
                                        )
                                      },
                                      () => {
                                        alert(
                                          'Impossible de copier le lien de partager.\n\nVous pouvez essayer de le faire en copiant le contenu de la case.'
                                        )
                                      }
                                    )
                                  }}
                                  className='relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-full px-3 py-2 text-sm font-semibold text-indigo-600 bg-white ring-2 ring-inset ring-indigo-600 hover:bg-indigo-600 hover:text-white'>
                                  <DocumentDuplicateIcon className='-ml-0.5 h-5 w-5 ' aria-hidden='true' />
                                  Copier
                                </button>
                              </div>
                            </div>
                          </div>
                          <details className='mt-3 text-sm text-gray-500'>
                            <summary className={`${linkStyles}`}>Voir les personnes qui ont accepté leur invitation</summary>
                            <ul className='mt-1'>
                              {family.users.map((user) => (
                                <li className='py-0.5' key={`family_${family.familyId}_user_${user.userId}`}>
                                  {user.name} ({user.partialEmail})
                                </li>
                              ))}
                            </ul>
                          </details>
                        </div>
                      </li>
                    )
                  })}
              </ul>
            </div>
          ) : null}

          <form method='POST'>
            <div className='mt-10'>
              <h2 className='text-lg font-semibold leading-7 text-gray-900'>Nouvelle famille</h2>
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
                <p className='mt-2 text-sm leading-6 text-gray-600'>Décrivez en quelques mots les contours de cette famille.</p>
              </div>

              {/* <div className='mt-4 max-w-lg'>
                <div className='flex items-center justify-between mt-2'>
                  <input type='checkbox' className='mr-1' defaultChecked />
                  <div className='mx-1 min-w-0 flex-auto'>
                    <p className='block text-sm font-medium leading-6 text-gray-900 cursor-pointer'>
                      Copier mon arbre généalogique
                    </p>
                  </div>
                </div>
              </div> */}

              <input type='hidden' name='action' value='createNewFamily' />
              <button type='submit' className={`${primaryButtonStyles} mt-6`}>
                Créer cette famille
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
})
