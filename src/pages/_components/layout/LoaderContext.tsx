import React, { useState } from 'react'
import { HeartIcon } from '@heroicons/react/24/outline'

export const LoaderContext = React.createContext<
  { isVisible: boolean; setVisibility: (isVisible: boolean) => unknown } | undefined
>(undefined)

export const useLoader = () => {
  const context = React.useContext(LoaderContext)

  if (!context) {
    throw new Error('Cannot useLoader outside of Provider')
  }

  return context
}

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setVisibility] = useState(false)

  return (
    <>
      {isVisible ? (
        <>
          <div className='fixed inset-0 bg-gray-900/80 z-50' />
          <div className='fixed inset-0 z-50 w-screen overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0'>
              <div className=' text-white flex items-center'>
                <HeartIcon className='animate-bounce h-10 w-10' />
                <div className='animate-bounce text-lg ml-2'>Chargement...</div>
              </div>
            </div>
          </div>
        </>
      ) : null}
      <LoaderContext.Provider value={{ isVisible, setVisibility }}>{children}</LoaderContext.Provider>
    </>
  )
}
