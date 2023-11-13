import * as React from 'react'

import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'
import { AppLayout } from '../_components/layout/AppLayout'
import { SessionContext } from '../_components/SessionContext'
import { CheckCircleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { linkStyles, primaryButtonStyles, secondaryButtonStyles, secondaryRedButtonStyles } from '../_components/Button'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type SharePageProps = {}

export const SharePage = withBrowserBundle(({}: SharePageProps) => {
  const session = React.useContext(SessionContext)

  if (!session.isLoggedIn || !session.isSharingEnabled) {
    return <div />
  }

  const [isShared, setShared] = React.useState(false)
  const shareUrl = 'Pouet'

  return (
    <AppLayout>
      <div className='px-4 pt-6 pb-3 md:px-8 md:pt-12 '>
        <h2 className='text-3xl font-bold tracking-tight text-gray-900 md:text-4xl'>
          <span className='block'>Famille de {session.userName}</span>
        </h2>
      </div>
      <div className=' bg-white p-6 pl-9'>
        <p className='max-w-full overflow-hidden md:max-w-xl text-gray-800 mb-2'>
          Le partage permet d'inviter d'autres personnes à participer à l'élaboration d'un trésor de famille avec vous.
        </p>
        <p className='max-w-full overflow-hidden md:max-w-xl text-gray-800 mb-5'>
          Les membres de cette famille pourront:
          <ul className=' text-gray-500 py-1'>
            <li className='flex items-center py-2'>
              <CheckCircleIcon className='h-6 w-6 mr-2 text-green-600' />
              Voir tous les contenus (photos, anecdotes, personnes, ...)
            </li>
            <li className='flex items-center py-2'>
              <CheckCircleIcon className='h-6 w-6 mr-2 text-green-600' />
              Modifier le contenu existant
            </li>
            <li className='flex items-center py-2'>
              <CheckCircleIcon className='h-6 w-6 mr-2 text-green-600' />
              Ajouter du contenu
            </li>
          </ul>
        </p>
        <div className='mb-2'>
          {isShared ? (
            <>
              <div className='flex items-center'>
                <span className='text-gray-500 mr-3'>Lien de partage :</span>
                <div className='flex rounded-full shadow-sm'>
                  <div className='relative flex flex-grow items-stretch focus-within:z-10'>
                    <input
                      type='text'
                      value={`${shareUrl}`}
                      className='block rounded-none rounded-l-full border-0 py-1.5 pl-4 text-gray-900 ring-2 ring-inset ring-indigo-600  sm:text-sm sm:leading-6 cursor-text'
                      disabled
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl).then(
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
              <div className='mt-48'>
                <form
                  method='post'
                  onSubmit={(e) => {
                    e.preventDefault()
                    setShared(false)
                  }}>
                  <input type='hidden' name='action' value='enableSharing' />
                  <button type='submit' className={`${secondaryRedButtonStyles}`}>
                    Désactiver le partage
                  </button>
                </form>
              </div>
            </>
          ) : (
            <form
              method='post'
              onSubmit={(e) => {
                e.preventDefault()
                setShared(true)
              }}>
              <input type='hidden' name='action' value='enableSharing' />
              <button type='submit' className={`${primaryButtonStyles}`}>
                Activer le partage
              </button>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  )
})
