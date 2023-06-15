import * as React from 'react'
import { ChatItem } from './ChatPage'
import { UUID } from '../../../domain/UUID'

export type PhotoItemProps = {
  photoId: UUID
  url: string
  description?: string
  personsInPhoto: string[]
  unrecognizedFacesInPhoto: number
}

export const PhotoItem = (props: PhotoItemProps) => {
  const { description, url, personsInPhoto, unrecognizedFacesInPhoto } = props
  let descriptionOfPeople = personsInPhoto.join(', ')

  if (unrecognizedFacesInPhoto) {
    if (descriptionOfPeople.length > 35) {
      descriptionOfPeople = `${descriptionOfPeople.substring(0, 40)}...`
    }
    descriptionOfPeople += `${descriptionOfPeople ? ' et ' : ''}${unrecognizedFacesInPhoto} visage(s) inconnu(s)`
  } else {
    if (descriptionOfPeople.length > 70) descriptionOfPeople = `${descriptionOfPeople.substring(0, 70)}...`
  }

  return (
    <ChatItem>
      <div className='bg-gray-200'>
        <div className='grid grid-cols-1 w-full pb-2'>
          <a href={`/photo/${props.photoId}/photo.html`}>
            <img src={url} className='max-w-full md:px-8' />
          </a>
          <p className='sm:text-sm text-md px-4 sm:px-8 py-2'>{description || descriptionOfPeople}</p>
          <p className='sm:text-sm text-md px-4 sm:px-8'>
            <a href={`/photo/${props.photoId}/photo.html`} className='font-medium text-indigo-600 hover:text-indigo-500'>
              Annoter
            </a>
            {description || descriptionOfPeople ? (
              <a href={`/photo/${props.photoId}/photo.html`} className='font-medium ml-2 text-indigo-600 hover:text-indigo-500'>
                En savoir plus...
              </a>
            ) : null}
          </p>
        </div>
      </div>
    </ChatItem>
  )
}
