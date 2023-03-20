import * as React from 'react'
import { UUID } from '../../../domain'

export const HoverContext = React.createContext<{
  hoveredFaceId: UUID | null
  setHoveredFaceId: (faceId: UUID | null) => void
}>(undefined!)

export const HoverProvider = ({ children }: { children: React.ReactNode }) => {
  const [hoveredFaceId, setHoveredFaceId] = React.useState<UUID | null>(null)

  return <HoverContext.Provider value={{ hoveredFaceId, setHoveredFaceId }}>{children}</HoverContext.Provider>
}
