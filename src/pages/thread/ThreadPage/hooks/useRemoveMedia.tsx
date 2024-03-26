import { createContext, useContext } from 'react'
import { MediaId } from '../../../../domain/MediaId'

export const RemoveMediaCtx = createContext<((mediaId: MediaId) => unknown) | null>(null)

export const useRemoveMedia = () => {
  const removeMedia = useContext(RemoveMediaCtx)
  if (removeMedia === null) {
    throw new Error('This hook should only be used in a proper Provider')
  }

  return removeMedia
}
