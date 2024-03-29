import * as React from 'react'
import { FaceId } from '../../../domain/FaceId.js'

export const HoverContext = React.createContext<{
  hoveredFaceId: FaceId | null
  setHoveredFaceId: (faceId: FaceId | null) => void
}>(undefined!)

export const HoverProvider = ({ children }: { children: React.ReactNode }) => {
  const [hoveredFaceId, setHoveredFaceId] = React.useState<FaceId | null>(null)

  return <HoverContext.Provider value={{ hoveredFaceId, setHoveredFaceId }}>{children}</HoverContext.Provider>
}
