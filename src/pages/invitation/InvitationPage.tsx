import * as React from 'react'

import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../_components/layout/AppLayout'
import { SessionContext } from '../_components/SessionContext'
import {
  CheckCircleIcon,
  DocumentDuplicateIcon,
  ExclamationCircleIcon,
  PhotoIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { linkStyles, primaryButtonStyles, secondaryButtonStyles, secondaryRedButtonStyles } from '../_components/Button'
import { FamilyId } from '../../domain/FamilyId'
import { FamilyShareCode } from '../../domain/FamilyShareCode'
import { BareLayout } from '../_components/layout/Layout'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type InvitationPageProps =
  | {
      error: false
      family: {
        familyId: FamilyId
        name: string
        about: string
      }
      inviterName: string
    }
  | { error: true }

export const InvitationPage = withBrowserBundle((props: InvitationPageProps) => {
  const session = React.useContext(SessionContext)

  if (!session.isSharingEnabled) {
    return <div />
  }

  if (props.error) {
    return <BareLayout>Une erreur est survenue. Il est possible que ce lien soit mal copié (incomplet) ou périmé.</BareLayout>
  }

  const { family, inviterName } = props

  return (
    <AppLayout>
      <div className='bg-white shadow sm:rounded-lg md:max-w-lg mt-6 md:ml-4'>
        <div className='px-4 py-5 sm:p-6  border-b border-gray-300'>
          <div className='mb-3'>{inviterName} vous invite à rejoindre:</div>
          <h3 className='text-base font-semibold leading-6 text-gray-900'>{family.name}</h3>
          <div className='mt-1 max-w-xl text-sm text-gray-500'>
            <p>{family.about}</p>
          </div>
          <div className='mt-5'>
            <button
              type='button'
              className='inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'>
              Accepter
            </button>
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
      </div>
    </AppLayout>
  )
})
