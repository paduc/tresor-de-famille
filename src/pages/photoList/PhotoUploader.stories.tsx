import * as React from 'react'
import { PhotoUploader } from './PhotoUploader'
import { QueryClient, QueryClientProvider } from 'react-query'

export default {
  title: 'Uploader de Photos',
  component: PhotoUploader,
  parameters: {
    layout: 'fullscreen',
  },
}

const queryClient = new QueryClient()

export const PageVide = () => (
  <QueryClientProvider client={queryClient}>
    <PhotoUploader />
  </QueryClientProvider>
)
