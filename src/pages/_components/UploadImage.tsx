import * as React from 'react'

interface UploadImageProps {
  redirectTo?: string
  autoTagPerson?: string
  title?: string
  subtitle?: string
}

export const UploadImage = ({ title, subtitle, ...props }: UploadImageProps) => {
  return (
    <div className='bg-white shadow sm:rounded-lg max-w-fit'>
      <div className='px-4 py-5 sm:p-6'>
        <h3 className='text-lg leading-6 font-medium text-gray-900'>{title || 'Ajouter une photo'}</h3>
        {subtitle && (
          <div className='mt-2 max-w-xl text-sm text-gray-500'>
            <p>{subtitle}</p>
          </div>
        )}
        <UploadImageRaw {...props} />
      </div>
    </div>
  )
}

export const UploadImageRaw = ({ redirectTo, autoTagPerson }: UploadImageProps) => {
  return (
    <form method='post' action='/a/upload-image' encType='multipart/form-data' className='mt-5 sm:flex sm:items-center'>
      {!!redirectTo && <input type='hidden' name='redirectTo' value={redirectTo} />}
      {autoTagPerson && <input type='hidden' name='autoTagPerson' value={autoTagPerson} />}
      <div className='w-full sm:max-w-xs'>
        <label htmlFor='email' className='sr-only'>
          Photo
        </label>
        <input
          type='file'
          name='image'
          className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md'
        />
      </div>
      <button
        type='submit'
        className='mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'>
        Envoyer
      </button>
    </form>
  )
}
