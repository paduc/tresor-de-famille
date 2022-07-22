import React from 'react'

export type LayoutProps = {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {

  return (
    <html className='h-full bg-gray-100'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <link href='style.css' rel='stylesheet' />
      </head>
      <body className='h-full overflow-hidden'>{children}</body>
    </html>
  )
}
