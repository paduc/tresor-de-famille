/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import { Dialog, Listbox, Menu, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  PlusSmallIcon,
  ShareIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import React, { Fragment, useContext, useState } from 'react'
import { PersonPageURL } from '../../person/PersonPageURL'
import { PersonSearch } from '../../photo/PhotoPage/PersonSearch'
import { ClientOnly } from '../ClientOnly'
import { InlinePhotoUploadBtn } from '../InlinePhotoUploadBtn'
import { LocationContext } from '../LocationContext'
import { Logo } from '../Logo'
import { useSession } from '../SessionContext'
import { LoaderProvider } from './LoaderContext'

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type AppLayoutProps = {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const session = useSession()
  const url = useContext(LocationContext)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [personSearchOpen, setPersonSearchOpen] = useState(false)

  const keyDownHandler = (event: KeyboardEvent) => {
    if (event.metaKey && event.key === 'k') {
      setPersonSearchOpen(true)
    }
  }

  React.useEffect(() => {
    session.isLoggedIn && session.arePersonsEnabled && window.addEventListener('keydown', keyDownHandler)
  })

  if (!session.isLoggedIn) {
    return <p>Session not available</p>
  }

  const {
    arePhotosEnabled,
    areThreadsEnabled,
    isFamilyPageEnabled,
    isSharingEnabled,
    profilePic,
    userFamilies,
    currentFamilyId,
    userId,
  } = session

  type CurrentFamilySituation =
    | {
        showBanner: true
        familyName: string
      }
    | {
        showBanner: false
      }

  function getCurrentFamilySituation(): CurrentFamilySituation {
    const onlyPersonnalSpace =
      !userFamilies.length || userFamilies.every(({ familyId }) => (familyId as string) === (userId as string))

    if (onlyPersonnalSpace) {
      return {
        showBanner: false,
      }
    }

    return {
      showBanner: true,
      familyName: userFamilies.find(({ familyId }) => familyId === currentFamilyId)!.familyName,
    }
  }

  const currentFamilySituation = getCurrentFamilySituation()

  const userName = session.userName || ''

  const navigation: {
    name: string
    href: string
    icon: any
    current?: boolean
    condition: () => boolean
  }[] = [
    {
      name: 'Accueil',
      href: '/',
      icon: HomeIcon,
      condition: () => true,
    },
    {
      name: 'Photos',
      href: '/photos.html',
      icon: PhotoIcon,
      condition: () => arePhotosEnabled,
    },
    // { name: 'Videos', href: '/videos.html', icon: VideoCameraIcon },
    {
      name: 'Histoires et anecdotes',
      href: '/threads.html',
      icon: BookOpenIcon,
      condition: () => areThreadsEnabled,
    },
    {
      name: 'Ma famille (alpha)',
      href: '/family.html',
      icon: ShareIcon,
      condition: () => isFamilyPageEnabled,
    },
    {
      name: 'Partage',
      href: '/share.html',
      icon: UsersIcon,
      condition: () => isSharingEnabled,
    },
  ]

  const sidebarAccessible = navigation.some((link) => link.condition())

  return (
    <LoaderProvider>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}

      <div>
        {isSharingEnabled ? (
          <FamilyBanner
            position='top'
            showBanner={currentFamilySituation.showBanner}
            familyName={currentFamilySituation.showBanner ? currentFamilySituation.familyName : ''}
          />
        ) : null}
        {session.arePersonsEnabled ? (
          <PersonSearch
            open={personSearchOpen}
            setOpen={setPersonSearchOpen}
            onPersonSelected={(personId) => {
              window.location.assign(PersonPageURL(personId))
            }}
          />
        ) : null}
        {/* Mobile navbar */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as='div' className='relative z-40 lg:hidden' onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter='transition-opacity ease-linear duration-300'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='transition-opacity ease-linear duration-300'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'>
              <div className='fixed inset-0 bg-gray-900/80' />
            </Transition.Child>

            <div className='fixed inset-0 flex'>
              <Transition.Child
                as={Fragment}
                enter='transition ease-in-out duration-300 transform'
                enterFrom='-translate-x-full'
                enterTo='translate-x-0'
                leave='transition ease-in-out duration-300 transform'
                leaveFrom='translate-x-0'
                leaveTo='-translate-x-full'>
                <Dialog.Panel className='relative mr-16 flex w-full max-w-xs flex-1'>
                  <Transition.Child
                    as={Fragment}
                    enter='ease-in-out duration-300'
                    enterFrom='opacity-0'
                    enterTo='opacity-100'
                    leave='ease-in-out duration-300'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'>
                    <div className='absolute left-full top-0 flex w-16 justify-center pt-5'>
                      <button type='button' className='-m-2.5 p-2.5' onClick={() => setSidebarOpen(false)}>
                        <span className='sr-only'>Close sidebar</span>
                        <XMarkIcon className='h-6 w-6 text-white' aria-hidden='true' />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className='flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6 pb-4'>
                    <div className='flex h-16 shrink-0 items-center'>
                      <a href='/'>
                        <Logo className='h-10 w-auto cursor-pointer invert mix-blend-luminosity' />
                      </a>
                      <span className='group ml-3 text-indigo-100 rounded-md flex items-center text-md font-md'>
                        Trésor de famille
                      </span>
                    </div>
                    <nav className='flex flex-1 flex-col'>
                      <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                        {isSharingEnabled && currentFamilySituation.showBanner && currentFamilySituation.showBanner ? (
                          <li>
                            <FamilySwitcher />
                          </li>
                        ) : null}
                        <li>
                          <ul role='list' className='-mx-2 mt-2 space-y-3'>
                            {areThreadsEnabled ? (
                              <li>
                                <a
                                  href='/chat.html'
                                  className='button inline-flex items-center gap-x-1.5 rounded-md  px-2.5 py-1.5 text-sm text-white border-1 ring-1 ring-inset ring-indigo-200 shadow-sm hover:bg-white/20'>
                                  <PlusSmallIcon className='-ml-0.5 h-5 w-5' aria-hidden='true' />
                                  Nouvelle anecdote
                                </a>
                              </li>
                            ) : null}
                            {arePhotosEnabled ? (
                              <li>
                                <InlinePhotoUploadBtn formAction='/add-photo.html'>
                                  <span className='button inline-flex items-center gap-x-1.5 rounded-md  px-2.5 py-1.5 text-sm text-white border-1 ring-1 ring-inset ring-indigo-200 shadow-sm hover:bg-white/20'>
                                    <PlusSmallIcon className='-ml-0.5 h-5 w-5' aria-hidden='true' />
                                    Nouvelle photo
                                  </span>
                                </InlinePhotoUploadBtn>
                              </li>
                            ) : null}
                          </ul>
                        </li>
                        <li>
                          {/* <div className='text-xs font-semibold leading-6 text-indigo-200'>Par type</div> */}
                          <ul role='list' className='-mx-2 space-y-1'>
                            {navigation.map((item) => {
                              const isCurrent = item.href === '/' ? url === '/' : url.startsWith(item.href)
                              return (
                                <Fragment key={`typeItem${item.name}`}>
                                  {item.condition() ? (
                                    <li key={item.name}>
                                      <a
                                        href={item.href}
                                        className={classNames(
                                          isCurrent
                                            ? 'bg-indigo-700 text-white'
                                            : 'text-indigo-200 hover:text-white hover:bg-indigo-700',
                                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                        )}>
                                        <item.icon
                                          className={classNames(
                                            isCurrent ? 'text-white' : 'text-indigo-200 group-hover:text-white',
                                            'h-6 w-6 shrink-0'
                                          )}
                                          aria-hidden='true'
                                        />
                                        {item.name}
                                      </a>
                                    </li>
                                  ) : null}
                                </Fragment>
                              )
                            })}
                          </ul>
                        </li>

                        {/* <li className='mt-auto'>
                          <a
                            href='#'
                            className='group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-indigo-200 hover:bg-indigo-700 hover:text-white'>
                            <CogIcon className='h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white' aria-hidden='true' />
                            Settings
                          </a>
                        </li> */}
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div
          className={`hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col ${
            sidebarAccessible ? '' : 'lg:hidden'
          }`}>
          {isSharingEnabled && currentFamilySituation.showBanner ? (
            <FamilyBanner
              position='static-sidebar'
              showBanner={currentFamilySituation.showBanner}
              familyName={currentFamilySituation.showBanner ? currentFamilySituation.familyName : ''}
            />
          ) : null}
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className='flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6 pb-4'>
            <div className='flex h-16 shrink-0 items-center'>
              <a href='/'>
                <Logo className='h-10 w-auto cursor-pointer invert mix-blend-luminosity' />
              </a>
              <span className='group ml-3 text-indigo-100 rounded-md flex items-center text-md font-md'>Trésor de famille</span>
            </div>
            <nav className='flex flex-1 flex-col'>
              <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                {isSharingEnabled && currentFamilySituation.showBanner ? (
                  <li>
                    <FamilySwitcher />
                  </li>
                ) : null}
                <li>
                  <ul role='list' className='-mx-2 mt-2 space-y-3'>
                    {areThreadsEnabled ? (
                      <li>
                        <a
                          href='/chat.html'
                          className='button inline-flex items-center gap-x-1.5 rounded-md  px-2.5 py-1.5 text-sm text-white border-1 ring-1 ring-inset ring-indigo-200 shadow-sm hover:bg-white/20'>
                          <PlusSmallIcon className='-ml-0.5 h-5 w-5' aria-hidden='true' />
                          Nouvelle anecdote
                        </a>
                      </li>
                    ) : null}
                    {arePhotosEnabled ? (
                      <li>
                        <InlinePhotoUploadBtn formAction='/add-photo.html'>
                          <span className='button inline-flex items-center gap-x-1.5 rounded-md  px-2.5 py-1.5 text-sm text-white border-1 ring-1 ring-inset ring-indigo-200 shadow-sm hover:bg-white/20'>
                            <PlusSmallIcon className='-ml-0.5 h-5 w-5' aria-hidden='true' />
                            Nouvelle photo
                          </span>
                        </InlinePhotoUploadBtn>
                      </li>
                    ) : null}
                  </ul>
                </li>
                {/* <li>
                  <div className='text-xs font-semibold leading-6 text-indigo-200'>Vos anecdotes récentes</div>
                  <ul role='list' className='-mx-2 mt-2 space-y-1'>
                    {teams.map((team) => (
                      <li key={team.name}>
                        <a
                          href={team.href}
                          className={classNames(
                            team.current ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:text-white hover:bg-indigo-700',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}>
                          <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-indigo-400 bg-indigo-500 text-[0.625rem] font-medium text-white'>
                            {team.initial}
                          </span>
                          <span className='truncate'>{team.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li> */}
                <li>
                  <div className='text-xs font-semibold leading-6 text-indigo-200'>Par type</div>
                  <ul role='list' className='-mx-2 space-y-1'>
                    {navigation.map((item) => {
                      const isCurrent = item.href === '/' ? url === '/' : url.startsWith(item.href)
                      return (
                        <Fragment key={item.name}>
                          {item.condition() ? (
                            <li>
                              <a
                                href={item.href}
                                className={classNames(
                                  isCurrent
                                    ? 'bg-indigo-700 text-white'
                                    : 'text-indigo-200 hover:text-white hover:bg-indigo-700',
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}>
                                <item.icon
                                  className={classNames(
                                    isCurrent ? 'text-white' : 'text-indigo-200 group-hover:text-white',
                                    'h-6 w-6 shrink-0'
                                  )}
                                  aria-hidden='true'
                                />
                                {item.name}
                              </a>
                            </li>
                          ) : null}
                        </Fragment>
                      )
                    })}
                  </ul>
                </li>

                {/* <li className='mt-auto'>
                  <a
                    href='#'
                    className='group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-indigo-200 hover:bg-indigo-700 hover:text-white'>
                    <CogIcon className='h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white' aria-hidden='true' />
                    Settings
                  </a>
                </li> */}
              </ul>
            </nav>
          </div>
        </div>

        {/* Contains the top navbar and the content */}
        <div className={`${sidebarAccessible ? 'lg:pl-72' : 'lg:pl-0'}`}>
          {/* Top navbar */}
          {userName ? (
            <div
              className={`sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8`}>
              <button
                type='button'
                className={`${sidebarAccessible ? '' : 'hidden'} -m-2.5 p-2.5 text-gray-700 lg:hidden `}
                onClick={() => setSidebarOpen(true)}>
                <span className='sr-only'>Open sidebar</span>
                <Bars3Icon className='h-6 w-6' aria-hidden='true' />
              </button>

              {/* Separator */}
              <div className='h-6 w-px bg-gray-900/10 lg:hidden' aria-hidden='true' />

              <div className='flex flex-1 gap-x-4 self-stretch lg:gap-x-6'>
                <div className='relative flex flex-1 items-center'>
                  {session.arePersonsEnabled ? (
                    <>
                      <MagnifyingGlassIcon
                        className='h-5 w-5 text-gray-400 cursor-pointer'
                        aria-hidden='true'
                        onClick={() => setPersonSearchOpen(true)}
                      />
                      <div
                        className='pl-3 w-full text-gray-400 align-middle cursor-pointer'
                        onClick={() => setPersonSearchOpen(true)}>
                        Rechercher <span className='hidden sm:inline'>une personne...</span>
                      </div>
                    </>
                  ) : null}
                </div>
                <div className='flex items-center gap-x-4 lg:gap-x-6'>
                  {/* Separator */}
                  {sidebarAccessible ? (
                    <div className='hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10' aria-hidden='true' />
                  ) : null}

                  {/* User profile pic */}
                  {profilePic ? (
                    <img
                      // src='https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80'
                      src={profilePic}
                      className={`inline-block cursor-pointer rounded-full h-10 w-10 bg-white`}
                    />
                  ) : null}

                  {/* Profile dropdown */}
                  <Menu as='div' className='relative'>
                    <div>
                      <Menu.Button className='bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                        <span className='sr-only'>Ouvrir le menu utilisateur</span>
                        {userName}
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter='transition ease-out duration-100'
                      enterFrom='transform opacity-0 scale-95'
                      enterTo='transform opacity-100 scale-100'
                      leave='transition ease-in duration-75'
                      leaveFrom='transform opacity-100 scale-100'
                      leaveTo='transform opacity-0 scale-95'>
                      <Menu.Items className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
                        {session.personId ? (
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href={PersonPageURL(session.personId)}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700 w-full text-left'
                                )}>
                                Mon profil
                              </a>
                            )}
                          </Menu.Item>
                        ) : null}
                        <Menu.Item>
                          {({ active }) => (
                            <form action='/logout' method='post'>
                              <button
                                type='submit'
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700 w-full text-left'
                                )}>
                                Se déconnecter
                              </button>
                            </form>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          ) : null}

          {/* Content */}
          <main>{children}</main>
        </div>
      </div>
    </LoaderProvider>
  )
}

type BannerProps = { position: 'top' | 'static-sidebar' } & (
  | {
      showBanner: false
    }
  | {
      showBanner: true
      familyName: string
    }
)

const FamilyBanner = ({ position, ...props }: BannerProps) => {
  if (!props.showBanner) return null
  const { familyName } = props
  return (
    <div
      className={`${position === 'top' ? 'sticky flex lg:hidden' : ''} ${
        position === 'static-sidebar' ? 'hidden lg:flex' : ''
      } top-0 h-16 items-center bg-yellow-300`}>
      <div className='mx-auto px-2 py-1 h-16 flex text-center place-items-center'>Vous êtes sur "{familyName}"</div>
    </div>
  )
}

type FamilySwitcherProps = {}

const FamilySwitcher = (props: FamilySwitcherProps) => {
  const session = useSession()
  const formRef = React.useRef<HTMLFormElement>(null)

  if (!session.isLoggedIn) return null

  const { userFamilies, currentFamilyId } = session

  if (!userFamilies || userFamilies.length < 2 || !currentFamilyId) return null

  const selected = userFamilies.find(({ familyId }) => familyId === currentFamilyId)!

  if (!selected) return null

  const handleChange = (newFamily: typeof userFamilies[number]) => {
    if (newFamily.familyId === selected.familyId) return

    if (formRef.current !== null) {
      const form = formRef.current

      const inputs = form.getElementsByTagName('input')

      const newFamilyIdInput = Array.from(inputs).find((input) => input.name === 'newFamilyId')

      if (newFamilyIdInput) {
        newFamilyIdInput.value = newFamily.familyId
      }

      form.submit()
    }
  }

  return (
    <div className='max-w-fit'>
      <form method='POST' action='/switchFamily' ref={formRef}>
        <input type='hidden' name='newFamilyId' value={selected.familyId} />
        <ClientOnly>
          <InputWithUrl />
        </ClientOnly>
      </form>
      <Listbox value={selected} onChange={handleChange}>
        {({ open }) => (
          <>
            <Listbox.Label className='sr-only'>Changer de famille</Listbox.Label>
            <div className='relative'>
              <div className='inline-flex divide-x divide-indigo-700 rounded-md shadow-sm'>
                <Listbox.Button className='-mx-2 inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-sm text-white border-1 ring-1 ring-inset ring-indigo-200 shadow-sm hover:bg-white/20'>
                  <ChevronDownIcon className='-ml-0.5 h-5 w-5 text-white' aria-hidden='true' />
                  Changer d'espace
                  <span className='sr-only'>Changer de famille</span>
                </Listbox.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                leave='transition ease-in duration-100'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'>
                <Listbox.Options className='absolute -left-2 z-50 mt-2 w-64 origin-top-left divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                  {userFamilies.map((family) => (
                    <Listbox.Option
                      key={family.familyId}
                      className={({ active }) =>
                        classNames(active ? 'bg-indigo-100' : '', 'cursor-default rounded-md select-none p-4 text-sm')
                      }
                      value={family}>
                      {({ selected, active }) => (
                        <div className={`${selected ? '' : 'cursor-pointer'} flex flex-col`}>
                          <div className='flex justify-between'>
                            <p className={selected ? 'font-semibold' : 'font-normal'}>{family.familyName}</p>
                            {selected ? (
                              <span className={'text-indigo-600'}>
                                <CheckIcon className='h-5 w-5' aria-hidden='true' />
                              </span>
                            ) : null}
                          </div>
                          <p className={classNames('mt-2 text-gray-500')}>{family.about}</p>
                        </div>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  )
}

function InputWithUrl() {
  return <input type='hidden' name='currentPage' value={window.location.href} />
}
