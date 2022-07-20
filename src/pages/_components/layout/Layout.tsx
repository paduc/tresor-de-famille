import React, { useContext } from 'react'
import { SessionContext } from '../SessionContext'

export type LayoutProps = {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { isLoggedIn } = useContext(SessionContext)

  return (
    <html>
      <head>
        <link href='style.css' rel='stylesheet' />
      </head>
      <body>
        <div style={{ padding: '30px 0' }}>{children}</div>
      </body>
    </html>
  )
}
