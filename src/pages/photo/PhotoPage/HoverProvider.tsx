import * as React from 'react'

export const HoverContext = React.createContext<{
  hoveredFaceId: string | null
  setHoveredFaceId: (faceId: string | null) => void
}>(undefined!)

export const HoverProvider = ({ children }: { children: React.ReactNode }) => {
  const [hoveredFaceId, setHoveredFaceId] = React.useState<string | null>(null)

  return <HoverContext.Provider value={{ hoveredFaceId, setHoveredFaceId }}>{children}</HoverContext.Provider>
}
