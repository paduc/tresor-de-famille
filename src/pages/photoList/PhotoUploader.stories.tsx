import * as React from 'react'
import { PhotoUploader } from './PhotoUploader'
import { QueryClient, QueryClientProvider } from 'react-query'
import { rest } from 'msw'

export default {
  title: 'Uploader de Photos',
  component: PhotoUploader,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        rest.post('/upload-image', (req, res, ctx) => {
          console.log('Upload captured by msw')
          return res(ctx.status(200))
        }),
        rest.get('/user', (req, res, ctx) => {
          console.log('Choppé depuis le fichier stories')
          return res(
            ctx.json({
              firstName: 'Neil',
              lastName: 'Maverick',
            })
          )
        }),
      ],
    },
  },
}

const queryClient = new QueryClient()

export const PageVide = () => (
  <QueryClientProvider client={queryClient}>
    <PhotoUploader />
  </QueryClientProvider>
)
