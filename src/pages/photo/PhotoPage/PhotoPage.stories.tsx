import * as React from 'react'
import { SessionContext } from '../../_components'

import { getUuid } from '../../../libs/getUuid'
import { PhotoPage } from './PhotoPage'
import { AWSDetectedFacesInPhoto } from '../recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { UserAddedCaptionToPhoto } from '../UserAddedCaptionToPhoto'
import { PhotoAnnotatedUsingOpenAI } from '../annotatePhotoUsingOpenAI/PhotoAnnotatedUsingOpenAI'
import type { SearchIndex } from 'algoliasearch/lite'
import { PersonSearchContext } from '../../_components/usePersonSearch'

export default { title: 'DEPRECATED Page Photo', component: PhotoPage, parameters: { layout: 'fullscreen' } }

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

const fakePersonSearch = async (query: string) => {
  return { hits: [{ objectID: getUuid(), name: 'John Doe' }] }
}

const ghost2FaceId = getUuid()
const ghost3FaceId = getUuid()
const ghost4FaceId = getUuid()
const ghost4PersonId = getUuid()
const ghost3PersonId = getUuid()
const ghost2PersonId = getUuid()
export const PhotoAvecAnnotations = () => (
  <SessionContext.Provider value={{ isLoggedIn: true, userName: 'toto', isAdmin: false }}>
    <PersonSearchContext.Provider value={{ search: fakePersonSearch } as unknown as SearchIndex}>
      <PhotoPage
        photoId={getUuid()}
        url={
          'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=4032&h=3024&q=80'
        }
        confirmedPersons={[
          {
            faceId: totoFaceId,
            person: { id: getUuid(), name: 'Tata' },
            position: {
              width: 0.3004770278930664,
              height: 0.39314860105514526,
              left: 0.3541097640991211,
              top: 0.24908018112182617,
            },
          },
          {
            faceId: ghost2FaceId,
            person: { id: ghost2PersonId, name: 'Ghost 2' },
            position: {
              width: 0.3004770278930664,
              height: 0.39314860105514526,
              left: 0.3541097640991211,
              top: 0.24908018112182617,
            },
          },
          {
            faceId: ghost4FaceId,
            person: { id: ghost3PersonId, name: 'Ghost 3' },
            position: {
              width: 0.3004770278930664,
              height: 0.39314860105514526,
              left: 0.3541097640991211,
              top: 0.24908018112182617,
            },
          },
          {
            faceId: ghost3FaceId,
            person: { id: getUuid(), name: 'Other nope' },
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
          [ghost2PersonId]: { name: 'Ghost 2' },
          [ghost3PersonId]: { name: 'Ghost 3' },
          [ghost4PersonId]: { name: 'Ghost 4' },
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
              {
                awsFaceId: '',
                confidence: 1,
                faceId: ghost2FaceId,
                position: {
                  Width: 0.2,
                  Height: 0.2,
                  Left: 0.8,
                  Top: 0,
                },
              },
              {
                awsFaceId: '',
                confidence: 1,
                faceId: ghost3FaceId,
                position: {
                  Width: 0.2,
                  Height: 0.2,
                  Left: 0.8,
                  Top: 0.8,
                },
              },
              {
                awsFaceId: '',
                confidence: 1,
                faceId: ghost4FaceId,
                position: {
                  Width: 0.2,
                  Height: 0.2,
                  Left: 0,
                  Top: 0.8,
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
              {
                type: 'face-is-person',
                faceId: ghost2FaceId,
                personId: ghost2PersonId,
                deductionId: getUuid(),
                photoId: getUuid(),
              },
              {
                type: 'face-is-new-person',
                faceId: ghost3FaceId,
                personId: ghost4PersonId,
                name: 'Nope',
                deductionId: getUuid(),
                photoId: getUuid(),
              },

              {
                type: 'face-is-person',
                faceId: ghost4FaceId,
                personId: ghost4PersonId,
                deductionId: getUuid(),
                photoId: getUuid(),
              },
            ],
          }),
        ]}
      />
    </PersonSearchContext.Provider>
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
