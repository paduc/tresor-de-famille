import React from 'react'
import { withBrowserBundle } from '../../../libs/ssr/withBrowserBundle'

type NewPhotoPageProps = {}

export const NewPhotoPage = withBrowserBundle(({}: NewPhotoPageProps) => {
  return <div>New Photo Page</div>
})
