import * as React from 'react'

import { CheckCircleIcon, ExclamationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { FamilyId } from '../../domain/FamilyId'
import { FamilyShareCode } from '../../domain/FamilyShareCode'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { linkStyles } from '../_components/Button'
import { ClientOnly } from '../_components/ClientOnly'
import { Logo } from '../_components/Logo'
import { useSession } from '../_components/SessionContext'
import { SuccessError } from '../_components/SuccessError'
import { AppLayout } from '../_components/layout/AppLayout'
import { BareLayout } from '../_components/layout/Layout'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type InvitationPageProps =
  | { errors?: { password?: string; email?: string; other?: string }; email?: string } & (
      | {
          error: false
          family: {
            familyId: FamilyId
            name: string
            about: string
          }
          inviterName: string
          code: FamilyShareCode
        }
      | { error: true }
    )

export const InvitationPage = withBrowserBundle((props: InvitationPageProps) => {
  const session = useSession()

  if (!session.isSharingEnabled) {
    return <div />
  }

  if (props.error) {
    return (
      <BareLayout>
        <SuccessError error='Oops' />
      </BareLayout>
    )
  }

  const { family, inviterName, code, errors } = props

  if (!session.isLoggedIn) {
    return (
      <BareLayout>
        <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
          <div className='sm:mx-auto sm:w-full sm:max-w-md'>
            <div className='mx-auto h-12' style={{ width: 60 }}>
              <Logo style={{ height: 60, width: 60 }} />
            </div>

            <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>Trésor de famille</h2>
            <p className='mt-2 text-center text-sm text-gray-600 max-w'>Partageons nos souvenirs en famille</p>
          </div>
          <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
            <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
              <div className='border-b pb-4 border-gray-300'>
                <div className='mb-3'>{inviterName} vous invite à rejoindre:</div>
                <h3 className='text-base font-semibold leading-6 text-gray-900'>{family.name}</h3>
                <div className='mt-1 max-w-xl text-sm text-gray-500'>
                  <p>{family.about}</p>
                </div>
              </div>
              <div className='pt-4'>
                <div className='text-base font-semibold text-gray-900'>Créer un compte pour accepter</div>
                <ClientOnly>
                  <AlreadyRegisterUserLink />
                </ClientOnly>

                <form method='post' aria-describedby={errors ? 'form-error-message' : undefined} className='mt-3 space-y-6'>
                  <input type='hidden' name='action' value='registerWithInvite' />
                  <input type='hidden' name='code' value={code} />
                  <input type='hidden' name='familyId' value={family.familyId} />
                  <div>
                    <label htmlFor='emailField' className='block cursor-pointer text-sm font-medium text-gray-700'>
                      Adresse email
                    </label>
                    <div className='mt-1 relative'>
                      <input
                        type='text'
                        id='emailField'
                        name='email'
                        autoComplete='email'
                        defaultValue={props.email}
                        autoFocus={!props.email}
                        aria-invalid={Boolean(errors?.email)}
                        aria-describedby={errors?.email ? 'email-error' : undefined}
                        required
                        className={classNames(
                          'appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
                          {
                            'border-red-300': !!errors?.email,
                          }
                        )}
                      />
                      {errors?.email ? (
                        <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                          {/* Heroicon name: exclamation-circle */}
                          <svg
                            className='h-5 w-5 text-red-500'
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                            aria-hidden='true'>
                            <path
                              fillRule='evenodd'
                              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor='passwordField' className='block  cursor-pointer text-sm font-medium text-gray-700'>
                      Mot de passe
                    </label>
                    <div className='mt-1 relative'>
                      <input
                        id='passwordField'
                        name='password'
                        type='password'
                        required
                        autoFocus={!!props.email}
                        className={classNames(
                          'appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
                          {
                            'border-red-300': !!errors?.password,
                          }
                        )}
                        aria-invalid={Boolean(errors?.password) || undefined}
                        aria-describedby={errors?.password ? 'password-error' : undefined}
                      />
                      {errors?.password ? (
                        <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                          {/* Heroicon name: exclamation-circle */}
                          <svg
                            className='h-5 w-5 text-red-500'
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                            aria-hidden='true'>
                            <path
                              fillRule='evenodd'
                              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                  {errors ? (
                    <div className='rounded-md bg-red-50 p-4'>
                      <div className='flex'>
                        <div className='flex-shrink-0'>
                          <XCircleIcon className='h-5 w-5 text-red-400' aria-hidden='true' />
                        </div>
                        <div className='ml-3'>
                          {/* <h3 className="text-sm font-medium text-red-800">There were 2 errors with your submission</h3> */}
                          <div className='text-sm text-red-700'>
                            {Object.values(errors).map((errorMsg, index) => (
                              <div key={`error_${index}`}>{errorMsg}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div>
                    <button
                      type='submit'
                      className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                      Rejoindre la famille
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className='px-4 py-5 sm:px-6'>
              <div className='mt-5 max-w-full overflow-hidden md:max-w-xl text-sm leading-6 text-gray-600'>
                Vous pourrez
                <ul className='text-gray-500 py-1'>
                  <li className='flex  items-center py-2'>
                    <CheckCircleIcon className='shrink-0 h-6 w-6 mr-2 text-green-600' />
                    <div className='flex-1'>Accèder à tous les contenus déposés par les membres de la famille,</div>
                  </li>
                  <li className='flex items-center py-2'>
                    <CheckCircleIcon className='shrink-0 h-6 w-6 mr-2 text-green-600' />
                    <div className='flex-1'>
                      Ajouter les souvenirs que vous souhaitez, ceux-ci seront immédiatement accessibles aux autres membres de
                      la famille.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </BareLayout>
    )
  }

  if (props.error) {
    return <BareLayout>Une erreur est survenue. Il est possible que ce lien soit mal copié (incomplet) ou périmé.</BareLayout>
  }

  return (
    <AppLayout>
      <div className='bg-white shadow sm:rounded-lg md:max-w-lg mt-6 md:ml-8'>
        <div className='px-4 py-5 sm:p-6'>
          <div className='mb-3'>{inviterName} vous invite à rejoindre:</div>
          <h3 className='text-base font-semibold leading-6 text-gray-900'>{family.name}</h3>
          <div className='mt-1 max-w-xl text-sm text-gray-500'>
            <p>{family.about}</p>
          </div>
          <div className='mt-5'>
            <form method='POST'>
              <input type='hidden' name='action' value='accept' />
              <input type='hidden' name='familyId' value={family.familyId} />
              <input type='hidden' name='code' value={code} />
              <button
                type='submit'
                className='inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'>
                Accepter
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className='px-4 py-5 sm:px-6 md:max-w-lg md:ml-8'>
        <div className='mt-5 max-w-full overflow-hidden md:max-w-xl text-sm leading-6 text-gray-600'>
          Vous pourrez
          <ul className='text-gray-500 py-1'>
            <li className='flex  items-center py-2'>
              <CheckCircleIcon className='shrink-0 h-6 w-6 mr-2 text-green-600' />
              <div className='flex-1'>Accèder à tous les contenus déposés par les membres de la famille,</div>
            </li>
            <li className='flex items-center py-2'>
              <CheckCircleIcon className='shrink-0 h-6 w-6 mr-2 text-green-600' />
              <div className='flex-1'>
                Ajouter les souvenirs que vous souhaitez, ceux-ci seront immédiatement accessibles aux autres membres de la
                famille.
              </div>
            </li>
            <li className='flex items-center py-2'>
              <ExclamationCircleIcon className='shrink-0 h-6 w-6 mr-2 text-yellow-600' />
              <div className='flex-1'>Vos contenus existants ne seront pas partagés.</div>
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  )
})

function AlreadyRegisterUserLink() {
  return (
    <a href={'/login.html?redirectTo=' + encodeURIComponent(window.location.href)} className={`${linkStyles} text-sm`}>
      J'ai déjà un compte
    </a>
  )
}
