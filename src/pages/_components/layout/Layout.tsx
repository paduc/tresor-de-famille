import React from 'react'

export type BareLayoutProps = {
  children: React.ReactNode
}

export function BareLayout({ children }: BareLayoutProps) {
  return <>{children}</>
}
