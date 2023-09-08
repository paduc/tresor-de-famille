import React from 'react'

const sharedButtonStyles =
  'cursor-pointer inline-flex items-center px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm'

export const primaryButtonStyles = `${sharedButtonStyles} text-white bg-indigo-600 hover:bg-indigo-700`

export const primaryGreenButtonStyles = `${sharedButtonStyles} text-white bg-green-600 hover:bg-green-700`

const sharedSecondaryButtonStyles = 'bg-white ring-inset ring-2 hover:text-white'

export const secondaryButtonStyles = `${sharedButtonStyles} ${sharedSecondaryButtonStyles} text-indigo-600 bg-white hover:bg-indigo-600 ring-indigo-600`

export const secondaryGreenButtonStyles = `${sharedButtonStyles} ${sharedSecondaryButtonStyles} text-green-600 bg-white hover:bg-green-600 ring-green-600`

export const secondaryRedButtonStyles = `${sharedButtonStyles} ${sharedSecondaryButtonStyles} text-red-600 bg-white hover:bg-red-600 ring-red-600`

export const buttonIconStyles = '-ml-0.5 mr-2 h-6 w-6'

export const linkStyles = 'font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer inline-flex items-center text-md'
