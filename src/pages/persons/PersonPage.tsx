import * as React from 'react'
import { AppLayout } from '../_components/layout/AppLayout'
import classNames from 'classnames'

import { CameraIcon } from '@heroicons/react/outline'
import { ProfilePicture } from '../_components/ProfilePicture'
import { UploadImage } from '../_components/UploadImage'

import { Person } from '../../types/Person'

export type PersonPageProps = {
  personInfo: {
    userId: string
    personId: string
    person: Person
    parents: Person[]
    children: Person[]
    spouse: Person[]
    siblings: Person[]
  }
}

export const PersonPage = ({ personInfo }: PersonPageProps) => {
  const { userId, personId, person, parents, children, spouse, siblings } = personInfo

  const tab = undefined

  return (
    <AppLayout>
      <div>
        <article className='bg-white'>
          {/* Profile header */}
          <div>
            <div>
              <img
                className='h-32 w-full object-cover lg:h-48'
                src={
                  'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
                }
                alt=''
              />
            </div>
            <div className='px-4 sm:px-6 lg:px-12'>
              <div className='-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5'>
                <div className='flex'>
                  <a href={`/a/personnes/${person.id}/profile-image`}>
                    <ProfilePicture person={person} className='h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32' />
                  </a>
                </div>
                <div className='mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1'>
                  <div className='sm:hidden 2xl:block mt-6 min-w-0 flex-1'>
                    <h1 className='text-2xl font-bold text-gray-900 truncate'>{person.name}</h1>
                  </div>
                  <div className='mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4'>
                    <a
                      href={`/a/personnes/${person.id}/profile-image`}
                      className='inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500'>
                      <CameraIcon className='-ml-1 mr-2 h-5 w-5 text-gray-400' aria-hidden='true' />
                      <span>{person.profilePictureId ? 'Changer la' : 'Ajouter une'} photo de profil</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className='hidden sm:block 2xl:hidden mt-6 min-w-0 flex-1'>
                <h1 className='text-2xl font-bold text-gray-900 truncate'>{person.name}</h1>
              </div>
            </div>

            {/* Tabs */}
            <div className='mt-6 sm:mt-2 2xl:mt-5'>
              <div className='border-b border-gray-200'>
                <div className='px-4 sm:px-6 lg:px-12'>
                  <nav className='-mb-px flex space-x-8' aria-label='Tabs'>
                    <form method='get'>
                      <input type='hidden' name='tab' value='famille' />
                      <button
                        type='submit'
                        className={classNames(
                          !tab || tab === 'famille'
                            ? 'border-pink-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                          'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                        )}
                        aria-current={!tab || tab === 'famille' ? 'page' : undefined}>
                        Famille
                      </button>
                    </form>

                    <form method='get'>
                      <input type='hidden' name='tab' value='photos' />
                      <button
                        type='submit'
                        className={classNames(
                          tab === 'photos'
                            ? 'border-pink-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                          'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                        )}
                        aria-current={tab === 'photos' ? 'page' : undefined}>
                        Photos
                      </button>
                    </form>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </article>
        {(!tab || tab === 'famille') && (
          <div className='sm:py-8 sm:px-6 lg:px-12 flex-col sm:flex gap-5'>
            {!!parents.length && <RelativeList title='Ses parents' relatives={parents} />}
            {!!children.length && <RelativeList title='Ses enfants' relatives={children} />}
            {!!spouse.length && <RelativeList title='Son/Sa compagne' relatives={spouse} />}
            {!!siblings.length && <RelativeList title='Ses frères & soeurs' relatives={siblings} />}
          </div>
        )}

        {tab === 'photos' && (
          <>
            <div className='py-4 sm:px-6 lg:px-12'>
              <UploadImage
                redirectTo={`/a/personnes/${person.id}?tab=photos`}
                autoTagPerson={person.id}
                title={`Ajouter une photo de ${person.name}`}
              />
            </div>
            <ul
              role='list'
              className='py-4 sm:py-8 sm:px-6 lg:px-12 grid grid-cols-2 sm:gap-y-8 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8'>
              {/*  {person.picturedIn.map((photo) => (
                <li key={photo.imageId} className='relative'>
                  <a href={`/a/photos/${photo.imageId}`}>
                    <div
                      className={classNames(
                        'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500',
                        'group block w-full aspect-w-10 aspect-h-7 sm:rounded-lg bg-gray-100 overflow-hidden'
                      )}>
                      <img
                        src={`/a/images/${photo.imageId}`}
                        alt=''
                        className={classNames('object-cover pointer-events-none')}
                      />
                    </div>
                  </a>
                </li>
              ))} */}
            </ul>
          </>
        )}
      </div>
    </AppLayout>
  )
}

interface RelativeListProps {
  title: string
  relatives: Person[]
}
function RelativeList({ title, relatives }: RelativeListProps) {
  return (
    <section aria-labelledby='relative-list-title'>
      <div className='sm:rounded-lg bg-white overflow-hidden shadow'>
        <div className='p-6'>
          <h2 className='text-base font-medium text-gray-900' id='relative-list-title'>
            {title}
          </h2>
          <div className='flow-root mt-6'>
            <ul role='list' className='-my-5 divide-y divide-gray-200'>
              {relatives.map((relative) => (
                <li key={relative.id} className='py-4'>
                  <div className='flex items-center space-x-4'>
                    <div className='flex-shrink-0'>
                      <ProfilePicture person={relative} className='h-8 w-8 rounded-full' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>{relative.name}</p>
                      {/* <p className="text-sm text-gray-500 truncate">son père</p> */}
                    </div>
                    <div>
                      <a
                        href={`/a/personnes/${relative.id}`}
                        className='inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50'>
                        Voir
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
