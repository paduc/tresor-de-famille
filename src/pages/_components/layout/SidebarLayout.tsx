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
import React, { Fragment, useContext, useRef, useState } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  MenuIcon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  CogIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XIcon,
  CheckCircleIcon,
  PlusSmIcon,
} from '@heroicons/react/outline'
import { ChevronDownIcon, SearchIcon } from '@heroicons/react/solid'
import { AnnotationIcon, MenuAlt2Icon, PhotographIcon, VideoCameraIcon } from '@heroicons/react/outline'
import { SessionContext } from '../SessionContext'
import { LocationContext } from '../LocationContext'
import { Logo } from '../Logo'
import { InlinePhotoUpload } from '../InlinePhotoUpload'

const navigation = [
  { name: 'Photos', href: '/photos.html', icon: PhotographIcon },
  { name: 'Videos', href: '/videos.html', icon: VideoCameraIcon },
  { name: 'Tous fils', href: '/threads.html', icon: AnnotationIcon, current: true },
]
const teams = [
  { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
  { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
  { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
]

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export type SidebarLayoutProps = {
  children: React.ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const session = useContext(SessionContext)
  const url = useContext(LocationContext)

  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!session.isLoggedIn) {
    return <p>Session not available</p>
  }

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as='div' className='relative z-50 lg:hidden' onClose={setSidebarOpen}>
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
                        <XIcon className='h-6 w-6 text-white' aria-hidden='true' />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className='flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6 pb-4'>
                    <div className='flex h-16 shrink-0 items-center'>
                      <Logo className='h-10 w-auto invert mix-blend-luminosity' />
                      <span className='group ml-3 text-indigo-100 rounded-md flex items-center text-md font-md'>
                        Trésor de famille
                      </span>
                    </div>
                    <nav className='flex flex-1 flex-col'>
                      <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                        <li>
                          <ul role='list' className='-mx-2 mt-2 space-y-3'>
                            <li>
                              <a
                                href='/chat.html'
                                className='button inline-flex items-center gap-x-1.5 rounded-md  px-2.5 py-1.5 text-sm text-white border-1 ring-1 ring-inset ring-indigo-200 shadow-sm hover:bg-white/20'>
                                <PlusSmIcon className='-ml-0.5 h-5 w-5' aria-hidden='true' />
                                Nouveau fil
                              </a>
                            </li>
                            <li>
                              <InlinePhotoUpload>
                                <span className='button inline-flex items-center gap-x-1.5 rounded-md  px-2.5 py-1.5 text-sm text-white border-1 ring-1 ring-inset ring-indigo-200 shadow-sm hover:bg-white/20'>
                                  <PlusSmIcon className='-ml-0.5 h-5 w-5' aria-hidden='true' />
                                  Nouvelle photo
                                </span>
                              </InlinePhotoUpload>
                            </li>
                          </ul>
                        </li>
                        {/* <li>
                          <div className='text-xs font-semibold leading-6 text-indigo-200'>Vos fils récents</div>
                          <ul role='list' className='-mx-2 mt-2 space-y-1'>
                            {teams.map((team) => (
                              <li key={team.name}>
                                <a
                                  href={team.href}
                                  className={classNames(
                                    team.current
                                      ? 'bg-indigo-700 text-white'
                                      : 'text-indigo-200 hover:text-white hover:bg-indigo-700',
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
                              const isCurrent = url.startsWith(item.href)
                              return (
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
        <div className='hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col'>
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className='flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6 pb-4'>
            <div className='flex h-16 shrink-0 items-center'>
              <Logo className='h-10 w-auto invert mix-blend-luminosity' />
            </div>
            <nav className='flex flex-1 flex-col'>
              <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                <li>
                  <ul role='list' className='-mx-2 mt-2 space-y-3'>
                    <li>
                      <a
                        href='/chat.html'
                        className='button inline-flex items-center gap-x-1.5 rounded-md  px-2.5 py-1.5 text-sm text-white border-1 ring-1 ring-inset ring-indigo-200 shadow-sm hover:bg-white/20'>
                        <PlusSmIcon className='-ml-0.5 h-5 w-5' aria-hidden='true' />
                        Nouveau fil
                      </a>
                    </li>
                    <li>
                      <InlinePhotoUpload>
                        <span className='button inline-flex items-center gap-x-1.5 rounded-md  px-2.5 py-1.5 text-sm text-white border-1 ring-1 ring-inset ring-indigo-200 shadow-sm hover:bg-white/20'>
                          <PlusSmIcon className='-ml-0.5 h-5 w-5' aria-hidden='true' />
                          Nouvelle photo
                        </span>
                      </InlinePhotoUpload>
                    </li>
                  </ul>
                </li>
                {/* <li>
                  <div className='text-xs font-semibold leading-6 text-indigo-200'>Vos fils récents</div>
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
                      const isCurrent = url.startsWith(item.href)
                      return (
                        <li key={item.name}>
                          <a
                            href={item.href}
                            className={classNames(
                              isCurrent ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:text-white hover:bg-indigo-700',
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

        <div className='lg:pl-72'>
          <div className='sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8'>
            <button type='button' className='-m-2.5 p-2.5 text-gray-700 lg:hidden' onClick={() => setSidebarOpen(true)}>
              <span className='sr-only'>Open sidebar</span>
              <MenuIcon className='h-6 w-6' aria-hidden='true' />
            </button>

            {/* Separator */}
            <div className='h-6 w-px bg-gray-900/10 lg:hidden' aria-hidden='true' />

            <div className='flex flex-1 gap-x-4 self-stretch lg:gap-x-6'>
              <form className='relative flex flex-1' action='#' method='GET'>
                {/* <label htmlFor='search-field' className='sr-only'>
                  Search
                </label>
                <SearchIcon
                  className='pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400'
                  aria-hidden='true'
                />
                <input
                  id='search-field'
                  className='block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm'
                  placeholder='Search...'
                  type='search'
                  name='search'
                /> */}
              </form>
              <div className='flex items-center gap-x-4 lg:gap-x-6'>
                {/* Separator */}
                <div className='hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10' aria-hidden='true' />

                {/* Profile dropdown */}
                <Menu as='div' className='relative'>
                  <div>
                    <Menu.Button className='bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                      <span className='sr-only'>Ouvrir le menu utilisateur</span>
                      {session.userName}
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

          <main>{children}</main>
        </div>
      </div>
    </>
  )
}
