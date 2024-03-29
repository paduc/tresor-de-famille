import { PlusIcon } from '@heroicons/react/24/outline'
import * as React from 'react'
import { FaceId } from '../../domain/FaceId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'
import { PhotoId } from '../../domain/PhotoId.js'
import { ThreadId } from '../../domain/ThreadId.js'
import { withBrowserBundle } from '../../libs/ssr/withBrowserBundle.js'
import { buttonIconStyles, linkStyles, primaryButtonStyles, smallButtonStyles } from '../_components/Button.js'
import { ClientOnly } from '../_components/ClientOnly.js'
import { useLoggedInSession, useSession } from '../_components/SessionContext.js'
import { ThreadList } from '../_components/ThreadList.js'
import { AppLayout } from '../_components/layout/AppLayout.js'
import { usePersonSearch } from '../_components/usePersonSearch.js'
import { ThreadListPageUrl } from '../threadList/ThreadListPageUrl.js'

type Steps = GetUserName
export type HomePageProps =
  | {
      isOnboarding: true
      steps: Steps
    }
  | {
      isOnboarding: false
      latestThreads: {
        threadId: ThreadId
        title: string | undefined
        lastUpdatedOn: number
        authors: {
          name: string
        }[]
        contents: string
        thumbnails: string[]
        familyIds: FamilyId[]
        commentCount: number
      }[]
      hasMoreThreads: boolean
    }

export const HomePage = withBrowserBundle((props: HomePageProps) => {
  const session = useLoggedInSession()
  const { isOnboarding } = props

  if (isOnboarding) {
    const { steps } = props

    if (steps['get-user-name'] === 'pending') {
      return (
        <Wrapper>
          <GetUserName />
        </Wrapper>
      )
    }
  }

  return (
    <Wrapper>
      {!props.isOnboarding && props.latestThreads.length ? (
        <div className='mt-3'>
          {session.userFamilies.length > 1 ? (
            <Paragraph>Les nouveautés dans votre famille</Paragraph>
          ) : (
            <Paragraph>Reprenez vos derniers souvenirs</Paragraph>
          )}

          <div className='-mt-2'>
            <a href='/thread.html' className={`${linkStyles} text-base`}>
              + Démarrer une nouvelle anecdote
            </a>
          </div>
          <div className='mt-3 bg-white border border-gray-300 shadow-sm -mx-4 sm:max-w-lg md:max-w-xl'>
            <ThreadList threads={props.latestThreads} />
            {props.hasMoreThreads ? (
              <a
                href={ThreadListPageUrl}
                className={`${linkStyles} w-full justify-center sm:justify-start -mt-1 py-6 px-6 border-t border-gray-200 shadow-sm sm:max-w-lg md:max-w-xl`}>
                Voir plus de souvenirs
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      <a href='/thread.html' className={`${primaryButtonStyles} mt-5`}>
        <PlusIcon className={`${buttonIconStyles}`} />
        Créer une nouvelle anecdote familiale
      </a>
    </Wrapper>
  )
})

function Wrapper({ children }: React.PropsWithChildren) {
  const session = useSession()

  if (!session.isLoggedIn) return null

  const UserName = () =>
    session.userName ? (
      <span className='block text-indigo-600'>{session.userName}</span>
    ) : (
      <span className='block text-indigo-600'>illustre inconnu</span>
    )

  return (
    <AppLayout>
      <div className='px-4 py-6 md:px-8 md:py-12'>
        <h2 className='text-3xl font-bold tracking-tight text-gray-900 md:text-4xl'>
          <span className='block'>Bienvenue sur Trésor de famille</span>
          <div>
            {session.profilePic ? (
              <div className='mt-2 inline-flex items-center'>
                <img
                  src={session.profilePic}
                  className={`inline-block cursor-pointer rounded-full h-16 w-16 bg-white ring-2 ring-white mr-2`}
                />
                <UserName />
              </div>
            ) : (
              <UserName />
            )}
          </div>
        </h2>
        {children}
      </div>
    </AppLayout>
  )
}

function Paragraph({ children, className }: { className?: string } & React.PropsWithChildren) {
  return <div className={`text-gray-500 text-xl py-3 pb-2 max-w-3xl ${className}`}>{children}</div>
}

export type GetUserName =
  | {
      'get-user-name': 'pending'
    }
  | {
      'get-user-name': 'done'
      name: string
      personId: PersonId
    }

export type UploadProfilePicture =
  | {
      'upload-profile-picture': 'pending'
    }
  | {
      'upload-profile-picture': 'photo-uploaded'
      photoId: PhotoId
      photoUrl: string
      faces: {
        faceId: FaceId
      }[]
    }
  | {
      'upload-profile-picture': 'user-face-confirmed'
      photoId: PhotoId
      photoUrl: string
      faceId: FaceId
    }

function GetUserName() {
  return (
    <div className='pb-5'>
      <div className='text-xl pt-6 text-gray-500'>Faisons connaissance ! Pour commencer, comment vous appelez-vous ?</div>
      <div className='sm:max-w-sm mt-4'>
        <ClientOnly>
          <PersonAutocomplete />
        </ClientOnly>
        {/* <form method='POST' className='relative space-y-6'>
          <input type='hidden' name='action' value='submitPresentation' />
          <div className='overflow-hidden border border-gray-200 shadow-sm sm:max-w-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
            <label htmlFor='presentation' className='sr-only'>
              Nom complet
            </label>
            <input
              type='text'
              autoFocus
              name='presentation'
              className='block w-full resize-none border-0 py-3 focus:ring-0 text-xl'
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
          <button type='submit' className={primaryButtonStyles}>
            <SendIcon className={buttonIconStyles} aria-hidden='true' />
            Envoyer
          </button>
        </form> */}
      </div>
    </div>
  )
}

type SearchPersonHitDTO = {
  objectID: string
  name: string
  bornOn?: string
  sex?: 'M' | 'F'
  familyId: FamilyId
}

type PersonAutocompleteProps = {
  className?: string
  selectedPersonName?: string
}

const PersonAutocomplete = ({ className, selectedPersonName }: PersonAutocompleteProps) => {
  const [query, setQuery] = React.useState('')
  const index = usePersonSearch()

  const { userFamilies } = useLoggedInSession()
  function getFamilyName(familyId: FamilyId) {
    return userFamilies.find((f) => f.familyId === familyId)?.familyName
  }

  const [hits, setHits] = React.useState<SearchPersonHitDTO[]>([])

  React.useEffect(() => {
    if (!index) return

    const fetchResults = async () => {
      if (query === '') {
        setHits([])
        return
      }
      const { hits } = await index.search(query)
      setHits(hits as SearchPersonHitDTO[])
    }

    fetchResults()
  }, [index, setHits, query])

  return (
    <div className={`relative ${className || ''}`}>
      <div className='w-full min-w-screen overflow-hidden shadow-sm border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
        <input
          role='combobox'
          type='text'
          aria-expanded='true'
          aria-autocomplete='list'
          name='newName'
          autoFocus
          defaultValue={selectedPersonName || ''}
          className='block w-full resize-none border-0 py-3 px-4 focus:ring-0 text-base'
          onChange={(event) => setQuery(event.target.value.trim())}
        />
      </div>
      <div>
        <form method='POST'>
          <input type='hidden' name='action' value='setUserPerson' />
          <ul role='list' className='divide-y divide-gray-100'>
            {query.length > 0 && !firstHitStartsWithQuery(hits, query) ? <NewPersonFromQuery query={query} /> : null}
            {hits.map((hit) => (
              <li key={`hit_${hit.objectID}`} className='flex items-center justify-between gap-x-6 py-5'>
                <div className='flex min-w-0 gap-x-4'>
                  {/* <img className='h-12 w-12 flex-none rounded-full bg-gray-50' src={person.imageUrl} alt='' /> */}
                  <div className='min-w-0 flex-auto'>
                    <p className=''>{hit.name}</p>
                    {hit.bornOn ? (
                      <p className='mt-1 truncate text-xs leading-5 text-gray-500'>
                        {hit.sex === 'F' ? 'née le ' : 'né le '}
                        {hit.bornOn}
                      </p>
                    ) : (
                      ''
                    )}
                    <div className='mt-1 w-60 text-xs text-gray-500'>
                      Cette personne est dans{' '}
                      {getFamilyName(hit.familyId) ? `${getFamilyName(hit.familyId)}` : 'une autre famille'}.
                    </div>
                  </div>
                </div>
                <button
                  type='submit'
                  name='existingPersonId'
                  value={hit.objectID}
                  className={`${primaryButtonStyles} ${smallButtonStyles}`}>
                  C'est moi
                </button>
              </li>
            ))}
            {query.length > 0 && firstHitStartsWithQuery(hits, query) ? <NewPersonFromQuery query={query} /> : null}
          </ul>
        </form>
        {/* <a
          href='#'
          className='flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0'>
          Voir plus
        </a> */}
      </div>
    </div>
  )
}
function NewPersonFromQuery({ query }: { query: string }) {
  return (
    <li key={`hit_new_object`} className='flex items-center justify-between gap-x-6 py-5'>
      <div className='flex min-w-0 gap-x-4'>
        <div className='min-w-0 flex-auto'>
          <p className=''>{query}</p>
          <p className='mt-1 truncate text-xs leading-5 text-gray-500'>Si vous n'êtes pas dans la liste</p>
        </div>
      </div>
      <button type='submit' name='newPersonWithName' value={query} className={`${primaryButtonStyles} ${smallButtonStyles}`}>
        Créer
      </button>
    </li>
  )
}

function firstHitStartsWithQuery(hits: SearchPersonHitDTO[], query: string) {
  return hits[0]?.name.toLowerCase().startsWith(query.toLowerCase())
}
