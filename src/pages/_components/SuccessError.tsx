import React from 'react'

export const SuccessError = (props: { error?: string; success?: string }) => {
  const { success, error } = props
  return (
    <>
      {Boolean(success) && (
        <div className='rounded-md bg-green-50 p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              {/* <CheckCircleIcon className='h-5 w-5 text-green-400' aria-hidden='true' /> */}
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-green-800'>{success}</h3>
              <div className='mt-2 text-sm text-green-700'>
                <p></p>
              </div>
            </div>
          </div>
        </div>
      )}
      {Boolean(error) && (
        <div className='rounded-md bg-red-50 p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>{/* <XCircleIcon className='h-5 w-5 text-red-400' aria-hidden='true' /> */}</div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-red-800'>{error}</h3>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
