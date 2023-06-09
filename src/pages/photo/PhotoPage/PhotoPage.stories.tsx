import * as React from 'react'
import { SessionContext } from '../../_components'

import { getUuid } from '../../../libs/getUuid'
import { PhotoPage } from './PhotoPage'

export default { title: 'Page Photo', component: PhotoPage, parameters: { layout: 'fullscreen' } }

const t0 = Date.now()
const HOUR = 3600 * 1000

// export const ApresUploadPhotoLarge = () => (
//   <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
//     <PhotoPage
//       photo={{
//         id: getUuid(),
//         url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=4032&h=3024&q=80',
//       }}
//     />
//   </SessionContext.Provider>
// )
// export const ApresUploadPhotoHaute = () => (
//   <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
//     <PhotoPage
//       photo={{
//         id: getUuid(),
//         url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=3024&h=4032&q=80',
//       }}
//     />
//   </SessionContext.Provider>
// )

// export const PhotoAvecVisagesInconnu = () => (
//   <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
//     <PhotoPage
//       photo={{
//         id: getUuid(),
//         url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=4032&h=3024&q=80',
//         faces: [
//           {
//             person: null,
//             faceId: getUuid(),
//             position: {
//               width: 0.3004770278930664,
//               height: 0.39314860105514526,
//               left: 0.3541097640991211,
//               top: 0.24908018112182617,
//             },
//           },
//         ],
//       }}
//     />
//   </SessionContext.Provider>
// )

export const PhotoAvecVisagesConnus = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <PhotoPage
      photoId={getUuid()}
      url={
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=4032&h=3024&q=80'
      }
      faceDetections={[
        {
          occurredAt: Date.now(),
          faces: [
            {
              person: {
                name: 'Toto',
              },
              faceId: getUuid(),
              position: {
                width: 0.3004770278930664,
                height: 0.39314860105514526,
                left: 0.3541097640991211,
                top: 0.24908018112182617,
              },
            },
            {
              person: null,
              faceId: getUuid(),
              position: {
                width: 0.2,
                height: 0.2,
                left: 0,
                top: 0,
              },
            },
          ],
        },
      ]}
    />
  </SessionContext.Provider>
)

export const PhotoAvecLegende = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <PhotoPage
      photoId={getUuid()}
      url={
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=4032&h=3024&q=80'
      }
      caption={
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam.'
      }
      faceDetections={[]}
    />
  </SessionContext.Provider>
)
