import * as React from 'react'

import { CheckCircleIcon } from '@heroicons/react/solid'
import { SearchIcon } from '@heroicons/react/outline'

import { AppLayout } from '../_components/layout/AppLayout'
import { GedcomImported } from '../../events/GedcomImported'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle'

export type ImportGedcomSuccessPageProps = {
  gedcom: GedcomImported
}

export const ImportGedcomSuccessPage = withBrowserBundle(({ gedcom }: ImportGedcomSuccessPageProps) => {
  const {
    payload: { persons },
  } = gedcom

  const personCount = persons?.length
  const firstPerson = persons[0]

  const [personPerPage, setPersonPerPage] = React.useState(5)
  const [personFromGedcom, setPersonFromGedcom] = React.useState(persons.slice(0, personPerPage))

  const onClickSeeMoreButton = () => {
    setPersonPerPage(personPerPage + 5)
  }

  React.useEffect(() => {
    setPersonFromGedcom(persons.slice(0, personPerPage))
  }, [personPerPage])

  return (
    <AppLayout>
      {!gedcom ? (
        <div>error </div>
      ) : (
        <div className='px-8 py-8'>
          <div className='rounded-md bg-green-50 p-4 mb-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <CheckCircleIcon className='h-5 w-5 text-green-400' aria-hidden='true' />
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-green-800'>Bravo !</h3>
                <div className='mt-2 text-sm text-green-700'>
                  <p>
                    Vous avez importé les <b>{personCount!}</b> personnes de votre arbre généalogique !
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className='bg-white shadow sm:rounded-lg'>
            <div className='px-4 py-5 sm:p-6'>
              <h3 className='text-lg leading-6 font-medium text-gray-900'>Et toi, tu es qui dans cet arbre ?</h3>
              <div className='mt-2 max-w-xl text-sm text-gray-500'>
                <p>Saisis ton nom pour te prendre comme point de départ</p>
              </div>
              <form method='get' className='mt-5 sm:flex sm:items-center'>
                <div className='w-full sm:max-w-xs relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <SearchIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
                  </div>
                  <label htmlFor='name' className='sr-only'>
                    Mon nom
                  </label>
                  <input
                    type='text'
                    name='rechercher'
                    id='name'
                    autoComplete='off'
                    autoCorrect='off'
                    autoCapitalize='off'
                    /* defaultValue={search.query} */
                    className='shadow-sm pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md'
                    placeholder={firstPerson.name.substring(0, firstPerson.name.indexOf(' ')).trim() + '...'}
                  />
                </div>
                <button
                  type='submit'
                  className='mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'>
                  Rechercher
                </button>
              </form>

              {
                personCount && (
                  <div className=' md:max-w-md'>
                    <div className='flow-root mt-6'>
                      <ul role='list' className='-my-5 divide-y divide-gray-200'>
                        {personFromGedcom.map((person) => (
                          <li key={person.id} className='py-4'>
                            <div className='flex items-center space-x-4'>
                              <div className='flex-shrink-0'>
                                <span className='inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100'>
                                  <svg className='h-full w-full text-gray-300' fill='currentColor' viewBox='0 0 24 24'>
                                    <path d='M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z' />
                                  </svg>
                                </span>
                              </div>
                              <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium text-gray-900 truncate'>{person.name}</p>
                                <p className='text-sm text-gray-500 truncate'>né le</p>
                              </div>
                              <div>
                                {!person.id ? (
                                  <form method='post'>
                                    <input type='hidden' name='personId' value={person.id} />
                                    <button
                                      type='submit'
                                      className='inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50'>
                                      C'est moi
                                    </button>
                                  </form>
                                ) : (
                                  <div className='inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white'>
                                    Déjà affecté
                                  </div>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className='mt-6'>
                      <button
                        onClick={onClickSeeMoreButton}
                        className='w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
                        Voir plus
                      </button>
                    </div>
                  </div>
                ) /*  : (
                <div className='text-sm text-gray-500 mt-3 pl-2'>
                  <i>{search.query}</i>: inconnu au bataillon ?!
                </div>
              ) */
              }
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
})
