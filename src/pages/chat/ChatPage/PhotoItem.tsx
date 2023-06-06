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
    descriptionOfPeople += `${descriptionOfPeople ? 'et ' : ''}${unrecognizedFacesInPhoto} visages inconnus`
  } else {
    if (descriptionOfPeople.length > 70) descriptionOfPeople = `${descriptionOfPeople.substring(0, 70)}...`
  }

  return (
    <ChatItem>
      <div className='bg-gray-200'>
        <div className='grid grid-cols-1 w-full sm:max-w-2xl sm:mx-auto pb-2 lg:mx-0 lg:pl-8'>
          <a href={`/photo/${props.photoId}/photo.html`}>
            <img src={url} className='max-w-full' />
          </a>
          <p className='text-sm py-2 px-2 sm:px-0'>{description || descriptionOfPeople}</p>
          <p>
            <a
              href={`/photo/${props.photoId}/photo.html`}
              className='text-sm font-medium ml-2 sm:ml-0 text-indigo-600 hover:text-indigo-500'>
              Annoter
            </a>
            {description || descriptionOfPeople ? (
              <a
                href={`/photo/${props.photoId}/photo.html`}
                className='text-sm font-medium ml-2 text-indigo-600 hover:text-indigo-500'>
                En savoir plus...
              </a>
            ) : null}
          </p>
        </div>
      </div>
    </ChatItem>
  )
}
