import * as React from 'react'
import { AppLayout } from '../_components/layout/AppLayout'

export const ImportGedcomPage = () => {
  return (
    <AppLayout>

      <div className="bg-white h-screen	">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
             C'est ici que tout commence.
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
             Partagez-nous un fichier <span className='italic'>.gedcom</span> ou commencer à construire votre arbre généalogique vous même, c'est à vous de choisir !
            </p>
          </div>
        </div>
        <div className='flex mx-6'>
          <div className='flex-1'>
            <form method='post' encType='multipart/form-data'>
              <div className='mt-1 sm:mt-0 sm:col-span-2 flex flex-col items-center	'>
                <div className='max-w-lg  w-full flex justify-center item-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'>
                  <div className='space-y-1 text-center'>
                    <svg
                      className='mx-auto h-12 w-12 text-gray-400'
                      stroke='currentColor'
                      fill='none'
                      viewBox='0 0 48 48'
                      aria-hidden='true'>
                      <path
                        d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                        strokeWidth={2}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    <div className='flex text-sm text-gray-600'>
                      <label
                        htmlFor='file-upload'
                        className='relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500'>
                        <span>Upload a file</span>
                        <input id='file-upload' name='file-upload' type='file' className='sr-only' />
                      </label>
                      <p className='pl-1'>or drag and drop</p>
                    </div>
                    <p className='text-xs text-gray-500'>.gedcom only, up to 10MB</p>
                  </div>
                </div>
                <div className=' flex justify-center item-center'>
                  <button
                    type='submit'
                    className=' flex align-middle  mt-3 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                    <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                    <span> Upload </span>
                  </button>
                </div>
              </div>
              
            </form>
          </div>
          <div className='flex flex-1 items-center  justify-center'>
            <button
              className='px-3 py-2 items-center	 border border-transparent shadow-xl text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
              <span className='flex flex-col items-center'> Je créer mon arbre manuellement  
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg> 
              </span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
