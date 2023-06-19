import * as React from 'react'
import { SessionContext } from '../../_components'

import { getUuid } from '../../../libs/getUuid'
import { PhotoPage } from './PhotoPage'
import { AWSDetectedFacesInPhoto } from '../recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { UserAddedCaptionToPhoto } from '../UserAddedCaptionToPhoto'
import { PhotoAnnotatedUsingOpenAI } from '../annotatePhotoUsingOpenAI/PhotoAnnotatedUsingOpenAI'

export default { title: 'Page Photo', component: PhotoPage, parameters: { layout: 'fullscreen' } }

const t0 = Date.now()
const HOUR = 3600 * 1000

const totoFaceId = getUuid()
const ghostFaceId = getUuid()
const totoPersonId = getUuid()
const ghostPersonId = getUuid()
const confirmedDeductionId = getUuid()
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

export const PhotoAvecAnnotations = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <PhotoPage
      photoId={getUuid()}
      url={
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=4032&h=3024&q=80'
      }
      confirmedPersons={[
        {
          faceId: totoFaceId,
          person: { id: getUuid(), name: 'Toto' },
          position: {
            width: 0.3004770278930664,
            height: 0.39314860105514526,
            left: 0.3541097640991211,
            top: 0.24908018112182617,
          },
        },
      ]}
      confirmedDeductions={[confirmedDeductionId]}
      personsByFaceId={{
        [totoFaceId]: [
          { personId: totoPersonId, name: 'Toto' },
          { personId: getUuid(), name: 'Tata' },
        ],
      }}
      personById={{
        [totoPersonId]: { name: 'Toto' },
        [ghostPersonId]: { name: 'Ghost' },
      }}
      annotationEvents={[
        AWSDetectedFacesInPhoto({
          photoId: getUuid(),
          faces: [
            {
              faceId: totoFaceId,
              awsFaceId: '',
              confidence: 1,
              position: {
                Width: 0.3004770278930664,
                Height: 0.39314860105514526,
                Left: 0.3541097640991211,
                Top: 0.24908018112182617,
              },
            },
            {
              awsFaceId: '',
              confidence: 1,
              faceId: ghostFaceId,
              position: {
                Width: 0.2,
                Height: 0.2,
                Left: 0,
                Top: 0,
              },
            },
          ],
        }),
        UserAddedCaptionToPhoto({
          photoId: getUuid(),
          caption: {
            id: getUuid(),
            body: 'This is a picture of Toto and a ghost.',
          },
          addedBy: getUuid(),
        }),
        PhotoAnnotatedUsingOpenAI({
          photoId: getUuid(),
          model: 'model',
          prompt: 'prompt',
          response: 'response',
          deductions: [
            {
              type: 'face-is-person',
              faceId: totoFaceId,
              personId: totoPersonId,
              deductionId: confirmedDeductionId,
              photoId: getUuid(),
            },
            {
              type: 'face-is-new-person',
              faceId: ghostFaceId,
              personId: ghostPersonId,
              name: 'Ghost',
              deductionId: getUuid(),
              photoId: getUuid(),
            },
          ],
        }),
      ]}
    />
  </SessionContext.Provider>
)

// export const PhotoAvecLegende = () => (
//   <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
//     <PhotoPage
//       photoId={getUuid()}
//       url={
//         'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=4032&h=3024&q=80'
//       }
//       caption={
//         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam.'
//       }
//       faceDetections={[]}
//     />
//   </SessionContext.Provider>
// )
