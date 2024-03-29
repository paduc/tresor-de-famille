import { createContext, useContext } from 'react'
import { PhotoId } from '../../../../domain/PhotoId.js'

export const RemovePhotoCtx = createContext<((photoId: PhotoId) => unknown) | null>(null)

export const useRemovePhoto = () => {
  const removePhoto = useContext(RemovePhotoCtx)
  if (removePhoto === null) {
    throw new Error('This hook should only be used in a proper Provider')
  }

  return removePhoto
}
