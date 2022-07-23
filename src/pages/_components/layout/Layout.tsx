import React from 'react'

export type LayoutProps = {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return <>{children}</>
}
